alter table public.products
add column if not exists fitment_enabled boolean not null default false;

update public.products
set fitment_enabled = false
where fitment_enabled is distinct from false;
