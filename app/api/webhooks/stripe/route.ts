import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeWebhookSecret } from "@/lib/env";
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
  const shippingAddress =
    session.customer_details?.address ?? session.shipping_details?.address ?? null;
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

  const { error } = await supabase.rpc("process_paid_checkout", {
    session_id_input: session.id,
    stripe_customer_id_input:
      typeof session.customer === "string" ? session.customer : null,
    payment_intent_id_input:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    customer_id_input: session.metadata?.customer_id || null,
    customer_email_input:
      session.customer_details?.email ?? session.customer_email ?? "",
    currency_input: session.currency ?? "usd",
    subtotal_cents_input: subtotalCents,
    tax_cents_input: taxCents,
    shipping_cents_input: shippingCents,
    total_cents_input: totalCents,
    shipping_address_input: shippingAddress,
    items_input: items
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
