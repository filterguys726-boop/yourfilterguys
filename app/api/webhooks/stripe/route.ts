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
  const shippingAddress =
    session.customer_details?.address ?? session.shipping_details?.address ?? null;
  const subtotalCents = session.amount_subtotal ?? 0;
  const totalCents = session.amount_total ?? 0;
  const shippingCents = session.total_details?.amount_shipping ?? 0;
  const taxCents =
    session.total_details?.amount_tax ??
    Math.max(totalCents - subtotalCents - shippingCents, 0);

  const items = lineItems.data.map((lineItem) => {
    const metadata = lineItem.price?.product
      ? getProductMetadata(lineItem.price.product)
      : {};
    const quantity = lineItem.quantity ?? 1;
    const unitAmount = lineItem.price?.unit_amount ?? 0;

    return {
      product_id: metadata.product_id,
      variant_id: metadata.variant_id,
      sku: metadata.sku,
      product_name:
        metadata.product_name ??
        lineItem.description?.split(" - ")[0] ??
        "Product",
      variant_name: metadata.variant_name ?? "Variant",
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
