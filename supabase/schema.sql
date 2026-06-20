create extension if not exists pgcrypto;

create sequence if not exists order_number_sequence start 1000;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  sku text not null unique,
  name text not null,
  slug text not null unique,
  brand text not null,
  short_description text not null default '',
  description text not null default '',
  image_url text,
  image_alt text,
  active boolean not null default true,
  inventory_behavior text not null default 'in_stock'
    check (inventory_behavior in ('in_stock', 'sold_out', 'backorder_allowed')),
  shipping_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price_cents integer not null check (price_cents >= 0),
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  stock_quantity integer not null default 0,
  backorder_allowed boolean not null default false,
  weight_oz numeric(10, 2),
  dimensions_in text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  image_alt text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_fitment (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  year integer not null check (year between 1900 and 2100),
  make text not null,
  model text not null,
  engine text not null,
  trim text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'TF-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('order_number_sequence')::text, 6, '0')
  ),
  stripe_checkout_session_id text not null unique,
  stripe_customer_id text,
  payment_intent_id text,
  customer_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  status text not null default 'confirmed',
  payment_status text not null default 'paid',
  fulfillment_status text not null default 'pending',
  currency text not null default 'usd',
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  sku text not null,
  quantity integer not null check (quantity > 0),
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity_delta integer not null,
  movement_type text not null,
  reason text,
  reference_type text,
  reference_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_slug_idx on public.products(slug);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists vehicle_fitment_product_id_idx on public.vehicle_fitment(product_id);
create index if not exists vehicle_fitment_lookup_idx on public.vehicle_fitment(year, make, model);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_customer_email_idx on public.orders(lower(customer_email));
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists inventory_movements_variant_id_idx on public.inventory_movements(variant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

drop trigger if exists set_vehicle_fitment_updated_at on public.vehicle_fitment;
create trigger set_vehicle_fitment_updated_at
before update on public.vehicle_fitment
for each row execute function public.set_updated_at();

drop trigger if exists set_customer_profiles_updated_at on public.customer_profiles;
create trigger set_customer_profiles_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.customer_profiles.full_name, excluded.full_name);

  update public.orders
  set customer_id = new.id
  where customer_id is null
    and lower(customer_email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.adjust_inventory(
  variant_id_input uuid,
  quantity_delta_input integer,
  reason_input text default 'admin_adjustment'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  update public.product_variants
  set stock_quantity = stock_quantity + quantity_delta_input
  where id = variant_id_input;

  insert into public.inventory_movements (
    variant_id,
    quantity_delta,
    movement_type,
    reason,
    reference_type,
    created_by
  )
  values (
    variant_id_input,
    quantity_delta_input,
    'admin_adjustment',
    reason_input,
    'admin',
    auth.uid()
  );
end;
$$;

create or replace function public.process_paid_checkout(
  session_id_input text,
  stripe_customer_id_input text,
  payment_intent_id_input text,
  customer_id_input uuid,
  customer_email_input text,
  currency_input text,
  subtotal_cents_input integer,
  tax_cents_input integer,
  shipping_cents_input integer,
  total_cents_input integer,
  shipping_address_input jsonb,
  items_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order_id uuid;
  new_order_id uuid;
  item jsonb;
  item_quantity integer;
  variant_record record;
begin
  select id
  into existing_order_id
  from public.orders
  where stripe_checkout_session_id = session_id_input;

  if existing_order_id is not null then
    return existing_order_id;
  end if;

  insert into public.orders (
    stripe_checkout_session_id,
    stripe_customer_id,
    payment_intent_id,
    customer_id,
    customer_email,
    status,
    payment_status,
    fulfillment_status,
    currency,
    subtotal_cents,
    tax_cents,
    shipping_cents,
    total_cents,
    shipping_address
  )
  values (
    session_id_input,
    stripe_customer_id_input,
    payment_intent_id_input,
    customer_id_input,
    customer_email_input,
    'confirmed',
    'paid',
    'pending',
    currency_input,
    subtotal_cents_input,
    tax_cents_input,
    shipping_cents_input,
    total_cents_input,
    shipping_address_input
  )
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(items_input)
  loop
    item_quantity := greatest((item ->> 'quantity')::integer, 1);

    select id, product_id, stock_quantity, backorder_allowed
    into variant_record
    from public.product_variants
    where id = (item ->> 'variant_id')::uuid
    for update;

    if variant_record.id is null then
      raise exception 'Variant % does not exist', item ->> 'variant_id';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      sku,
      quantity,
      unit_amount_cents,
      line_total_cents
    )
    values (
      new_order_id,
      (item ->> 'product_id')::uuid,
      variant_record.id,
      item ->> 'product_name',
      item ->> 'variant_name',
      item ->> 'sku',
      item_quantity,
      (item ->> 'unit_amount_cents')::integer,
      (item ->> 'line_total_cents')::integer
    );

    update public.product_variants
    set stock_quantity = stock_quantity - item_quantity
    where id = variant_record.id;

    insert into public.inventory_movements (
      variant_id,
      quantity_delta,
      movement_type,
      reason,
      reference_type,
      reference_id
    )
    values (
      variant_record.id,
      -item_quantity,
      'sale',
      'stripe_checkout_completed',
      'order',
      new_order_id
    );
  end loop;

  return new_order_id;
end;
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.vehicle_fitment enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories for select
using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (active = true or public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
on public.product_variants for select
using (
  active = true and exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.active = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage variants" on public.product_variants;
create policy "Admins manage variants"
on public.product_variants for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
on public.product_images for select
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.active = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read fitment" on public.vehicle_fitment;
create policy "Public can read fitment"
on public.vehicle_fitment for select
using (
  exists (
    select 1
    from public.products
    where products.id = vehicle_fitment.product_id
      and products.active = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage fitment" on public.vehicle_fitment;
create policy "Admins manage fitment"
on public.vehicle_fitment for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers read own profile" on public.customer_profiles;
create policy "Customers read own profile"
on public.customer_profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "Customers update own profile" on public.customer_profiles;
create policy "Customers update own profile"
on public.customer_profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can read own admin row" on public.admin_users;
create policy "Users can read own admin row"
on public.admin_users for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage admin users" on public.admin_users;
create policy "Admins manage admin users"
on public.admin_users for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders"
on public.orders for select
using (
  customer_id = auth.uid()
  or lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_admin()
);

drop policy if exists "Customers read own order items" on public.order_items;
create policy "Customers read own order items"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (
        orders.customer_id = auth.uid()
        or lower(orders.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or public.is_admin()
      )
  )
);

drop policy if exists "Admins read inventory movements" on public.inventory_movements;
create policy "Admins read inventory movements"
on public.inventory_movements for select
using (public.is_admin());

grant execute on function public.adjust_inventory(uuid, integer, text) to authenticated;
revoke execute on function public.process_paid_checkout(
  text, text, text, uuid, text, text, integer, integer, integer, integer, jsonb, jsonb
) from public, anon, authenticated;
grant execute on function public.process_paid_checkout(
  text, text, text, uuid, text, text, integer, integer, integer, integer, jsonb, jsonb
) to service_role;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());
