import { NextResponse } from "next/server";
import { getProductsByVariantIds } from "@/lib/catalog";
import {
  paymentProvider,
  siteUrl,
  squareLocationId,
  squareShippingFeeCents,
  squareShippingFeeName,
  squareTaxPercentage,
  stripeShippingRates
} from "@/lib/env";
import {
  checkoutConfigurationError,
  isPaymentProviderConfigured
} from "@/lib/payments";
import { getSquareCatalogVariationIds } from "@/lib/square-catalog";
import { buildSquareCheckoutLineItem } from "@/lib/square-checkout-items";
import { getSquare } from "@/lib/square";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

type CheckoutBody = {
  email?: string;
  items?: Array<{
    variantId?: string;
    quantity?: number;
  }>;
};

type CheckoutItem = {
  product: Awaited<ReturnType<typeof getProductsByVariantIds>>[number];
  variant: Awaited<ReturnType<typeof getProductsByVariantIds>>[number]["variants"][number];
  quantity: number;
};

function validateRequestedQuantity(value: unknown) {
  const quantity = Number(value ?? 1);

  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error("Item quantities must be whole numbers between 1 and 99.");
  }

  return quantity;
}

async function createStripeCheckout(input: {
  buyerEmail?: string;
  cartReference: string;
  customerId?: string;
  items: CheckoutItem[];
}) {
  const stripe = getStripe();
  const metadata = {
    cart_reference: input.cartReference,
    customer_id: input.customerId ?? "",
    product_ids: input.items.map((item) => item.product.id).join(","),
    variant_ids: input.items.map((item) => item.variant.id).join(",")
  };
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.buyerEmail,
    allow_promotion_codes: true,
    line_items: input.items.map((item) => ({
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
    automatic_tax: { enabled: true },
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: stripeShippingRates.length
      ? stripeShippingRates.map((shipping_rate) => ({ shipping_rate }))
      : undefined,
    success_url: `${siteUrl}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    metadata,
    payment_intent_data: {
      receipt_email: input.buyerEmail,
      metadata
    }
  });

  return session.url;
}

async function createSquareCheckout(input: {
  buyerEmail?: string;
  cartReference: string;
  customerId?: string;
  items: CheckoutItem[];
}) {
  const square = getSquare();
  const catalogVariationIds = await getSquareCatalogVariationIds(
    input.items.map((item) => item.variant.id)
  ).catch((error) => {
    console.error("Square Catalog mappings could not be loaded", error);
    return new Map<string, string>();
  });
  const hasCatalogItems = catalogVariationIds.size > 0;

  const createPaymentLink = async (
    mappings: Map<string, string>,
    idempotencyKey: string
  ) =>
    square.checkout.paymentLinks.create({
      idempotencyKey,
      description: `Your Filter Guys cart ${input.cartReference}`,
      order: {
        locationId: squareLocationId,
        referenceId: input.cartReference,
        metadata: {
          cart_reference: input.cartReference,
          ...(input.customerId ? { customer_id: input.customerId } : {})
        },
        lineItems: input.items.map((item) =>
          buildSquareCheckoutLineItem(
            {
              productId: item.product.id,
              productName: item.product.name,
              shortDescription: item.product.shortDescription,
              variantId: item.variant.id,
              variantName: item.variant.name,
              sku: item.variant.sku,
              priceCents: item.variant.priceCents,
              quantity: item.quantity
            },
            mappings.get(item.variant.id)
          )
        ),
        taxes: squareTaxPercentage
          ? [
              {
                uid: "configured-sales-tax",
                name: "Sales tax",
                percentage: squareTaxPercentage,
                scope: "ORDER"
              }
            ]
          : undefined
      },
      checkoutOptions: {
        askForShippingAddress: true,
        redirectUrl: `${siteUrl}/checkout/success?provider=square`,
        merchantSupportEmail: "filterguys726@gmail.com",
        allowTipping: false,
        shippingFee: squareShippingFeeCents
          ? {
              name: squareShippingFeeName,
              charge: {
                amount: BigInt(squareShippingFeeCents),
                currency: "USD"
              }
            }
          : undefined
      },
      prePopulatedData: input.buyerEmail
        ? { buyerEmail: input.buyerEmail }
        : undefined,
      paymentNote: `Cart reference ${input.cartReference}`
    });

  let response;

  try {
    response = await createPaymentLink(
      catalogVariationIds,
      input.cartReference
    );
  } catch (error) {
    if (!hasCatalogItems) {
      throw error;
    }

    console.error(
      "Square catalog-backed checkout failed; retrying with ad-hoc items",
      error
    );
    response = await createPaymentLink(
      new Map<string, string>(),
      `${input.cartReference}-adhoc`
    );
  }

  if (!response.paymentLink?.url) {
    throw new Error("Square did not return a checkout URL.");
  }

  return response.paymentLink.url;
}

export async function POST(request: Request) {
  if (!isPaymentProviderConfigured(paymentProvider)) {
    return NextResponse.json(
      { error: checkoutConfigurationError() },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as CheckoutBody;
    const requestedItems = (body.items ?? [])
      .map((item) => ({
        variantId: String(item.variantId ?? ""),
        quantity: validateRequestedQuantity(item.quantity)
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
    const items = requestedItems.map((requestedItem) => {
      const product = products.find((candidate) =>
        candidate.variants.some(
          (variant) => variant.id === requestedItem.variantId
        )
      );
      const variant = product?.variants.find(
        (candidate) => candidate.id === requestedItem.variantId
      );

      if (!product || !variant || !variant.active) {
        throw new Error("One or more cart items are unavailable.");
      }

      if (!variant.backorderAllowed && requestedItem.quantity > variant.stockQuantity) {
        throw new Error(
          `${product.name} / ${variant.name} only has ${variant.stockQuantity} available.`
        );
      }

      return { product, variant, quantity: requestedItem.quantity };
    });
    const checkoutInput = {
      buyerEmail: user?.email ?? (body.email?.trim() || undefined),
      cartReference: globalThis.crypto.randomUUID(),
      customerId: user?.id,
      items
    };
    const url =
      paymentProvider === "square"
        ? await createSquareCheckout(checkoutInput)
        : await createStripeCheckout(checkoutInput);

    return NextResponse.json({ url });
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
