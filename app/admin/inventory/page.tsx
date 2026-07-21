import { AdminGate } from "@/components/admin-gate";
import {
  AdminInventoryTable,
  type AdminInventoryRow
} from "@/components/admin-inventory-table";
import { AdminNav } from "@/components/admin-nav";
import { getAdminProducts } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const { state, products } = await getAdminProducts();

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  const rows: AdminInventoryRow[] = products.flatMap((product) =>
    product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      variantId: variant.id,
      variantName: variant.name,
      variantSku: variant.sku,
      stockQuantity: variant.stockQuantity,
      backorderAllowed: variant.backorderAllowed
    }))
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
        <AdminInventoryTable rows={rows} />
      </section>
    </div>
  );
}
