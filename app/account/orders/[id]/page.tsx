import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AccountGate } from "@/components/account-gate";
import { getCustomerOrder } from "@/lib/account";
import { formatMoney } from "@/lib/format";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AccountOrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const { configured, user, order } = await getCustomerOrder(id);

  if (!configured || !user) {
    return <AccountGate configured={configured} title="Log in to view this order" />;
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-bold text-electric"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Orders
          </Link>
          <h1 className="mt-5 text-4xl font-black text-ink">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {new Date(order.createdAt).toLocaleString()} · {order.fulfillmentStatus}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="surface overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-black text-ink">Items</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {order.items?.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-black text-ink">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.variantName} · {item.sku}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">Qty {item.quantity}</p>
                </div>
                <p className="font-black text-ink">
                  {formatMoney(item.lineTotalCents, order.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="surface h-fit p-5">
          <h2 className="text-2xl font-black text-ink">Summary</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Payment</dt>
              <dd className="font-bold text-ink">{order.paymentStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Shipping status</dt>
              <dd className="font-bold text-ink">{order.fulfillmentStatus}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="text-xl font-black text-ink">
                {formatMoney(order.totalCents, order.currency)}
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
