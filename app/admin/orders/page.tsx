import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { getAdminOrders } from "@/lib/admin";
import { formatMoney } from "@/lib/format";

export default async function AdminOrdersPage() {
  const { state, orders } = await getAdminOrders();

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
