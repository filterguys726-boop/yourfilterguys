import Link from "next/link";
import { ArrowRight, Search, ShoppingBag, UserRound } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { getAdminCustomerPreview } from "@/lib/admin";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type AdminCustomersPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function AdminCustomersPage({
  searchParams
}: AdminCustomersPageProps) {
  const query = await searchParams;
  const { state, customers, selectedEmail, orders } =
    await getAdminCustomerPreview(query?.email);
  const selectedCustomer = customers.find(
    (customer) => customer.email.toLowerCase() === selectedEmail.toLowerCase()
  );
  const purchasedItems = orders.flatMap((order) =>
    (order.items ?? []).map((item) => ({
      ...item,
      orderNumber: order.orderNumber,
      orderId: order.id,
      createdAt: order.createdAt,
      currency: order.currency
    }))
  );

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-ink">
            Customer preview
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only customer dashboard preview for support and fulfillment.
            This does not log you in as the customer or allow customer actions.
          </p>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="grid h-fit gap-4">
          <form action="/admin/customers" className="surface p-5">
            <label className="grid gap-2">
              <span className="label">Search customer email</span>
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="field pl-10"
                  name="email"
                  placeholder="customer@email.com"
                  defaultValue={selectedEmail}
                />
              </div>
            </label>
            <button type="submit" className="button-primary mt-3 w-full">
              Preview dashboard
            </button>
          </form>

          <div className="surface overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-black text-ink">Customers</h2>
            </div>
            <div className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
              {customers.map((customer) => {
                const selected =
                  customer.email.toLowerCase() === selectedEmail.toLowerCase();

                return (
                  <Link
                    key={customer.email}
                    href={`/admin/customers?email=${encodeURIComponent(
                      customer.email
                    )}`}
                    className={`block p-4 transition hover:bg-slate-50 ${
                      selected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <p className="break-all font-black text-ink">
                      {customer.email}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {customer.orderCount} orders ·{" "}
                      {formatMoney(customer.totalCents)}
                    </p>
                  </Link>
                );
              })}
              {!customers.length ? (
                <p className="p-5 text-sm text-slate-600">
                  No customer orders yet.
                </p>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface p-5">
              <UserRound aria-hidden className="h-5 w-5 text-electric" />
              <p className="mt-4 text-sm font-bold text-slate-500">Customer</p>
              <p className="mt-1 break-all text-lg font-black text-ink">
                {selectedEmail || "Select a customer"}
              </p>
            </div>
            <div className="surface p-5">
              <ShoppingBag aria-hidden className="h-5 w-5 text-electric" />
              <p className="mt-4 text-sm font-bold text-slate-500">Orders</p>
              <p className="mt-1 text-3xl font-black text-ink">
                {selectedCustomer?.orderCount ?? 0}
              </p>
            </div>
            <div className="surface p-5">
              <ShoppingBag aria-hidden className="h-5 w-5 text-electric" />
              <p className="mt-4 text-sm font-bold text-slate-500">Lifetime</p>
              <p className="mt-1 text-3xl font-black text-ink">
                {formatMoney(selectedCustomer?.totalCents ?? 0)}
              </p>
            </div>
          </div>

          <section className="surface overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-2xl font-black text-ink">
                Customer order history
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-black text-ink">
                      Order {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleString()} ·{" "}
                      {order.paymentStatus} · {order.fulfillmentStatus}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.items?.length
                        ? order.items
                            .slice(0, 2)
                            .map((item) => `${item.quantity}x ${item.productName}`)
                            .join(", ")
                        : "Line-item details unavailable for this order."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <p className="font-black text-ink">
                      {formatMoney(order.totalCents, order.currency)}
                    </p>
                    <Link href="/admin/orders" className="button-secondary px-3">
                      Handle order
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {!orders.length ? (
                <p className="p-5 text-sm text-slate-600">
                  No orders found for this email.
                </p>
              ) : null}
            </div>
          </section>

          <section className="surface overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-2xl font-black text-ink">
                Purchased products view
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {purchasedItems.map((item) => (
                <div
                  key={`${item.orderId}-${item.id}`}
                  className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-black text-ink">{item.productName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.variantName} · SKU {item.sku} · Order{" "}
                      {item.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(item.createdAt).toLocaleDateString()} · Qty{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-ink">
                    {formatMoney(item.lineTotalCents, item.currency)}
                  </p>
                </div>
              ))}
              {!purchasedItems.length ? (
                <div className="p-5">
                  <p className="font-black text-ink">
                    No purchased product rows available
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This section lists individual line items across the
                    customer&apos;s orders. If the customer has orders above but
                    this section is empty, those orders were created before
                    order item rows were available or need to be recovered from
                    Stripe.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
