import { adminOrderEmail } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import { sendTransactionalEmail } from "@/lib/email";

export type OrderEmailItem = {
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitAmountCents: number;
  lineTotalCents: number;
};

export type OrderEmailData = {
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  fulfillmentStatus: string;
  shippingAddress?: Record<string, unknown> | null;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: OrderEmailItem[];
};

function emailErrorMessage(result: PromiseSettledResult<unknown>) {
  if (result.status === "fulfilled") {
    return null;
  }

  const reason = result.reason;

  if (reason instanceof Error) {
    return reason.message;
  }

  if (
    reason &&
    typeof reason === "object" &&
    "message" in reason &&
    typeof reason.message === "string"
  ) {
    return reason.message;
  }

  return "Unknown email delivery error.";
}

function logEmailFailure(label: string, result: PromiseSettledResult<unknown>) {
  if (result.status === "rejected") {
    console.error(`${label} failed`, result.reason);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatAddress(address: Record<string, unknown> | null | undefined) {
  if (!address) {
    return "Shipping address not provided.";
  }

  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country
  ]
    .filter(Boolean)
    .join("\n");
}

function orderItemsText(items: OrderEmailItem[], currency: string) {
  if (!items.length) {
    return "Line items are not available in the order database yet. Check Stripe and the admin order dashboard for payment details.";
  }

  return items
    .map(
      (item) =>
        `${item.quantity} x ${item.productName} (${item.variantName}, ${item.sku}) - ${formatMoney(
          item.lineTotalCents,
          currency
        )}`
    )
    .join("\n");
}

function orderItemsHtml(items: OrderEmailItem[], currency: string) {
  if (!items.length) {
    return `
      <tr>
        <td colspan="3" style="padding:12px;border-bottom:1px solid #e5e7eb;color:#64748b;">
          Line items are not available in the order database yet. Check Stripe and the admin order dashboard for payment details.
        </td>
      </tr>`;
  }

  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
            <strong>${escapeHtml(item.productName)}</strong><br />
            <span style="color:#64748b;">${escapeHtml(item.variantName)} · ${escapeHtml(item.sku)}</span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(
            item.lineTotalCents,
            currency
          )}</td>
        </tr>`
    )
    .join("");
}

function emailShell(title: string, body: string) {
  return `
    <div style="margin:0;background:#f3f6fb;padding:28px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe3ef;border-radius:8px;overflow:hidden;">
        <div style="background:#0b1322;color:#ffffff;padding:22px 24px;">
          <p style="margin:0;color:#f2c14e;font-size:12px;font-weight:700;text-transform:uppercase;">Your Filter Guys</p>
          <h1 style="margin:6px 0 0;font-size:24px;line-height:1.2;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:24px;">${body}</div>
      </div>
    </div>`;
}

export async function sendOrderConfirmationEmails(
  order: OrderEmailData,
  options: { sendCustomer?: boolean; sendAdmin?: boolean } = {}
) {
  const shouldSendCustomer = options.sendCustomer ?? true;
  const shouldSendAdmin = options.sendAdmin ?? true;
  const addressText = formatAddress(order.shippingAddress);
  const itemText = orderItemsText(order.items, order.currency);
  const itemRows = orderItemsHtml(order.items, order.currency);
  const customerSubject = `Order ${order.orderNumber} confirmed`;
  const adminSubject = `New paid order ${order.orderNumber}`;
  const totalText = formatMoney(order.totalCents, order.currency);

  const customerText = `Thanks for your order. We received payment for ${order.orderNumber}.

Items:
${itemText}

Subtotal: ${formatMoney(order.subtotalCents, order.currency)}
Shipping: ${formatMoney(order.shippingCents, order.currency)}
Tax: ${formatMoney(order.taxCents, order.currency)}
Total: ${totalText}

Ship to:
${addressText}

Status: ${order.fulfillmentStatus}

Questions? Reply to this email or contact support@yourfilterguys.com.`;

  const customerHtml = emailShell(
    `Order ${order.orderNumber} confirmed`,
    `
      <p style="margin:0 0 16px;">Thanks for your order. We received your payment and will prepare your parts for fulfillment.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="padding:10px 12px;text-align:left;background:#f8fafc;">Item</th>
            <th style="padding:10px 12px;text-align:center;background:#f8fafc;">Qty</th>
            <th style="padding:10px 12px;text-align:right;background:#f8fafc;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="margin-top:18px;padding:14px;background:#f8fafc;border-radius:6px;">
        <p style="margin:0;">Subtotal: ${formatMoney(order.subtotalCents, order.currency)}</p>
        <p style="margin:6px 0 0;">Shipping: ${formatMoney(order.shippingCents, order.currency)}</p>
        <p style="margin:6px 0 0;">Tax: ${formatMoney(order.taxCents, order.currency)}</p>
        <p style="margin:10px 0 0;font-size:18px;"><strong>Total: ${totalText}</strong></p>
      </div>
      <h2 style="font-size:16px;margin:22px 0 8px;">Shipping address</h2>
      <p style="white-space:pre-line;margin:0;color:#334155;">${escapeHtml(addressText)}</p>
      <p style="margin:22px 0 0;color:#64748b;">Current status: <strong>${escapeHtml(
        order.fulfillmentStatus
      )}</strong></p>
    `
  );

  const adminText = `A paid order needs fulfillment.

Order: ${order.orderNumber}
Customer: ${order.customerEmail}
Total: ${totalText}

Items:
${itemText}

Ship to:
${addressText}

Open the admin dashboard: https://yourfilterguys.com/admin/orders`;

  const adminHtml = emailShell(
    `New paid order ${order.orderNumber}`,
    `
      <p style="margin:0 0 16px;">A paid order needs fulfillment.</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customerEmail)}</p>
      <p><strong>Total:</strong> ${totalText}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>${itemRows}</tbody>
      </table>
      <h2 style="font-size:16px;margin:22px 0 8px;">Ship to</h2>
      <p style="white-space:pre-line;margin:0;color:#334155;">${escapeHtml(addressText)}</p>
      <p style="margin:22px 0 0;"><a href="https://yourfilterguys.com/admin/orders" style="color:#0b67bd;font-weight:700;">Open admin orders</a></p>
    `
  );

  const customerDelivery = shouldSendCustomer
    ? sendTransactionalEmail({
        to: order.customerEmail,
        subject: customerSubject,
        html: customerHtml,
        text: customerText
      })
    : Promise.resolve(null);

  const [customerResult, adminResult] = await Promise.allSettled([
    customerDelivery,
    shouldSendAdmin
      ? adminOrderEmail
        ? sendTransactionalEmail({
            to: adminOrderEmail,
            subject: adminSubject,
            html: adminHtml,
            text: adminText
          })
        : Promise.reject(
            new Error(
              "ADMIN_ORDER_EMAIL is missing in Vercel Production environment variables."
            )
          )
      : Promise.resolve(null)
  ]);

  logEmailFailure("Customer order confirmation email", customerResult);
  logEmailFailure("Admin order notification email", adminResult);

  return {
    customerSent: shouldSendCustomer && customerResult.status === "fulfilled",
    adminSent:
      shouldSendAdmin && Boolean(adminOrderEmail) && adminResult.status === "fulfilled",
    customerError: emailErrorMessage(customerResult),
    adminError: emailErrorMessage(adminResult)
  };
}

