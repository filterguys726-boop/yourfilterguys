import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Ruler, Truck } from "lucide-react";
import { AddToCartPanel } from "@/components/add-to-cart-panel";
import { FitmentTable } from "@/components/fitment-table";
import { ProductGallery } from "@/components/product-gallery";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const activeVariants = product.variants.filter((variant) => variant.active);
  const lowestPrice = activeVariants.length
    ? Math.min(...activeVariants.map((variant) => variant.priceCents))
    : null;
  const gallery = product.imageGallery?.length
    ? product.imageGallery
    : [{ url: product.imageUrl, alt: product.imageAlt }];

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-electric"
            data-reveal="fade-right"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Back to products
          </Link>

          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
              <div data-reveal="fade-right" data-reveal-delay="1">
                <ProductGallery images={gallery} />
              </div>

              <div data-reveal="fade-up" data-reveal-delay="2">
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                  <span>{product.brand}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{product.category.name}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{product.sku}</span>
                </div>
                <h1 className="mt-3 text-4xl font-black leading-tight text-ink">
                  {product.name}
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {product.description}
                </p>
                <div className={`mt-6 grid gap-3 ${product.fitmentEnabled && product.fitment.length > 0 ? "sm:grid-cols-2" : ""}`}>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Starting at
                    </p>
                    <p className="mt-1 text-3xl font-black text-ink">
                      {lowestPrice === null ? "Pending" : formatMoney(lowestPrice)}
                    </p>
                  </div>
                  {product.fitmentEnabled && product.fitment.length > 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Vehicle applications
                      </p>
                      <p className="mt-1 text-3xl font-black text-ink">
                        {product.fitment.length}
                      </p>
                    </div>
                  ) : null}
                </div>
                <dl className="mt-6 grid gap-3 text-sm text-slate-600">
                  <div className="flex gap-3">
                    <BadgeCheck aria-hidden className="mt-0.5 h-4 w-4 text-bay" />
                    <div>
                      <dt className="font-bold text-ink">Variant-level stock</dt>
                      <dd>Inventory status is checked per SKU before checkout.</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Truck aria-hidden className="mt-0.5 h-4 w-4 text-electric" />
                    <div>
                      <dt className="font-bold text-ink">Shipping</dt>
                      <dd>{product.shippingNotes ?? "Calculated at checkout."}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Ruler aria-hidden className="mt-0.5 h-4 w-4 text-shopred" />
                    <div>
                      <dt className="font-bold text-ink">Package specs</dt>
                      <dd>
                        {activeVariants
                          .map((variant) => variant.dimensionsIn)
                          .filter(Boolean)
                          .join(" / ") || "Dimensions vary by variant."}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>

            <div data-reveal="fade-left" data-reveal-delay="3">
              <AddToCartPanel product={product} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {product.fitmentEnabled && product.fitment.length > 0 ? (
          <div data-reveal="fade-up">
            <FitmentTable fitment={product.fitment} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
