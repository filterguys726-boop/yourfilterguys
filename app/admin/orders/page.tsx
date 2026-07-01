import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import {
  recoverStripeOrderAction,
  sendOrderEmailAction,
  updateOrderFulfillmentAction
} from "@/app/admin/orders/actions";
import { BuyerEmailForm } from "@/app/admin/orders/buyer-email-form";
import { getAdminOrders } from "@/lib/admin";
import { adminOrderEmail, hasEmailEnv, orderFromEmail } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    error?: string;
    emailUpdated?: string;
    recovered?: string;
    emailed?: string;
    updated?: string;
  }>;
};

function formatAddress(address: Record<string, unknown> | null | undefined) {
  if (!address) {
    return "No shipping address captured.";
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

function statusClass(value: string) {
  if (["paid", "confirmed", "shipped", "delivered"].includes(value)) {
    return "bg-emerald-50 text-bay border-emerald-200";
  }

  if (["pending", "processing"].includes(value)) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function OrderCard({ order }: { order: OrderSummary }) {
  const itemCount =
    order.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const createdAt = new Date(order.createdAt);

  return (
    <article className="surface overflow-hidden">
      <div className="border-b border-slate-200 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-ink">
                Order {order.orderNumber}
              </h2>
              <span
                className={`rounded-md border px-2 py-1 text-xs font-black uppercase ${statusClass(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </span>
              <span
                className={`rounded-md border px-2 py-1 text-xs font-black uppercase ${statusClass(
                  order.fulfillmentStatus
                )}`}
              >
                {order.fulfillmentStatus}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {createdAt.toLocaleString()} · {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs font-black uppercase text-slate-500">Total</p>
            <p className="text-2xl font-black text-ink">
              {formatMoney(order.totalCents, order.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
        <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <p className="text-xs font-black uppercase text-slate-500">
            Fulfillment items
          </p>
          <div className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
            {order.items?.length ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-start"
                >
                  <div>
                    <p className="font-black text-ink">{item.productName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.variantName} · SKU {item.sku}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Qty {item.quantity} ×{" "}
                      {formatMoney(item.unitAmountCents, order.currency)}
                    </p>
                  </div>
                  <p className="font-black text-ink">
                    {formatMoney(item.lineTotalCents, order.currency)}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-600">
                No line items were captured for this order.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 p-5">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              Ship to
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">
              {formatAddress(order.shippingAddress)}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              Payment breakdown
            </p>
            <div className="mt-2 grid gap-1 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <span>Subtotal</span>
                <span>
                  {formatMoney(order.subtotalCents ?? 0, order.currency)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Shipping</span>
                <span>
                  {formatMoney(order.shippingCents ?? 0, order.currency)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Tax</span>
                <span>{formatMoney(order.taxCents ?? 0, order.currency)}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 border-t border-slate-200 pt-2 font-black text-ink">
                <span>Total</span>
                <span>{formatMoney(order.totalCents, order.currency)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              Stripe reference
            </p>
            <div className="mt-2 grid gap-1 text-xs text-slate-600">
              <p className="break-all">
                Session: {order.stripeCheckoutSessionId ?? "Not captured"}
              </p>
              <p className="break-all">
                Payment: {order.paymentIntentId ?? "Not captured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-5">
        <BuyerEmailForm orderId={order.id} customerEmail={order.customerEmail} />

        <form
          id={`order-${order.id}`}
          action={updateOrderFulfillmentAction}
          className="grid gap-4 lg:grid-cols-[180px_1fr_auto]"
        >
          <input type="hidden" name="order_id" value={order.id} />
          <label className="grid gap-2">
            <span className="label">Fulfillment</span>
            <select
              className="field"
              name="fulfillment_status"
              defaultValue={order.fulfillmentStatus}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-2">
              <span className="label">Carrier</span>
              <input
                className="field"
                name="tracking_carrier"
                placeholder="UPS"
                defaultValue={order.trackingCarrier ?? ""}
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Tracking number</span>
              <input
                className="field"
                name="tracking_number"
                placeholder="1Z..."
                defaultValue={order.trackingNumber ?? ""}
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Tracking URL</span>
              <input
                className="field"
                name="tracking_url"
                placeholder="https://..."
                defaultValue={order.trackingUrl ?? ""}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <button type="submit" className="button-secondary">
              Save status
            </button>
          </div>
        </form>

        <form action={sendOrderEmailAction} className="mt-3">
          <input type="hidden" name="order_id" value={order.id} />
          <button type="submit" className="button-primary">
            Resend order email
          </button>
        </form>
      </div>
    </article>
  );
}

export default async function AdminOrdersPage({
  searchParams
}: AdminOrdersPageProps) {
  const { state, orders } = await getAdminOrders();
  const query = await searchParams;

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Orders</h1>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {query?.error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-shopred">
            {query.error}
          </div>
        ) : null}
        {query?.recovered ? (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-bay">
            Stripe order recovered. Check the order list below.
          </div>
        ) : null}
        {query?.updated ? (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-bay">
            Order updated and customer status email queued.
          </div>
        ) : null}
        {query?.emailUpdated ? (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-bay">
            Buyer email updated. Use resend order email to send the confirmation.
          </div>
        ) : null}
        {query?.emailed ? (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-bay">
            Order notification email attempted. Check Resend activity and inboxes.
          </div>
        ) : null}
        <form action={recoverStripeOrderAction} className="surface mb-6 p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="grid gap-2">
              <span className="label">Recover paid Stripe session</span>
              <input
                className="field"
                name="session_id"
                placeholder="cs_live_..."
                required
              />
            </label>
            <button type="submit" className="button-primary">
              Recover order
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use this if Stripe charged a customer but webhook delivery did not
            create the order automatically.
          </p>
        </form>
        <div className="surface mb-6 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase text-slate-500">
                Resend status
              </p>
              <p
                className={`mt-2 text-sm font-black ${
                  hasEmailEnv ? "text-bay" : "text-shopred"
                }`}
              >
                {hasEmailEnv ? "Configured" : "Missing API key or sender"}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500">
                From email
              </p>
              <p className="mt-2 break-all text-sm text-ink">{orderFromEmail}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-500">
                Admin recipient
              </p>
              <p
                className={`mt-2 break-all text-sm font-semibold ${
                  adminOrderEmail ? "text-ink" : "text-shopred"
                }`}
              >
                {adminOrderEmail || "Missing ADMIN_ORDER_EMAIL"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {!orders.length ? (
            <div className="surface px-5 py-8 text-center text-slate-600">
              No paid orders yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
