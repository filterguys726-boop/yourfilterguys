"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { sendOrderCreatedNotifications } from "@/lib/order-notifications";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import { getStripe } from "@/lib/stripe";

async function assertAdmin() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Login required.");
  }

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    throw new Error("Admin access required.");
  }
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function ordersPath(error?: unknown) {
  if (!error) {
    return "/admin/orders?recovered=1";
  }

  const message =
    error instanceof Error ? error.message : "The Stripe order could not be recovered.";

  return `/admin/orders?error=${encodeURIComponent(message)}`;
}

function orderUpdatedPath(error?: unknown) {
  if (!error) {
    return "/admin/orders?updated=1";
  }

  const message =
    error instanceof Error ? error.message : "The order could not be updated.";

  return `/admin/orders?error=${encodeURIComponent(message)}`;
}

function orderEmailPath(error?: unknown) {
  if (!error) {
    return "/admin/orders?emailed=1";
  }

  const message =
    error instanceof Error ? error.message : "The order email could not be sent.";

  return `/admin/orders?error=${encodeURIComponent(message)}`;
}

function splitMetadataIds(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

type VariantLookupRow = {
  id: string;
  sku: string;
  product_id: string;
  name: string;
  price_cents: number;
  products:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

function getProductFromVariant(row: VariantLookupRow) {
  return Array.isArray(row.products) ? row.products[0] : row.products;
}

function getProductMetadata(product: string | Stripe.Product | Stripe.DeletedProduct) {
  if (
    typeof product === "string" ||
    ("deleted" in product && product.deleted)
  ) {
    return {};
  }

  return product.metadata;
}

async function notifyRecoveredOrder(orderId: string) {
  try {
    await sendOrderCreatedNotifications(createServiceSupabaseClient(), orderId);
  } catch (error) {
    console.error("Recovered order notification failed", error);
  }
}

export async function recoverStripeOrderAction(formData: FormData) {
  await assertAdmin();

  const sessionId = textValue(formData, "session_id");

  if (!sessionId.startsWith("cs_")) {
    redirect(ordersPath(new Error("Enter a valid Stripe Checkout Session ID.")));
  }

  try {
    const stripe = getStripe();
    const serviceSupabase = createServiceSupabaseClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("That Stripe Checkout Session is not paid yet.");
    }

    const { data: existingOrder, error: existingOrderError } = await serviceSupabase
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existingOrderError) {
      throw existingOrderError;
    }

    if (existingOrder) {
      await notifyRecoveredOrder(existingOrder.id as string);
      revalidatePath("/admin/orders");
      redirect(ordersPath());
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price.product"]
    });
    const sessionProductIds = splitMetadataIds(session.metadata?.product_ids);
    const sessionVariantIds = splitMetadataIds(session.metadata?.variant_ids);
    const { data: variantRows } = sessionVariantIds.length
      ? await serviceSupabase
          .from("product_variants")
          .select("id,sku,product_id,name,price_cents,products:product_id(id,name)")
          .in("id", sessionVariantIds)
      : { data: [] };
    const variantsById = new Map(
      ((variantRows ?? []) as unknown as VariantLookupRow[]).map((variant) => [
        variant.id,
        variant
      ])
    );

    const items = lineItems.data.map((lineItem, index) => {
      const metadata = lineItem.price?.product
        ? getProductMetadata(lineItem.price.product)
        : {};
      const fallbackVariantId = sessionVariantIds[index] ?? "";
      const fallbackProductId = sessionProductIds[index] ?? "";
      const variantId = metadata.variant_id || fallbackVariantId;
      const fallbackVariant = variantId ? variantsById.get(variantId) : undefined;
      const fallbackProduct = fallbackVariant
        ? getProductFromVariant(fallbackVariant)
        : null;
      const quantity = lineItem.quantity ?? 1;
      const unitAmount =
        lineItem.price?.unit_amount ?? fallbackVariant?.price_cents ?? 0;

      return {
        product_id:
          metadata.product_id ||
          fallbackProductId ||
          fallbackVariant?.product_id ||
          "",
        variant_id: variantId,
        sku: metadata.sku || fallbackVariant?.sku || "",
        product_name:
          metadata.product_name ||
          fallbackProduct?.name ||
          lineItem.description?.split(" - ")[0] ||
          "Product",
        variant_name: metadata.variant_name || fallbackVariant?.name || "Variant",
        quantity,
        unit_amount_cents: unitAmount,
        line_total_cents: unitAmount * quantity
      };
    });

    const shippingAddress =
      session.customer_details?.address ?? session.shipping_details?.address ?? null;
    const subtotalCents = session.amount_subtotal ?? 0;
    const totalCents = session.amount_total ?? 0;
    const shippingCents = session.total_details?.amount_shipping ?? 0;
    const taxCents =
      session.total_details?.amount_tax ??
      Math.max(totalCents - subtotalCents - shippingCents, 0);

    const { data: order, error: orderError } = await serviceSupabase
      .from("orders")
      .insert({
        stripe_checkout_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : null,
        payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        customer_id: session.metadata?.customer_id || null,
        customer_email: session.customer_details?.email ?? session.customer_email ?? "",
        status: "confirmed",
        payment_status: "paid",
        fulfillment_status: "pending",
        currency: session.currency ?? "usd",
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_address: shippingAddress
      })
      .select("id")
      .single();

    if (orderError) {
      throw orderError;
    }

    const orderId = order.id as string;
    const { error: orderItemsError } = await serviceSupabase
      .from("order_items")
      .insert(
        items.map((item) => ({
          order_id: orderId,
          product_id: item.product_id || null,
          variant_id: item.variant_id || null,
          product_name: item.product_name,
          variant_name: item.variant_name,
          sku: item.sku,
          quantity: item.quantity,
          unit_amount_cents: item.unit_amount_cents,
          line_total_cents: item.line_total_cents
        }))
      );

    if (orderItemsError) {
      throw orderItemsError;
    }

    for (const item of items) {
      if (!item.variant_id) {
        continue;
      }

      const { data: variant, error: variantError } = await serviceSupabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variant_id)
        .single();

      if (variantError) {
        throw variantError;
      }

      const nextStock = Math.max(
        0,
        Number(variant.stock_quantity ?? 0) - item.quantity
      );
      const { error: stockError } = await serviceSupabase
        .from("product_variants")
        .update({ stock_quantity: nextStock })
        .eq("id", item.variant_id);

      if (stockError) {
        throw stockError;
      }

      const { error: movementError } = await serviceSupabase
        .from("inventory_movements")
        .insert({
          variant_id: item.variant_id,
          quantity_delta: -item.quantity,
          movement_type: "sale",
          reason: "stripe_checkout_recovery",
          reference_type: "order",
          reference_id: orderId
        });

      if (movementError) {
        throw movementError;
      }
    }

    await notifyRecoveredOrder(orderId);
    revalidatePath("/admin/orders");
  } catch (error) {
    redirect(ordersPath(error));
  }

  redirect(ordersPath());
}

