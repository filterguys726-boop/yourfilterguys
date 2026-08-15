create table if not exists public.square_catalog_products (
  product_id uuid primary key references public.products(id) on delete cascade,
  catalog_item_id text not null unique,
  catalog_image_id text,
  image_source_url text,
  sync_error text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.square_catalog_variants (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  catalog_variation_id text not null unique,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists square_catalog_variants_product_id_idx
  on public.square_catalog_variants(product_id);

drop trigger if exists set_square_catalog_products_updated_at
  on public.square_catalog_products;
create trigger set_square_catalog_products_updated_at
before update on public.square_catalog_products
for each row execute function public.set_updated_at();

drop trigger if exists set_square_catalog_variants_updated_at
  on public.square_catalog_variants;
create trigger set_square_catalog_variants_updated_at
before update on public.square_catalog_variants
for each row execute function public.set_updated_at();

alter table public.square_catalog_products enable row level security;
alter table public.square_catalog_variants enable row level security;

revoke all on table public.square_catalog_products from anon, authenticated;
revoke all on table public.square_catalog_variants from anon, authenticated;

comment on table public.square_catalog_products is
  'Private server-side mapping between storefront products and Square Catalog items.';
comment on table public.square_catalog_variants is
  'Private server-side mapping between storefront variants and Square Catalog variations.';
