import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gauge, PackageCheck } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

function getLowestPrice(product: CatalogProduct) {
  const prices = product.variants
    .filter((variant) => variant.active)
    .map((variant) => variant.priceCents);

  return Math.min(...prices);
}

function getInventoryLabel(product: CatalogProduct) {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const hasStock = activeVariants.some((variant) => variant.stockQuantity > 0);
  const hasBackorder = activeVariants.some((variant) => variant.backorderAllowed);

  if (hasStock) {
    return "In stock";
  }

  if (hasBackorder) {
    return "Ships when restocked";
  }

  return "Sold out";
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="surface flex h-full flex-col overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block bg-white">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          width={900}
          height={700}
          unoptimized
          className="aspect-[4/3] w-full object-contain p-3"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span>{product.brand}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{product.category.name}</span>
          </div>
          <Link href={`/products/${product.slug}`}>
            <h2 className="text-lg font-bold leading-snug text-ink">
              {product.name}
            </h2>
          </Link>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-auto grid gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-bay">
              <PackageCheck aria-hidden className="h-3.5 w-3.5" />
              {getInventoryLabel(product)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-electric">
              <Gauge aria-hidden className="h-3.5 w-3.5" />
              {product.fitment.length} fitments
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              From{" "}
              <span className="text-lg font-black text-ink">
                {formatMoney(getLowestPrice(product))}
              </span>
            </p>
            <Link href={`/products/${product.slug}`} className="button-secondary px-3">
              <span>View</span>
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
