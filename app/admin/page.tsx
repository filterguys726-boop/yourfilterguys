import Link from "next/link";
import { Boxes, ClipboardList, PackagePlus, ShieldCheck } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { getAdminOrders, getAdminProducts, getAdminState } from "@/lib/admin";
import { formatMoney } from "@/lib/format";

export default async function AdminDashboardPage() {
  const state = await getAdminState();

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  const [{ products }, { orders }] = await Promise.all([
    getAdminProducts(),
    getAdminOrders()
  ]);
  const variantCount = products.reduce(
    (total, product) => total + product.variants.length,
    0
  );
  const lowStock = products.flatMap((product) =>
    product.variants.filter((variant) => variant.stockQuantity <= 3)
  );
  const revenue = orders.reduce((total, order) => total + order.totalCents, 0);

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Dashboard</h1>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Products",
              value: products.length,
              icon: PackagePlus,
              href: "/admin/products"
            },
            {
              label: "Variants",
              value: variantCount,
              icon: Boxes,
              href: "/admin/inventory"
            },
            {
              label: "Orders",
              value: orders.length,
              icon: ClipboardList,
              href: "/admin/orders"
            },
            {
              label: "Paid total",
              value: formatMoney(revenue),
              icon: ShieldCheck,
              href: "/admin/orders"
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.label} href={item.href} className="surface p-5">
                <Icon aria-hidden className="h-5 w-5 text-electric" />
                <p className="mt-4 text-sm font-bold text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-black text-ink">{item.value}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="surface overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-2xl font-black text-ink">Low stock</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {lowStock.length ? (
                lowStock.slice(0, 6).map((variant) => (
                  <div key={variant.id} className="flex justify-between gap-4 p-5">
                    <div>
                      <p className="font-bold text-ink">{variant.name}</p>
                      <p className="text-sm text-slate-600">{variant.sku}</p>
                    </div>
                    <p className="font-black text-shopred">
                      {variant.stockQuantity}
                    </p>
                  </div>
                ))
              ) : (
                <p className="p-5 text-sm text-slate-600">No low stock variants.</p>
              )}
            </div>
          </section>

          <section className="surface overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-2xl font-black text-ink">Recent orders</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {orders.slice(0, 6).map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex justify-between gap-4 p-5 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-bold text-ink">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">{order.customerEmail}</p>
                  </div>
                  <p className="font-black text-ink">
                    {formatMoney(order.totalCents, order.currency)}
                  </p>
                </Link>
              ))}
              {!orders.length ? (
                <p className="p-5 text-sm text-slate-600">No orders yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