export async function sendOrderStatusEmail(order: OrderEmailData) {
  const tracking =
    order.trackingNumber || order.trackingUrl
      ? `\nTracking: ${[
          order.trackingCarrier,
          order.trackingNumber,
          order.trackingUrl
        ]
          .filter(Boolean)
          .join(" ")}`
      : "";
  const subject = `Order ${order.orderNumber} status: ${order.fulfillmentStatus}`;
  const text = `Your order status has been updated.

Order: ${order.orderNumber}
Status: ${order.fulfillmentStatus}${tracking}

Questions? Reply to this email or contact support@yourfilterguys.com.`;
  const html = emailShell(
    `Order ${order.orderNumber} updated`,
    `
      <p style="margin:0 0 12px;">Your order status has been updated.</p>
      <p><strong>Status:</strong> ${escapeHtml(order.fulfillmentStatus)}</p>
      ${
        order.trackingNumber || order.trackingUrl
          ? `<p><strong>Tracking:</strong> ${escapeHtml(
              [order.trackingCarrier, order.trackingNumber]
                .filter(Boolean)
                .join(" ")
            )}${
              order.trackingUrl
                ? `<br /><a href="${escapeHtml(order.trackingUrl)}" style="color:#0b67bd;font-weight:700;">Track shipment</a>`
                : ""
            }</p>`
          : ""
      }
    `
  );

  await sendTransactionalEmail({
    to: order.customerEmail,
    subject,
    html,
    text
  }).catch((error) => {
    console.error("Customer order status email failed", error);
  });
}
