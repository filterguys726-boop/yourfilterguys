insert into public.categories (id, name, slug, description)
values
  ('11111111-1111-4111-8111-111111111111', 'Engine Filters', 'engine-filters', 'Oil, air, and cabin filters for popular U.S. vehicles.'),
  ('22222222-2222-4222-8222-222222222222', 'Brake Parts', 'brake-parts', 'Pads and service parts for common maintenance jobs.'),
  ('33333333-3333-4333-8333-333333333333', 'Service Kits', 'service-kits', 'Bundled maintenance parts with clear fitment notes.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into public.products (
  id, category_id, sku, name, slug, brand, short_description, description,
  image_url, image_alt, active, inventory_behavior, shipping_notes
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'TF-XG10575',
    'Premium Synthetic Oil Filter XG10575',
    'premium-synthetic-oil-filter-xg10575',
    'Your Filter Guys',
    'Extended-life spin-on oil filter for high-mileage service.',
    'A premium synthetic media oil filter designed for clean oil flow, high dirt-holding capacity, and easy service intervals on compatible V6 and V8 applications.',
    '/product-oil-filter.svg',
    'Premium spin-on oil filter',
    true,
    'in_stock',
    'Ships in a protective corrugated sleeve.'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '11111111-1111-4111-8111-111111111111',
    'TF-CF11819',
    'Activated Carbon Cabin Air Filter CF11819',
    'activated-carbon-cabin-air-filter-cf11819',
    'ClearCabin',
    'Cabin filter with odor control for daily commuting.',
    'Activated carbon cabin filtration helps reduce dust, pollen, and odors while maintaining HVAC airflow on compatible sedans and crossovers.',
    '/product-cabin-filter.svg',
    'Pleated cabin air filter',
    true,
    'backorder_allowed',
    'Lightweight item eligible for standard shipping.'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '22222222-2222-4222-8222-222222222222',
    'TF-BP905',
    'Ceramic Front Brake Pad Set BP905',
    'ceramic-front-brake-pad-set-bp905',
    'StopLine',
    'Low-dust ceramic front pads with hardware kit.',
    'A front axle ceramic brake pad set built for quiet operation, smooth pedal feel, and low visible dust on compatible compact SUVs.',
    '/product-brake-pad.svg',
    'Ceramic brake pad set',
    true,
    'in_stock',
    'Ships as a front axle set with hardware.'
  )
on conflict (slug) do update
set name = excluded.name,
    brand = excluded.brand,
    short_description = excluded.short_description,
    description = excluded.description,
    image_url = excluded.image_url,
    image_alt = excluded.image_alt,
    active = excluded.active,
    inventory_behavior = excluded.inventory_behavior,
    shipping_notes = excluded.shipping_notes;

insert into public.product_variants (
  id, product_id, name, sku, price_cents, cost_cents, stock_quantity,
  backorder_allowed, weight_oz, dimensions_in, active
)
values
  ('a1111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Single filter', 'TF-XG10575-1', 1499, 760, 18, false, 11, '4 x 4 x 5', true),
  ('a2222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Case of 6', 'TF-XG10575-6', 7999, 4260, 4, true, 72, '13 x 9 x 6', true),
  ('b1111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Standard carbon', 'TF-CF11819-C', 2199, 970, 0, true, 8, '10 x 9 x 2', true),
  ('b2222222-2222-4222-8222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Premium allergen', 'TF-CF11819-P', 2799, 1230, 9, false, 9, '10 x 9 x 2', true),
  ('c1111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Front axle set', 'TF-BP905-F', 6499, 3125, 11, false, 58, '9 x 6 x 3', true)
on conflict (sku) do update
set name = excluded.name,
    price_cents = excluded.price_cents,
    cost_cents = excluded.cost_cents,
    stock_quantity = excluded.stock_quantity,
    backorder_allowed = excluded.backorder_allowed,
    weight_oz = excluded.weight_oz,
    dimensions_in = excluded.dimensions_in,
    active = excluded.active;

insert into public.vehicle_fitment (
  product_id, year, make, model, engine, trim, notes
)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2018, 'Ford', 'F-150', '5.0L V8', 'XL, XLT, Lariat', 'Excludes heavy-duty payload package.'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2020, 'Ford', 'F-150', '3.5L V6 EcoBoost', 'XLT, Lariat', 'Confirm OE filter thread before purchase.'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2021, 'Lincoln', 'Navigator', '3.5L V6', 'Base, Reserve', 'Fits standard oil cooler.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 2019, 'Toyota', 'Camry', '2.5L I4', 'LE, SE, XLE', 'Fits vehicles with standard glovebox filter tray.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 2021, 'Toyota', 'RAV4', '2.5L I4', 'LE, XLE, Adventure', 'Not for hybrid models with alternate HVAC housing.'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 2022, 'Lexus', 'ES350', '3.5L V6', 'Base, F Sport', 'Verify filter direction arrow during install.'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 2020, 'Honda', 'CR-V', '1.5L Turbo', 'EX, EX-L, Touring', 'Front axle only. Excludes hybrid.'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 2021, 'Honda', 'CR-V', '2.0L Hybrid', 'EX, EX-L', 'Requires rotor diameter confirmation.'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 2022, 'Acura', 'RDX', '2.0L Turbo', 'Base', 'Fits front caliper code A1 only.');
