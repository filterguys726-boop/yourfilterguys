import type { Category, CatalogProduct } from "@/lib/types";
import { upsertProductAction } from "@/app/admin/products/actions";

export function ProductForm({
  categories,
  product
}: {
  categories: Category[];
  product?: CatalogProduct | null;
}) {
  return (
    <form action={upsertProductAction} className="surface p-6">
      <input type="hidden" name="product_id" value={product?.id ?? ""} />
      <input
        type="hidden"
        name="existing_image_url"
        value={product?.imageUrl ?? ""}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="label">Product name</span>
          <input
            className="field"
            name="name"
            defaultValue={product?.name ?? ""}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Slug</span>
          <input
            className="field"
            name="slug"
            defaultValue={product?.slug ?? ""}
            placeholder="cummins-fuel-shutoff-valve"
            required
          />
          <span className="text-xs font-semibold text-slate-500">
            Use URL words only, without a leading slash.
          </span>
        </label>
        <label className="grid gap-2">
          <span className="label">Product SKU</span>
          <input className="field" name="sku" defaultValue={product?.sku ?? ""} required />
        </label>
        <label className="grid gap-2">
          <span className="label">Brand</span>
          <input
            className="field"
            name="brand"
            defaultValue={product?.brand ?? ""}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Category</span>
          <select
            className="field"
            name="category_id"
            defaultValue={product?.category.id ?? categories[0]?.id ?? ""}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Inventory behavior</span>
          <select
            className="field"
            name="inventory_behavior"
            defaultValue={product?.inventoryBehavior ?? "in_stock"}
          >
            <option value="in_stock">In stock</option>
            <option value="sold_out">Sold out</option>
            <option value="backorder_allowed">Backorder allowed</option>
          </select>
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="label">Short description</span>
          <input
            className="field"
            name="short_description"
            defaultValue={product?.shortDescription ?? ""}
            required
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="label">Description</span>
          <textarea
            className="field min-h-32"
            name="description"
            defaultValue={product?.description ?? ""}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Image URL</span>
          <input
            className="field"
            name="image_url"
            defaultValue={product?.imageUrl ?? ""}
            placeholder="/product-oil-filter.svg"
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Upload primary image</span>
          <input className="field" name="image_file" type="file" accept="image/*" />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="label">Add gallery images</span>
          <input
            className="field"
            name="image_files"
            type="file"
            accept="image/*"
            multiple
          />
          <span className="text-xs font-semibold text-slate-500">
            Upload one or more additional product angles, labels, packaging
            shots, or detail photos.
          </span>
        </label>
        {product?.imageGallery?.length ? (
          <div className="md:col-span-2">
            <p className="label">Current gallery</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {product.imageGallery.map((image) => (
                <div
                  key={image.url}
                  className="overflow-hidden rounded-md border border-slate-200 bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="aspect-square w-full object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <label className="grid gap-2">
          <span className="label">Image alt text</span>
          <input
            className="field"
            name="image_alt"
            defaultValue={product?.imageAlt ?? ""}
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Shipping notes</span>
          <input
            className="field"
            name="shipping_notes"
            defaultValue={product?.shippingNotes ?? ""}
          />
        </label>
        <label className="flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
            className="h-4 w-4 rounded border-slate-300"
          />
          Active storefront product
        </label>
      </div>

      <button type="submit" className="button-primary mt-6">
        {product ? "Save product" : "Create product"}
      </button>
    </form>
  );
}
