import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { stripeWebhookSecret } from "@/lib/env";
import { sendOrderCreatedNotifications } from "@/lib/order-notifications";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getProductMetadata(product: string | Stripe.Product | Stripe.DeletedProduct) {
  if (
    typeof product === "string" ||
    ("deleted" in product && product.deleted)
  ) {
    return {};
  }

  return product.metadata;
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

type WebhookOrderItem = {
  product_id: string;
  variant_id: string;
  sku: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_amount_cents: number;
  line_total_cents: number;
};

type DirectCheckoutOrderInput = {
  session: Stripe.Checkout.Session;
  customerEmail: string;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: Record<string, unknown> | null;
  items: WebhookOrderItem[];
};

async function notifyPaidOrder(supabase: SupabaseClient, orderId: string) {
  try {
    await sendOrderCreatedNotifications(supabase, orderId);
  } catch (error) {
    console.error("Order notification email failed", error);
  }
}

async function processCheckoutAtomically(
  supabase: SupabaseClient,
  input: DirectCheckoutOrderInput
) {
  const paymentIntentId =
    typeof input.session.payment_intent === "string"
      ? input.session.payment_intent
      : null;
  const { data: orderId, error } = await supabase.rpc("process_paid_payment", {
    provider_input: "stripe",
    provider_checkout_id_input: input.session.id,
    provider_order_id_input: null,
    provider_payment_id_input: paymentIntentId,
    customer_id_input: input.session.metadata?.customer_id || null,
    customer_email_input: input.customerEmail,
    currency_input: input.session.currency ?? "usd",
    subtotal_cents_input: input.subtotalCents,
    tax_cents_input: input.taxCents,
    shipping_cents_input: input.shippingCents,
    total_cents_input: input.totalCents,
    shipping_address_input: input.shippingAddress,
    items_input: input.items
  });

  if (error) {
    throw error;
  }

  return orderId as string;
}

export async function POST(request: Request) {
  if (!stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is missing." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid Stripe webhook event."
      },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"]
  });
  console.info("Stripe checkout line items loaded", {
    sessionId: session.id,
    count: lineItems.data.length
  });
  const supabase = createServiceSupabaseClient();
  const sessionProductIds = splitMetadataIds(session.metadata?.product_ids);
  const sessionVariantIds = splitMetadataIds(session.metadata?.variant_ids);
  const { data: variantRows } = sessionVariantIds.length
    ? await supabase
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
  const stripeShippingAddress =
    session.customer_details?.address ?? session.shipping_details?.address ?? null;
  const customerName =
    session.shipping_details?.name ?? session.customer_details?.name ?? null;
  const shippingAddress = stripeShippingAddress
    ? { ...stripeShippingAddress, name: customerName }
    : customerName
      ? { name: customerName }
      : null;
  const subtotalCents = session.amount_subtotal ?? 0;
  const totalCents = session.amount_total ?? 0;
  const shippingCents = session.total_details?.amount_shipping ?? 0;
  const taxCents =
    session.total_details?.amount_tax ??
    Math.max(totalCents - subtotalCents - shippingCents, 0);

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

  const orderInput = {
    session,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? "",
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents,
    shippingAddress,
    items
  };

  try {
    const orderId = await processCheckoutAtomically(supabase, orderInput);
    await notifyPaidOrder(supabase, orderId);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Order could not be created."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
