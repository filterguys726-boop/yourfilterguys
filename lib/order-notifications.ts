import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendOrderConfirmationEmails,
  type OrderEmailData,
  type OrderEmailItem
} from "@/lib/order-emails";

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
  customer_confirmation_sent_at: string | null;
  admin_notification_sent_at: string | null;
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
  orderId: string
) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_email,currency,subtotal_cents,tax_cents,shipping_cents,total_cents,fulfillment_status,shipping_address,tracking_carrier,tracking_number,tracking_url,customer_confirmation_sent_at,admin_notification_sent_at"
    )
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  const typedOrder = order as OrderNotificationRow;
  const sendCustomer = !typedOrder.customer_confirmation_sent_at;
  const sendAdmin = !typedOrder.admin_notification_sent_at;

  if (!sendCustomer && !sendAdmin) {
    return;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name,variant_name,sku,quantity,unit_amount_cents,line_total_cents")
    .eq("order_id", orderId);

  if (itemsError) {
    throw itemsError;
  }

  const result = await sendOrderConfirmationEmails(
    mapOrderEmailData(typedOrder, (items ?? []) as OrderNotificationItemRow[]),
    { sendCustomer, sendAdmin }
  );
  const update: {
    customer_confirmation_sent_at?: string;
    admin_notification_sent_at?: string;
  } = {};
  const now = new Date().toISOString();

  if (result.customerSent && !typedOrder.customer_confirmation_sent_at) {
    update.customer_confirmation_sent_at = now;
  }

  if (result.adminSent && !typedOrder.admin_notification_sent_at) {
    update.admin_notification_sent_at = now;
  }

  if (Object.keys(update).length) {
    await supabase.from("orders").update(update).eq("id", orderId);
  }
}
