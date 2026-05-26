import Link from "next/link";
import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { adjustInventoryAction } from "@/app/admin/products/actions";
import { getAdminProducts } from "@/lib/admin";

export default async function AdminInventoryPage() {
  const { state, products } = await getAdminProducts();

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  const rows = products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant }))
  );

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Inventory</h1>
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
                  <th className="px-5 py-3 font-bold">Product</th>
                  <th className="px-5 py-3 font-bold">Variant</th>
                  <th className="px-5 py-3 font-bold">Stock</th>
                  <th className="px-5 py-3 font-bold">Backorder</th>
                  <th className="px-5 py-3 font-bold">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map(({ product, variant }) => (
                  <tr key={variant.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-black text-electric"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{variant.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{variant.sku}</p>
                    </td>
                    <td className="px-5 py-4 font-black text-ink">
                      {variant.stockQuantity}
                    </td>
                    <td className="px-5 py-4">
                      {variant.backorderAllowed ? "Allowed" : "Disabled"}
                    </td>
                    <td className="px-5 py-4">
                      <form action={adjustInventoryAction} className="flex gap-2">
                        <input type="hidden" name="product_id" value="" />
                        <input type="hidden" name="variant_id" value={variant.id} />
                        <input
                          className="field w-24"
                          name="quantity_delta"
                          placeholder="-1"
                          inputMode="numeric"
                        />
                        <input
                          className="field w-40"
                          name="reason"
                          placeholder="cycle_count"
                        />
                        <button className="button-secondary px-3" type="submit">
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={5}>
                      No variants yet.
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
