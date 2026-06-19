import { Fragment } from "react";
import { notFound } from "next/navigation";
import { AdminGate } from "@/components/admin-gate";
import { AdminErrorAlert } from "@/components/admin-error-alert";
import { AdminNav } from "@/components/admin-nav";
import { getAdminProduct } from "@/lib/admin";
import { getCategories } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import {
  adjustInventoryAction,
  createFitmentAction,
  deleteProductAction,
  upsertVariantAction
} from "@/app/admin/products/actions";
import { ProductForm } from "@/app/admin/products/product-form";

type AdminProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminProductPage({
  params,
  searchParams
}: AdminProductPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [{ state, product }, categories] = await Promise.all([
    getAdminProduct(id),
    getCategories()
  ]);

  if (!state.configured || !state.user || !state.isAdmin) {
    return <AdminGate state={state} />;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Admin</p>
          <h1 className="mt-2 text-4xl font-black text-ink">{product.name}</h1>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <AdminErrorAlert message={query?.error} />
        <ProductForm categories={categories} product={product} />

        <section className="surface border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-black uppercase text-shopred">Danger zone</p>
          <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="text-2xl font-black text-ink">Delete product</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-700">
                Remove this product from the catalog, including its variants and
                fitment records. Existing order history will stay available.
              </p>
            </div>
            <form action={deleteProductAction} className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="product_id" value={product.id} />
              <label className="grid gap-2">
                <span className="label">Type DELETE</span>
                <input
                  className="field min-w-44 border-red-200 bg-white"
                  name="delete_confirmation"
                  placeholder="DELETE"
                  required
                />
              </label>
              <button type="submit" className="button-danger self-end">
                Delete product
              </button>
            </form>
          </div>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-black text-ink">Variants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Variant</th>
                  <th className="px-5 py-3 font-bold">SKU</th>
                  <th className="px-5 py-3 font-bold">Price</th>
                  <th className="px-5 py-3 font-bold">Stock</th>
                  <th className="px-5 py-3 font-bold">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {product.variants.map((variant) => (
                  <Fragment key={variant.id}>
                    <tr>
                      <td className="px-5 py-4 font-bold text-ink">
                        {variant.name}
                      </td>
                      <td className="px-5 py-4">{variant.sku}</td>
                      <td className="px-5 py-4">
                        {formatMoney(variant.priceCents)}
                      </td>
                      <td className="px-5 py-4">{variant.stockQuantity}</td>
                      <td className="px-5 py-4">
                        <form action={adjustInventoryAction} className="flex gap-2">
                          <input type="hidden" name="product_id" value={product.id} />
                          <input type="hidden" name="variant_id" value={variant.id} />
                          <input
                            className="field w-24"
                            name="quantity_delta"
                            placeholder="+5"
                            inputMode="numeric"
                          />
                          <input
                            type="hidden"
                            name="reason"
                            value="admin_adjustment"
                          />
                          <button className="button-secondary px-3" type="submit">
                            Adjust
                          </button>
                        </form>
                      </td>
                    </tr>
                    <tr className="bg-slate-50/70">
                      <td className="px-5 py-5" colSpan={5}>
                        <form
                          action={upsertVariantAction}
                          className="grid gap-4 md:grid-cols-4"
                        >
                          <input type="hidden" name="product_id" value={product.id} />
                          <input type="hidden" name="variant_id" value={variant.id} />
                          <label className="grid gap-2">
                            <span className="label">Variant name</span>
                            <input
                              className="field"
                              name="name"
                              defaultValue={variant.name}
                              required
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="label">SKU</span>
                            <input
                              className="field"
                              name="sku"
                              defaultValue={variant.sku}
                              required
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="label">Price</span>
                            <input
                              className="field"
                              name="price"
                              defaultValue={(variant.priceCents / 100).toFixed(2)}
                              inputMode="decimal"
                              required
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="label">Cost</span>
                            <input
                              className="field"
                              name="cost"
                              defaultValue={
                                variant.costCents === null
                                  ? ""
                                  : (variant.costCents / 100).toFixed(2)
                              }
                              inputMode="decimal"
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="label">Stock</span>
                            <input
                              className="field"
                              name="stock_quantity"
                              defaultValue={variant.stockQuantity}
                              inputMode="numeric"
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="label">Weight oz</span>
                            <input
                              className="field"
                              name="weight_oz"
                              defaultValue={variant.weightOz ?? ""}
                              inputMode="numeric"
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="label">Dimensions</span>
                            <input
                              className="field"
                              name="dimensions_in"
                              defaultValue={variant.dimensionsIn ?? ""}
                              placeholder="10 x 6 x 3"
                            />
                          </label>
                          <div className="flex flex-wrap items-end gap-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                name="backorder_allowed"
                                defaultChecked={variant.backorderAllowed}
                              />
                              Backorder
                            </label>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                name="active"
                                defaultChecked={variant.active}
                              />
                              Active
                            </label>
                            <button type="submit" className="button-primary">
                              Save variant
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <form action={upsertVariantAction} className="grid gap-4 border-t border-slate-200 p-5 md:grid-cols-4">
            <input type="hidden" name="product_id" value={product.id} />
            <label className="grid gap-2">
              <span className="label">Variant name</span>
              <input className="field" name="name" required />
            </label>
            <label className="grid gap-2">
              <span className="label">SKU</span>
              <input className="field" name="sku" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Price</span>
              <input className="field" name="price" placeholder="24.99" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Cost</span>
              <input className="field" name="cost" placeholder="10.25" />
            </label>
            <label className="grid gap-2">
              <span className="label">Stock</span>
              <input className="field" name="stock_quantity" inputMode="numeric" defaultValue="0" />
            </label>
            <label className="grid gap-2">
              <span className="label">Weight oz</span>
              <input className="field" name="weight_oz" inputMode="numeric" />
            </label>
            <label className="grid gap-2">
              <span className="label">Dimensions</span>
              <input className="field" name="dimensions_in" placeholder="10 x 6 x 3" />
            </label>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" name="backorder_allowed" />
                Backorder
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" name="active" defaultChecked />
                Active
              </label>
              <button type="submit" className="button-primary">
                Add variant
              </button>
            </div>
          </form>
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-black text-ink">Fitment</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Year</th>
                  <th className="px-5 py-3 font-bold">Make</th>
                  <th className="px-5 py-3 font-bold">Model</th>
                  <th className="px-5 py-3 font-bold">Engine</th>
                  <th className="px-5 py-3 font-bold">Trim</th>
                  <th className="px-5 py-3 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {product.fitment.map((fitment) => (
                  <tr key={fitment.id}>
                    <td className="px-5 py-4">{fitment.year}</td>
                    <td className="px-5 py-4">{fitment.make}</td>
                    <td className="px-5 py-4">{fitment.model}</td>
                    <td className="px-5 py-4">{fitment.engine}</td>
                    <td className="px-5 py-4">{fitment.trim}</td>
                    <td className="px-5 py-4">{fitment.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={createFitmentAction} className="grid gap-4 border-t border-slate-200 p-5 md:grid-cols-6">
            <input type="hidden" name="product_id" value={product.id} />
            <label className="grid gap-2">
              <span className="label">Year</span>
              <input className="field" name="year" inputMode="numeric" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Make</span>
              <input className="field" name="make" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Model</span>
              <input className="field" name="model" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Engine</span>
              <input className="field" name="engine" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Trim</span>
              <input className="field" name="trim" />
            </label>
            <label className="grid gap-2">
              <span className="label">Notes</span>
              <input className="field" name="notes" />
            </label>
            <button type="submit" className="button-primary w-fit md:col-span-6">
              Add fitment
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