type OrderItemRow = {
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  unit_amount_cents: number;
  line_total_cents: number;
};

export async function updateOrderFulfillmentAction(formData: FormData) {
  await assertAdmin();

  const orderId = textValue(formData, "order_id");
  const fulfillmentStatus = textValue(formData, "fulfillment_status");
  const trackingCarrier = textValue(formData, "tracking_carrier");
  const trackingNumber = textValue(formData, "tracking_number");
  const trackingUrl = textValue(formData, "tracking_url");
  const allowedStatuses = new Set([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded"
  ]);

  if (!allowedStatuses.has(fulfillmentStatus)) {
    redirect(orderUpdatedPath(new Error("Choose a valid fulfillment status.")));
  }

  try {
    const supabase = createServiceSupabaseClient();
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        fulfillment_status: fulfillmentStatus,
        tracking_carrier: trackingCarrier || null,
        tracking_number: trackingNumber || null,
        tracking_url: trackingUrl || null,
        shipped_at: fulfillmentStatus === "shipped" ? new Date().toISOString() : null
      })
      .eq("id", orderId)
      .select(
        "id,order_number,customer_email,currency,subtotal_cents,tax_cents,shipping_cents,total_cents,shipping_address,fulfillment_status,tracking_carrier,tracking_number,tracking_url"
      )
      .single();

    if (updateError) {
      throw updateError;
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name,variant_name,sku,quantity,unit_amount_cents,line_total_cents")
      .eq("order_id", orderId);

    if (itemsError) {
      throw itemsError;
    }

    await sendOrderStatusEmail({
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      currency: order.currency,
      subtotalCents: order.subtotal_cents,
      taxCents: order.tax_cents,
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
      fulfillmentStatus: order.fulfillment_status,
      shippingAddress: order.shipping_address,
      trackingCarrier: order.tracking_carrier,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      items: ((items ?? []) as OrderItemRow[]).map((item) => ({
        productName: item.product_name,
        variantName: item.variant_name,
        sku: item.sku,
        quantity: item.quantity,
        unitAmountCents: item.unit_amount_cents,
        lineTotalCents: item.line_total_cents
      }))
    });
  } catch (error) {
    redirect(orderUpdatedPath(error));
  }

  revalidatePath("/admin/orders");
  redirect(orderUpdatedPath());
}

export async function sendOrderEmailAction(formData: FormData) {
  await assertAdmin();

  const orderId = textValue(formData, "order_id");

  try {
    await sendOrderCreatedNotifications(createServiceSupabaseClient(), orderId);
  } catch (error) {
    redirect(orderEmailPath(error));
  }

  revalidatePath("/admin/orders");
  redirect(orderEmailPath());
}
