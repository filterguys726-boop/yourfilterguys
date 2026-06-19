import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  Wrench
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);
  const featured = products.slice(0, 3);
  const brands = Array.from(
    products.reduce((items, product) => {
      const brand = product.brand.trim();
      if (!brand) {
        return items;
      }

      items.set(brand, (items.get(brand) ?? 0) + 1);
      return items;
    }, new Map<string, number>())
  ).sort(([brandA], [brandB]) => brandA.localeCompare(brandB));

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
                Find my part
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

      <section className="border-b border-slate-200 bg-white">
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

      {brands.length ? (
        <section className="border-b border-slate-200 bg-paper">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-bay">
                  Shop by brand
                </p>
                <h2 className="mt-2 text-3xl font-black text-ink">
                  Find parts by manufacturer
                </h2>
              </div>
              <Link href="/products" className="button-secondary w-fit">
                All brands
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {brands.map(([brandName, count]) => (
                <Link
                  key={brandName}
                  href={`/products?q=${encodeURIComponent(brandName)}`}
                  className="surface p-5 transition hover:-translate-y-0.5 hover:shadow-panel"
                >
                  <p className="text-xl font-black text-ink">{brandName}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {count} {count === 1 ? "active product" : "active products"}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-electric">
                    Search brand
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-slate-200 bg-white">
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

      <section className="bg-[radial-gradient(circle_at_82%_12%,rgba(198,149,44,0.22),transparent_28%),linear-gradient(135deg,#0b1322_0%,#173f6d_58%,#111827_100%)] text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase text-amber-200">
              Fitment confidence
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Know before you buy.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
              Product pages are built around fitment clarity, part numbers, and
              variant-level stock so buyers can confirm the right part before
              checkout.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/fitment-help" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-black text-ink shadow-sm transition hover:bg-slate-100 focus-ring">
                Fitment help
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/15 focus-ring">
                Contact support
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: BadgeCheck,
                title: "Part numbers",
                text: "SKU and OE references stay visible where buyers make decisions."
              },
              {
                icon: Wrench,
                title: "Vehicle details",
                text: "Year, make, model, engine, trim, and notes are shown together."
              },
              {
                icon: PackageCheck,
                title: "Stock status",
                text: "Variant inventory shows whether an item is ready or backorderable."
              },
              {
                icon: ShieldCheck,
                title: "Secure checkout",
                text: "Stripe Checkout handles payments, tax, shipping, and receipts."
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-sm backdrop-blur"
              >
                <item.icon aria-hidden className="h-5 w-5 text-amber-200" />
                <p className="mt-3 font-black text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
