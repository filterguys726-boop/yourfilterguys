alter table public.orders
  alter column stripe_checkout_session_id drop not null;

alter table public.orders
  add column if not exists payment_provider text not null default 'stripe',
  add column if not exists provider_checkout_id text,
  add column if not exists provider_order_id text,
  add column if not exists provider_payment_id text;

update public.orders
set
  payment_provider = 'stripe',
  provider_checkout_id = coalesce(provider_checkout_id, stripe_checkout_session_id),
  provider_payment_id = coalesce(provider_payment_id, payment_intent_id)
where stripe_checkout_session_id is not null;

alter table public.orders
  drop constraint if exists orders_payment_provider_check;

alter table public.orders
  add constraint orders_payment_provider_check
  check (payment_provider in ('stripe', 'square'));

create unique index if not exists orders_provider_checkout_id_unique
  on public.orders(payment_provider, provider_checkout_id)
  where provider_checkout_id is not null;

create unique index if not exists orders_provider_order_id_unique
  on public.orders(payment_provider, provider_order_id)
  where provider_order_id is not null;

create unique index if not exists orders_provider_payment_id_unique
  on public.orders(payment_provider, provider_payment_id)
  where provider_payment_id is not null;

create or replace function public.process_paid_payment(
  provider_input text,
  provider_checkout_id_input text,
  provider_order_id_input text,
  provider_payment_id_input text,
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
  lock_key text;
begin
  if provider_input not in ('stripe', 'square') then
    raise exception 'Unsupported payment provider %', provider_input;
  end if;

  if coalesce(provider_payment_id_input, '') = ''
    and coalesce(provider_order_id_input, '') = ''
    and coalesce(provider_checkout_id_input, '') = '' then
    raise exception 'A provider payment, order, or checkout ID is required';
  end if;

  if coalesce(customer_email_input, '') = '' then
    raise exception 'Customer email is required';
  end if;

  if jsonb_array_length(coalesce(items_input, '[]'::jsonb)) = 0 then
    raise exception 'At least one paid order item is required';
  end if;

  lock_key := provider_input || ':' || coalesce(
    provider_payment_id_input,
    provider_order_id_input,
    provider_checkout_id_input
  );
  perform pg_advisory_xact_lock(hashtextextended(lock_key, 0));

  select id
  into existing_order_id
  from public.orders
  where payment_provider = provider_input
    and (
      (provider_payment_id_input is not null and provider_payment_id = provider_payment_id_input)
      or (provider_order_id_input is not null and provider_order_id = provider_order_id_input)
      or (provider_checkout_id_input is not null and provider_checkout_id = provider_checkout_id_input)
    )
  limit 1;

  if existing_order_id is not null then
    return existing_order_id;
  end if;

  insert into public.orders (
    payment_provider,
    provider_checkout_id,
    provider_order_id,
    provider_payment_id,
    stripe_checkout_session_id,
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
    provider_input,
    nullif(provider_checkout_id_input, ''),
    nullif(provider_order_id_input, ''),
    nullif(provider_payment_id_input, ''),
    case when provider_input = 'stripe' then nullif(provider_checkout_id_input, '') end,
    case when provider_input = 'stripe' then nullif(provider_payment_id_input, '') end,
    customer_id_input,
    customer_email_input,
    'confirmed',
    'paid',
    'pending',
    lower(coalesce(currency_input, 'usd')),
    greatest(coalesce(subtotal_cents_input, 0), 0),
    greatest(coalesce(tax_cents_input, 0), 0),
    greatest(coalesce(shipping_cents_input, 0), 0),
    greatest(coalesce(total_cents_input, 0), 0),
    shipping_address_input
  )
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(items_input)
  loop
    item_quantity := greatest((item ->> 'quantity')::integer, 1);

    select id, product_id, stock_quantity, backorder_allowed
    into strict variant_record
    from public.product_variants
    where id = (item ->> 'variant_id')::uuid
    for update;

    if not variant_record.backorder_allowed
      and variant_record.stock_quantity < item_quantity then
      raise exception 'Insufficient inventory for variant %', item ->> 'variant_id';
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
      variant_record.product_id,
      variant_record.id,
      item ->> 'product_name',
      item ->> 'variant_name',
      item ->> 'sku',
      item_quantity,
      greatest((item ->> 'unit_amount_cents')::integer, 0),
      greatest((item ->> 'line_total_cents')::integer, 0)
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
      provider_input || '_checkout_completed',
      'order',
      new_order_id
    );
  end loop;

  return new_order_id;
end;
$$;

revoke execute on function public.process_paid_payment(
  text, text, text, text, uuid, text, text,
  integer, integer, integer, integer, jsonb, jsonb
) from public, anon, authenticated;

grant execute on function public.process_paid_payment(
  text, text, text, text, uuid, text, text,
  integer, integer, integer, integer, jsonb, jsonb
) to service_role;
