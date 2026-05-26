import { NextResponse } from "next/server";
import { getProductsByVariantIds } from "@/lib/catalog";
import { hasStripeEnv, siteUrl, stripeShippingRates } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

type CheckoutBody = {
  email?: string;
  items?: Array<{
    variantId?: string;
    quantity?: number;
  }>;
};

export async function POST(request: Request) {
  if (!hasStripeEnv) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY first." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as CheckoutBody;
  const requestedItems = (body.items ?? [])
    .map((item) => ({
      variantId: String(item.variantId ?? ""),
      quantity: Math.max(1, Number(item.quantity ?? 1))
    }))
    .filter((item) => item.variantId);

  if (!requestedItems.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const products = await getProductsByVariantIds(
    requestedItems.map((item) => item.variantId)
  );
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null as null } };

  const stripe = getStripe();
  const cartReference = globalThis.crypto.randomUUID();

  try {
    const checkoutItems = requestedItems.map((requestedItem) => {
      const product = products.find((candidate) =>
        candidate.variants.some((variant) => variant.id === requestedItem.variantId)
      );
      const variant = product?.variants.find(
        (candidate) => candidate.id === requestedItem.variantId
      );

      if (!product || !variant || !variant.active) {
        throw new Error("One or more cart items are unavailable.");
      }

      if (variant.stockQuantity <= 0 && !variant.backorderAllowed) {
        throw new Error(`${product.name} / ${variant.name} is sold out.`);
      }

      return {
        product,
        variant,
        quantity: requestedItem.quantity
      };
    });
    const metadata = {
      cart_reference: cartReference,
      customer_id: user?.id ?? "",
      product_ids: checkoutItems.map((item) => item.product.id).join(","),
      variant_ids: checkoutItems.map((item) => item.variant.id).join(",")
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? body.email,
      line_items: checkoutItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.variant.priceCents,
          product_data: {
            name: `${item.product.name} - ${item.variant.name}`,
            description: item.product.shortDescription,
            images: [
              item.product.imageUrl.startsWith("http")
                ? item.product.imageUrl
                : `${siteUrl}${item.product.imageUrl}`
            ],
            metadata: {
              product_id: item.product.id,
              variant_id: item.variant.id,
              sku: item.variant.sku,
              product_name: item.product.name,
              variant_name: item.variant.name
            }
          }
        }
      })),
      automatic_tax: {
        enabled: true
      },
      shipping_address_collection: {
        allowed_countries: ["US"]
      },
      shipping_options: stripeShippingRates.length
        ? stripeShippingRates.map((shipping_rate) => ({ shipping_rate }))
        : undefined,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata,
      payment_intent_data: {
        metadata
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be started."
      },
      { status: 400 }
    );
  }
}
