import Link from "next/link";
import { AccountGate } from "@/components/account-gate";
import { AccountNav } from "@/components/account-nav";
import { getCustomerOrders, getCustomerProfile } from "@/lib/account";
import { formatMoney } from "@/lib/format";

export default async function AccountPage() {
  const [profileState, orderState] = await Promise.all([
    getCustomerProfile(),
    getCustomerOrders()
  ]);

  if (!profileState.configured || !profileState.user) {
    return <AccountGate configured={profileState.configured} />;
  }

  const recentOrders = orderState.orders.slice(0, 3);
  const purchasedProducts = orderState.orders
    .flatMap((order) => order.items ?? [])
    .slice(0, 6);

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Account</p>
          <h1 className="mt-2 text-4xl font-black text-ink">
            Welcome{profileState.profile?.fullName ? `, ${profileState.profile.fullName}` : ""}
          </h1>
          <div className="mt-6">
            <AccountNav />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="surface overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-black text-ink">Recent orders</h2>
          </div>
          {recentOrders.length ? (
            <div className="divide-y divide-slate-200">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="grid gap-2 p-5 hover:bg-slate-50 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-black text-ink">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                      {order.fulfillmentStatus}
                    </p>
                  </div>
                  <p className="font-black text-ink">
                    {formatMoney(order.totalCents, order.currency)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-600">
              No orders yet. Purchases made with this email are claimed
              automatically when the account exists.
            </div>
          )}
        </div>

        <aside className="surface h-fit p-5">
          <h2 className="text-2xl font-black text-ink">Purchased products</h2>
          <div className="mt-4 grid gap-3">
            {purchasedProducts.length ? (
              purchasedProducts.map((item) => (
                <div key={item.id} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-bold text-ink">{item.productName}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.variantName} · {item.sku} · Qty {item.quantity}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No purchased products yet.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
