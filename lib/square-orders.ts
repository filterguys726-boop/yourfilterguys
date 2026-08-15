import type { Address, Order, Payment } from "square";
import { sendOrderCreatedNotifications } from "@/lib/order-notifications";
import {
  mergeStoredShippingAddress,
  normalizeSquareShippingAddress
} from "@/lib/square-address";
import { getSquare } from "@/lib/square";
import { createServiceSupabaseClient } from "@/lib/supabase";

export type CompletedSquarePayment = {
  id: string;
  orderId: string;
  status: string;
  buyerEmailAddress?: string | null;
  totalCents?: number;
  currency?: string;
  shippingAddress?: Address;
};

function cents(value: bigint | null | undefined) {
  return Number(value ?? BigInt(0));
}

function getShipmentRecipient(order: Order) {
  return order.fulfillments?.find((fulfillment) => fulfillment.shipmentDetails)
    ?.shipmentDetails?.recipient;
}

function getOrderItems(order: Order) {
  return (order.lineItems ?? []).map((lineItem) => {
    const metadata = lineItem.metadata ?? {};
    const quantity = Number.parseInt(lineItem.quantity, 10);
    const unitAmountCents = cents(lineItem.basePriceMoney?.amount);

    if (!metadata.variant_id || !Number.isSafeInteger(quantity) || quantity < 1) {
      throw new Error("Square order line items are missing store metadata.");
    }

    return {
      product_id: metadata.product_id ?? "",
      variant_id: metadata.variant_id,
      sku: metadata.sku ?? "",
      product_name: metadata.product_name ?? lineItem.name ?? "Product",
      variant_name:
        metadata.variant_name ?? lineItem.variationName ?? "Variant",
      quantity,
      unit_amount_cents: unitAmountCents,
      line_total_cents: unitAmountCents * quantity
    };
  });
}

export function squarePaymentFromSdk(payment: Payment): CompletedSquarePayment {
  return {
    id: payment.id ?? "",
    orderId: payment.orderId ?? "",
    status: payment.status ?? "",
    buyerEmailAddress: payment.buyerEmailAddress,
    totalCents: cents(payment.totalMoney?.amount),
    currency: payment.totalMoney?.currency,
    shippingAddress: payment.shippingAddress
  };
}

export async function processCompletedSquarePayment(
  webhookPayment: CompletedSquarePayment
) {
  if (webhookPayment.status !== "COMPLETED") {
    throw new Error("Square payment is not completed.");
  }

  if (!webhookPayment.id) {
    throw new Error("Square payment is missing its payment or order ID.");
  }

  const square = getSquare();
  const paymentResponse = await square.payments.get({
    paymentId: webhookPayment.id
  });

  if (!paymentResponse.payment) {
    throw new Error(`Square payment ${webhookPayment.id} could not be loaded.`);
  }

  const hydratedPayment = squarePaymentFromSdk(paymentResponse.payment);
  const payment: CompletedSquarePayment = {
    ...webhookPayment,
    ...hydratedPayment,
    id: hydratedPayment.id || webhookPayment.id,
    orderId: hydratedPayment.orderId || webhookPayment.orderId,
    buyerEmailAddress:
      hydratedPayment.buyerEmailAddress ?? webhookPayment.buyerEmailAddress,
    totalCents: hydratedPayment.totalCents ?? webhookPayment.totalCents,
    currency: hydratedPayment.currency ?? webhookPayment.currency,
    shippingAddress:
      hydratedPayment.shippingAddress ?? webhookPayment.shippingAddress
  };

  if (payment.status !== "COMPLETED" || !payment.orderId) {
    throw new Error("Square payment is not completed or is missing its order ID.");
  }

  const orderResponse = await square.orders.batchGet({
    orderIds: [payment.orderId]
  });
  const order = orderResponse.orders?.[0];

  if (!order) {
    throw new Error(`Square order ${payment.orderId} could not be loaded.`);
  }

  const recipient = getShipmentRecipient(order);
  const items = getOrderItems(order);
  const subtotalCents = items.reduce(
    (total, item) => total + item.line_total_cents,
    0
  );
  const taxCents = cents(order.totalTaxMoney?.amount);
  const shippingCents = cents(order.totalServiceChargeMoney?.amount);
  const totalCents =
    payment.totalCents ?? cents(order.totalMoney?.amount);
  const customerEmail =
    payment.buyerEmailAddress ?? recipient?.emailAddress ?? "";
  const shippingAddress = normalizeSquareShippingAddress(
    [payment.shippingAddress, webhookPayment.shippingAddress, recipient?.address],
    recipient?.displayName
  );
  const customerId = order.metadata?.customer_id || null;
  const supabase = createServiceSupabaseClient();
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from("orders")
    .select("id,shipping_address")
    .eq("payment_provider", "square")
    .eq("provider_payment_id", payment.id)
    .maybeSingle();

  if (existingOrderError) {
    throw existingOrderError;
  }

  const { data: orderId, error } = await supabase.rpc("process_paid_payment", {
    provider_input: "square",
    provider_checkout_id_input: null,
    provider_order_id_input: order.id ?? payment.orderId,
    provider_payment_id_input: payment.id,
    customer_id_input: customerId,
    customer_email_input: customerEmail,
    currency_input: (payment.currency ?? order.totalMoney?.currency ?? "USD").toLowerCase(),
    subtotal_cents_input: subtotalCents,
    tax_cents_input: taxCents,
    shipping_cents_input: shippingCents,
    total_cents_input: totalCents,
    shipping_address_input: shippingAddress,
    items_input: items
  });

  if (error) {
    throw error;
  }

  if (existingOrder) {
    const mergedAddress = mergeStoredShippingAddress(
      shippingAddress,
      existingOrder.shipping_address as Record<string, unknown> | null
    );

    if (
      JSON.stringify(mergedAddress) !== JSON.stringify(existingOrder.shipping_address)
    ) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ shipping_address: mergedAddress })
        .eq("id", existingOrder.id);

      if (updateError) {
        throw updateError;
      }

    }
  }

  try {
    await sendOrderCreatedNotifications(supabase, orderId as string);
  } catch (notificationError) {
    console.error("Square order notification email failed", notificationError);
  }

  return orderId as string;
}
