import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { AdminGate } from "@/components/admin-gate";
import { AdminNav } from "@/components/admin-nav";
import { getAdminProducts } from "@/lib/admin";
import { formatMoney } from "@/lib/format";

export default async function AdminProductsPage() {
  const { state, products } = await getAdminProducts();

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-2 text-4xl font-black text-ink">Products</h1>
              <div className="mt-6">
                <AdminNav />
              </div>
            </div>
            <Link href="/admin/products/new" className="button-primary w-fit">
              <PackagePlus aria-hidden className="h-4 w-4" />
              New product
            </Link>
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
                  <th className="px-5 py-3 font-bold">Category</th>
                  <th className="px-5 py-3 font-bold">Variants</th>
                  <th className="px-5 py-3 font-bold">Starting price</th>
                  <th className="px-5 py-3 font-bold">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-black text-electric"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
                    </td>
                    <td className="px-5 py-4">{product.category.name}</td>
                    <td className="px-5 py-4">{product.variants.length}</td>
                    <td className="px-5 py-4 font-black text-ink">
                      {formatMoney(
                        Math.min(
                          ...product.variants.map((variant) => variant.priceCents)
                        )
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {product.active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}
                {!products.length ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={5}>
                      No products yet.
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
