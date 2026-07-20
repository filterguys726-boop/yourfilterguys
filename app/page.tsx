import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  Wrench
} from "lucide-react";
import { FeaturedPartsSlider } from "@/components/featured-parts-slider";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);
  const featured = products.slice(0, 6);
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
      <section
        className="relative overflow-hidden border-b border-slate-200 bg-slate-950 bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 74% 18%, rgba(198, 149, 44, 0.18), transparent 30%), linear-gradient(135deg, rgba(5, 12, 24, 0.92) 0%, rgba(11, 43, 79, 0.42) 52%, rgba(5, 12, 24, 0.68) 100%), url('/yourfilterguys-hero.jpg')",
          backgroundSize: "138%",
          backgroundPosition: "-120px 0",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div aria-hidden className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="flex max-w-3xl flex-col justify-center">
            <p data-enter="up" data-enter-delay="1" className="inline-flex w-fit items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-amber-200 shadow-sm">
              <PackageCheck aria-hidden className="h-4 w-4 text-shopred" />
              Oil, air, cabin, fuel, and service parts
            </p>
            <div data-enter="up" data-enter-delay="2">
              <h1 className="brand-condensed hero-headline-shadow mt-5 max-w-3xl text-5xl uppercase leading-[0.92] sm:text-6xl lg:text-7xl">
                <span className="block text-white">Filters &amp; diesel parts.</span>
                <span className="mt-2 block text-shopred">We&apos;ve got you covered.</span>
              </h1>
            </div>
            <p data-enter="up" data-enter-delay="3" className="mt-5 max-w-3xl text-xl leading-8 text-slate-200 sm:text-2xl sm:leading-9">
              OEM &amp; aftermarket filters for Cummins, Detroit,
              <br className="hidden sm:block" /> Paccar, Caterpillar, Volvo &amp; more.
            </p>
            <form action="/products" data-enter="up" data-enter-delay="4" className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                />
                <span className="sr-only">Search products</span>
                <input
                  name="q"
                  className="hero-search-field h-14 w-full rounded-md border px-4 py-3 pl-12 text-base shadow-sm focus-ring"
                  placeholder="Search by part, SKU, or brand"
                />
              </label>
              <button className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-shopred px-7 py-3 text-base font-black text-slate-950 shadow-sm transition hover:bg-amber-400 focus-ring" type="submit">
                <Search aria-hidden className="h-5 w-5" />
                Search
              </button>
            </form>
            <div data-enter="fade" data-enter-delay="5" className="mt-4 flex max-w-2xl items-start gap-2 rounded-md border border-white/15 bg-slate-950/70 px-3 py-2.5 text-sm leading-5 text-slate-200 backdrop-blur-sm">
              <Wrench aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-shopred" />
              <p>
                Can&apos;t find a part? We can source it. Send your VIN, engine serial
                number, equipment model, or existing part number.
              </p>
            </div>
            <div className="mt-6 grid max-w-2xl gap-3 text-sm text-slate-200 sm:grid-cols-3">
              <div data-enter="up" data-enter-delay="6" className="flex items-center gap-2">
                <BadgeCheck aria-hidden className="h-4 w-4 text-shopred" />
                Clear product details
              </div>
              <div data-enter="up" data-enter-delay="7" className="flex items-center gap-2">
                <ShieldCheck aria-hidden className="h-4 w-4 text-shopred" />
                Secure checkout
              </div>
              <div data-enter="up" data-enter-delay="8" className="flex items-center gap-2">
                <Truck aria-hidden className="h-4 w-4 text-shopred" />
                U.S. shipping
              </div>
            </div>
            <div data-enter="fade" data-enter-delay="9" className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-black text-ink shadow-sm transition hover:bg-slate-100 focus-ring">
                Find my part
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/category/service-kits" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/15 focus-ring">
                Browse service kits
              </Link>
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
          <div data-reveal="fade-up" data-reveal-delay="1" className="mt-7">
            <FeaturedPartsSlider products={featured} />
          </div>
        </div>
      </section>

      {brands.length ? (
        <section className="border-b border-slate-200 bg-paper">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div data-reveal="fade-up" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                  data-reveal="fade-up"
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
          <div data-reveal="fade-up" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
                data-reveal="fade-up"
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
          <div data-reveal="fade-right" className="flex flex-col justify-center">
            <p className="text-sm font-black uppercase text-amber-200">
              Product confidence
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Know before you buy.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
              Product pages keep part numbers, descriptions, inventory, and
              shipping details visible where buyers make decisions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-white/15 focus-ring">
                Contact support
              </Link>
            </div>
          </div>
          <div data-reveal="fade-left" data-reveal-delay="1" className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: BadgeCheck,
                title: "Part numbers",
                text: "SKU and OE references stay visible where buyers make decisions."
              },
              {
                icon: Wrench,
                title: "Service details",
                text: "Descriptions and product references are easy to review before checkout."
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
