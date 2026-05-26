import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { titleCase } from "@/lib/format";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: slug })
  ]);
  const category = categories.find((item) => item.slug === slug);

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-electric"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Products
          </Link>
          <p className="mt-5 text-sm font-black uppercase text-shopred">
            Category
          </p>
          <h1 className="mt-2 text-4xl font-black text-ink">
            {category?.name ?? titleCase(slug)}
          </h1>
          {category?.description ? (
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {category.description}
            </p>
          ) : null}
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
            <h2 className="text-2xl font-black text-ink">No active products</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add products to this category in the admin dashboard.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
