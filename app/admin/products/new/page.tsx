import { AdminGate } from "@/components/admin-gate";
import { AdminErrorAlert } from "@/components/admin-error-alert";
import { AdminNav } from "@/components/admin-nav";
import { getAdminState } from "@/lib/admin";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "@/app/admin/products/product-form";

type NewProductPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewProductPage({
  searchParams
}: NewProductPageProps) {
  const params = await searchParams;
  const state = await getAdminState();

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  const categories = await getCategories();

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-ink">New product</h1>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminErrorAlert message={params?.error} />
        <ProductForm categories={categories} />
      </section>
    </div>
  );
}
