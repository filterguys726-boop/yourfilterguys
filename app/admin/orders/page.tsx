import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { recoverStripeOrderAction } from "@/app/admin/orders/actions";
import { getAdminOrders } from "@/lib/admin";
import { formatMoney } from "@/lib/format";

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    error?: string;
    recovered?: string;
  }>;
};

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
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Order</th>
                  <th className="px-5 py-3 font-bold">Customer</th>
                  <th className="px-5 py-3 font-bold">Payment</th>
                  <th className="px-5 py-3 font-bold">Fulfillment</th>
                  <th className="px-5 py-3 font-bold">Total</th>
                  <th className="px-5 py-3 font-bold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-black text-ink">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">{order.customerEmail}</td>
                    <td className="px-5 py-4">{order.paymentStatus}</td>
                    <td className="px-5 py-4">{order.fulfillmentStatus}</td>
                    <td className="px-5 py-4 font-black text-ink">
                      {formatMoney(order.totalCents, order.currency)}
                    </td>
                    <td className="px-5 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {!orders.length ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={6}>
                      No paid orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
