import Link from "next/link";
import { AccountGate } from "@/components/account-gate";
import { AccountNav } from "@/components/account-nav";
import { getCustomerOrders } from "@/lib/account";
import { formatMoney } from "@/lib/format";

export default async function AccountOrdersPage() {
  const { configured, user, orders } = await getCustomerOrders();

  if (!configured || !user) {
    return <AccountGate configured={configured} title="Log in to view orders" />;
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Account</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Order history</h1>
          <div className="mt-6">
            <AccountNav />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="surface overflow-hidden">
          {orders.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">Order</th>
                    <th className="px-5 py-3 font-bold">Date</th>
                    <th className="px-5 py-3 font-bold">Payment</th>
                    <th className="px-5 py-3 font-bold">Shipping status</th>
                    <th className="px-5 py-3 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-5 py-4">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="font-black text-electric"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">{order.paymentStatus}</td>
                      <td className="px-5 py-4">{order.fulfillmentStatus}</td>
                      <td className="px-5 py-4 font-black text-ink">
                        {formatMoney(order.totalCents, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-black text-ink">No orders yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                Completed Stripe checkouts appear here after the webhook creates
                the order.
              </p>
              <Link href="/products" className="button-primary mt-5">
                Shop products
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
