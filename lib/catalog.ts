import { createServerSupabaseClient } from "@/lib/supabase";
import { sampleCategories, sampleProducts } from "@/lib/sample-catalog";
import type {
  CatalogProduct,
  Category,
  ProductVariant,
  ProductImage,
  VehicleFitment
} from "@/lib/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  active: boolean;
  inventory_behavior: CatalogProduct["inventoryBehavior"];
  shipping_notes: string | null;
  categories: Category | Category[] | null;
  product_variants: Array<{
    id: string;
    product_id: string;
    name: string;
    sku: string;
    price_cents: number;
    cost_cents: number | null;
    stock_quantity: number;
    backorder_allowed: boolean;
    weight_oz: number | null;
    dimensions_in: string | null;
    active: boolean;
  }>;
  vehicle_fitment: Array<{
    id: string;
    product_id: string;
    year: number;
    make: string;
    model: string;
    engine: string;
    trim: string | null;
    notes: string | null;
  }>;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  image_alt: string | null;
  position: number;
};

function mapProduct(
  row: ProductRow,
  imageGallery: ProductImage[] = []
): CatalogProduct {
  const category = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;
  const fallbackImageUrl = row.image_url || "/product-oil-filter.svg";
  const fallbackImageAlt = row.image_alt || row.name;
  const gallery = imageGallery.length
    ? [
        ...(!imageGallery.some((image) => image.url === fallbackImageUrl)
          ? [{ url: fallbackImageUrl, alt: fallbackImageAlt, position: 0 }]
          : []),
        ...imageGallery
      ]
    : [{ url: fallbackImageUrl, alt: fallbackImageAlt, position: 0 }];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    brand: row.brand,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    category:
      category ??
      sampleCategories.find((item) => item.slug === "engine-filters")!,
    imageUrl: gallery[0]?.url ?? fallbackImageUrl,
    imageAlt: gallery[0]?.alt ?? fallbackImageAlt,
    imageGallery: gallery,
    active: row.active,
    inventoryBehavior: row.inventory_behavior,
    shippingNotes: row.shipping_notes,
    variants: row.product_variants.map<ProductVariant>((variant) => ({
      id: variant.id,
      productId: variant.product_id,
      name: variant.name,
      sku: variant.sku,
      priceCents: variant.price_cents,
      costCents: variant.cost_cents,
      stockQuantity: variant.stock_quantity,
      backorderAllowed: variant.backorder_allowed,
      weightOz: variant.weight_oz,
      dimensionsIn: variant.dimensions_in,
      active: variant.active
    })),
    fitment: row.vehicle_fitment.map<VehicleFitment>((fitment) => ({
      id: fitment.id,
      productId: fitment.product_id,
      year: fitment.year,
      make: fitment.make,
      model: fitment.model,
      engine: fitment.engine,
      trim: fitment.trim,
      notes: fitment.notes
    }))
  };
}

async function getProductImagesByProductId(productIds: string[]) {
  const supabase = await createServerSupabaseClient();

  if (!supabase || !productIds.length) {
    return new Map<string, ProductImage[]>();
  }

  const { data, error } = await supabase
    .from("product_images")
    .select("id,product_id,image_url,image_alt,position")
    .in("product_id", productIds)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return new Map<string, ProductImage[]>();
  }

  return (data as ProductImageRow[]).reduce((items, image) => {
    const productImages = items.get(image.product_id) ?? [];
    productImages.push({
      id: image.id,
      productId: image.product_id,
      url: image.image_url,
      alt: image.image_alt ?? "Product image",
      position: image.position
    });
    items.set(image.product_id, productImages);
    return items;
  }, new Map<string, ProductImage[]>());
}

function filterSamples(options?: { categorySlug?: string; query?: string }) {
  const normalizedQuery = options?.query?.trim().toLowerCase();

  return sampleProducts.filter((product) => {
    const matchesCategory = options?.categorySlug
      ? product.category.slug === options.categorySlug
      : true;
    const matchesQuery = normalizedQuery
      ? [
          product.name,
          product.brand,
          product.sku,
          product.shortDescription,
          product.category.name,
          ...product.fitment.map(
            (fitment) =>
              `${fitment.year} ${fitment.make} ${fitment.model} ${fitment.engine}`
          )
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    return matchesCategory && matchesQuery;
  });
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return sampleCategories;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .order("name");

  if (error || !data?.length) {
    return sampleCategories;
  }

  return data;
}

export async function getProducts(options?: {
  categorySlug?: string;
  query?: string;
  includeInactive?: boolean;
}): Promise<CatalogProduct[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return filterSamples(options);
  }

  let productQuery = supabase
    .from("products")
    .select(
      `
      id,name,slug,sku,brand,short_description,description,image_url,image_alt,
      active,inventory_behavior,shipping_notes,
      categories:category_id(id,name,slug,description),
      product_variants(id,product_id,name,sku,price_cents,cost_cents,stock_quantity,backorder_allowed,weight_oz,dimensions_in,active),
      vehicle_fitment(id,product_id,year,make,model,engine,trim,notes)
    `
    )
    .order("name");

  if (!options?.includeInactive) {
    productQuery = productQuery.eq("active", true);
  }

  if (options?.categorySlug) {
    const categories = await getCategories();
    const category = categories.find((item) => item.slug === options.categorySlug);
    if (category) {
      productQuery = productQuery.eq("category_id", category.id);
    }
  }

  const { data, error } = await productQuery;

  if (error || !data) {
    return filterSamples(options);
  }

  const rows = data as unknown as ProductRow[];
  const imagesByProductId = await getProductImagesByProductId(
    rows.map((product) => product.id)
  );
  const products = rows.map((product) =>
    mapProduct(product, imagesByProductId.get(product.id) ?? [])
  );

  if (options?.query) {
    const normalizedQuery = options.query.trim().toLowerCase();
    return products.filter((product) =>
      [
        product.name,
        product.brand,
        product.sku,
        product.shortDescription,
        product.category.name,
        ...product.fitment.map(
          (fitment) =>
            `${fitment.year} ${fitment.make} ${fitment.model} ${fitment.engine}`
        )
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }

  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductsByVariantIds(variantIds: string[]) {
  const products = await getProducts();
  return products.filter((product) =>
    product.variants.some((variant) => variantIds.includes(variant.id))
  );
}
