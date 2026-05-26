import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);
  const featured = products.slice(0, 3);

  return (
    <div>
      <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_74%_18%,rgba(198,149,44,0.24),transparent_30%),radial-gradient(circle_at_18%_88%,rgba(203,213,225,0.16),transparent_28%),linear-gradient(135deg,#0b1322_0%,#173f6d_52%,#111827_100%)] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[.86fr_1fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="inline-flex w-fit items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-amber-200 shadow-sm">
              <PackageCheck aria-hidden className="h-4 w-4" />
              Oil, air, cabin, fuel, and service parts
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.04] text-white sm:text-5xl lg:text-6xl">
              Filters that fit the first time.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              A sharper way to buy automotive filters and service parts:
              fitment clarity, real stock status, and checkout built for U.S.
              drivers and shops.
            </p>
            <form action="/products" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <span className="sr-only">Search products</span>
                <input
                  name="q"
                  className="h-11 w-full rounded-md border border-white/20 bg-white px-3 py-2 pl-10 text-sm text-slate-900 shadow-sm focus-ring"
                  placeholder="Search by part, SKU, vehicle, or brand"
                />
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-shopred px-5 py-2 text-sm font-black text-slate-950 shadow-sm transition hover:bg-amber-400 focus-ring" type="submit">
                <Search aria-hidden className="h-4 w-4" />
                Search
              </button>
            </form>
            <div className="mt-6 grid max-w-2xl gap-3 text-sm text-slate-200 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden className="h-4 w-4 text-amber-200" />
                Fitment checked
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck aria-hidden className="h-4 w-4 text-amber-200" />
                Variant-level stock
              </div>
              <div className="flex items-center gap-2">
                <Truck aria-hidden className="h-4 w-4 text-amber-200" />
                U.S. shipping
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-black text-ink shadow-sm transition hover:bg-slate-100 focus-ring">
                Shop filters
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/category/service-kits" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/15 focus-ring">
                Browse service kits
              </Link>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-white/15 bg-slate-950 shadow-panel lg:min-h-[520px]">
            <Image
              src="/hero-filter-products.png"
              alt="Automotive oil, cabin, air, and fuel filters arranged on a steel workbench"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,19,34,0.62),rgba(11,19,34,0.04)_42%,rgba(11,19,34,0.10)),linear-gradient(0deg,rgba(11,19,34,0.38),transparent_45%)]" />
            <div className="absolute left-4 top-4 rounded-md border border-white/20 bg-white/15 px-3 py-2 text-xs font-black uppercase text-white shadow-sm backdrop-blur sm:left-5 sm:top-5">
              Real parts. Clear fitment.
            </div>
            <div className="absolute bottom-5 left-5 right-5 overflow-hidden rounded-lg border border-white/20 bg-slate-950/86 text-white shadow-2xl backdrop-blur sm:left-auto sm:w-[380px]">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs font-black uppercase text-amber-200">
                  Example fitment check
                </p>
                <p className="mt-1 text-lg font-black">2018 Ford F-150</p>
                <p className="mt-1 text-sm text-slate-300">
                  5.0L V8 · XL, XLT, Lariat
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 text-xs font-black">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-2 text-white">
                  <BadgeCheck aria-hidden className="h-3.5 w-3.5 text-amber-200" />
                  Variant in stock
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-2 text-white">
                  <Truck aria-hidden className="h-3.5 w-3.5 text-amber-200" />
                  Ships in the U.S.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-electric">
                Shop by category
              </p>
              <h2 className="mt-2 text-3xl font-black text-ink">
                Service parts organized for quick buying
              </h2>
            </div>
            <Link href="/products" className="button-secondary w-fit">
              All products
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="surface p-5 transition hover:-translate-y-0.5 hover:shadow-panel"
              >
                <p className="text-xl font-black text-ink">{category.name}</p>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-electric">
                  Browse
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-bay">Inventory</p>
              <h2 className="mt-2 text-3xl font-black text-ink">
                Featured parts
              </h2>
            </div>
            <Link href="/products" className="button-primary w-fit">
              Shop catalog
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
