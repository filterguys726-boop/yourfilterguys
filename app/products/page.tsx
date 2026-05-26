import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ query })
  ]);

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-shopred">Catalog</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Products</h1>
          <form className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <span className="sr-only">Search products</span>
              <input
                name="q"
                defaultValue={query}
                className="field h-11 pl-10"
                placeholder="Part number, brand, vehicle, or category"
              />
            </label>
            <button type="submit" className="button-primary h-11">
              <Search aria-hidden className="h-4 w-4" />
              Search
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/products" className="button-secondary px-3 py-1.5">
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="button-secondary px-3 py-1.5"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="surface p-8 text-center">
            <h2 className="text-2xl font-black text-ink">No products found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Try a different part number, vehicle, or category.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
