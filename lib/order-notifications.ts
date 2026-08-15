import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendOrderConfirmationEmails,
  type OrderEmailData,
  type OrderEmailItem
} from "@/lib/order-emails";
import {
  claimOrderNotification,
  releaseOrderNotificationClaim
} from "@/lib/order-notification-claims";

type OrderNotificationRow = {
  id: string;
  order_number: string;
  customer_email: string;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  fulfillment_status: string;
  shipping_address: Record<string, unknown> | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
};

type OrderNotificationItemRow = {
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  unit_amount_cents: number;
  line_total_cents: number;
};

function mapOrderEmailData(
  order: OrderNotificationRow,
  items: OrderNotificationItemRow[]
): OrderEmailData {
  return {
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
    items: items.map(
      (item): OrderEmailItem => ({
        productName: item.product_name,
        variantName: item.variant_name,
        sku: item.sku,
        quantity: item.quantity,
        unitAmountCents: item.unit_amount_cents,
        lineTotalCents: item.line_total_cents
      })
    )
  };
}

export async function sendOrderCreatedNotifications(
  supabase: SupabaseClient,
  orderId: string,
  options: { force?: boolean } = {}
) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_email,currency,subtotal_cents,tax_cents,shipping_cents,total_cents,fulfillment_status,shipping_address,tracking_carrier,tracking_number,tracking_url"
    )
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  const typedOrder = order as OrderNotificationRow;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name,variant_name,sku,quantity,unit_amount_cents,line_total_cents")
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("Order email line items could not be loaded", itemsError);
  }

  const [customerClaim, adminClaim] = options.force
    ? [
        { claimed: true, claimedAt: new Date().toISOString() },
        { claimed: true, claimedAt: new Date().toISOString() }
      ]
    : await Promise.all([
        claimOrderNotification(
          supabase,
          orderId,
          "customer_confirmation_sent_at"
        ),
        claimOrderNotification(supabase, orderId, "admin_notification_sent_at")
      ]);

  if (!customerClaim.claimed && !adminClaim.claimed) {
    return;
  }

  const result = await sendOrderConfirmationEmails(
    mapOrderEmailData(typedOrder, (items ?? []) as OrderNotificationItemRow[]),
    {
      sendCustomer: customerClaim.claimed,
      sendAdmin: adminClaim.claimed
    }
  );

  if (options.force) {
    const timestampUpdates: Record<string, string> = {};

    if (result.customerSent) {
      timestampUpdates.customer_confirmation_sent_at = customerClaim.claimedAt;
    }

    if (result.adminSent) {
      timestampUpdates.admin_notification_sent_at = adminClaim.claimedAt;
    }

    if (Object.keys(timestampUpdates).length) {
      const { error } = await supabase
        .from("orders")
        .update(timestampUpdates)
        .eq("id", orderId);

      if (error) {
        console.error("Order email timestamp update failed", error);
      }
    }
  } else {
    await Promise.all([
      customerClaim.claimed && !result.customerSent
        ? releaseOrderNotificationClaim(
            supabase,
            orderId,
            "customer_confirmation_sent_at",
            customerClaim.claimedAt
          )
        : Promise.resolve(),
      adminClaim.claimed && !result.adminSent
        ? releaseOrderNotificationClaim(
            supabase,
            orderId,
            "admin_notification_sent_at",
            adminClaim.claimedAt
          )
        : Promise.resolve()
    ]);
  }

  if (
    (customerClaim.claimed && !result.customerSent) ||
    (adminClaim.claimed && !result.adminSent)
  ) {
    const failures = [
      customerClaim.claimed && !result.customerSent
        ? `customer email failed: ${result.customerError ?? "unknown error"}`
        : "",
      adminClaim.claimed && !result.adminSent
        ? `admin email failed: ${result.adminError ?? "unknown error"}`
        : ""
    ]
      .filter(Boolean)
      .join("; ");

    throw new Error(
      `Order email delivery failed: ${failures}. Check RESEND_API_KEY, ORDER_FROM_EMAIL, ADMIN_ORDER_EMAIL, and Resend logs.`
    );
  }
}
