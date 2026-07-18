import type { CatalogProduct, Category } from "@/lib/types";

export const sampleCategories: Category[] = [
  {
    id: "cat-engine-filters",
    name: "Engine Filters",
    slug: "engine-filters",
    description: "Fuel, oil, air, and cabin filters for popular U.S. vehicles."
  },
  {
    id: "cat-service-kits",
    name: "Service Kits",
    slug: "service-kits",
    description: "Bundled maintenance parts for common service jobs."
  }
];

export const sampleProducts: CatalogProduct[] = [
  {
    id: "prod-detroit-dd13-dd15-fuel-filter-kit-a4720921705",
    name: "Detroit DD13/DD15 Fuel Filter Kit A4720921705",
    slug: "detroit-dd13-dd15-fuel-filter-kit-a4720921705",
    sku: "FK11011-A4720921705",
    brand: "Detroit Diesel",
    shortDescription:
      "Fuel filter insert kit with seals for Detroit DD13 and DD15 service.",
    description:
      "A Detroit DD13/DD15 fuel filter insert kit with included O-rings and service components. Verify OE number A4720921705 before purchase or installation.",
    category: sampleCategories[1],
    imageUrl: "/detroit-dd13-dd15-fuel-filter-kit-a4720921705-1.png",
    imageAlt:
      "Detroit DD13/DD15 fuel filter kit A4720921705 with filter, box, seals, and insert",
    imageGallery: [
      {
        url: "/detroit-dd13-dd15-fuel-filter-kit-a4720921705-1.png",
        alt: "Detroit DD13/DD15 fuel filter kit with box, filter, seals, and insert"
      },
      {
        url: "/detroit-dd13-dd15-fuel-filter-kit-a4720921705-2.png",
        alt: "Second angle of Detroit DD13/DD15 fuel filter kit A4720921705"
      }
    ],
    active: true,
    fitmentEnabled: false,
    inventoryBehavior: "in_stock",
    shippingNotes: "Ships boxed with protective packing for filter media.",
    variants: [
      {
        id: "var-detroit-dd13-dd15-kit-single",
        productId: "prod-detroit-dd13-dd15-fuel-filter-kit-a4720921705",
        name: "Single service kit",
        sku: "FK11011-A4720921705-1",
        priceCents: 8999,
        costCents: 5150,
        stockQuantity: 6,
        backorderAllowed: false,
        weightOz: 24,
        dimensionsIn: "8 x 6 x 6",
        active: true
      }
    ],
    fitment: [
      {
        id: "fit-detroit-dd13-dd15-kit-1",
        productId: "prod-detroit-dd13-dd15-fuel-filter-kit-a4720921705",
        year: 2018,
        make: "Freightliner",
        model: "Cascadia",
        engine: "Detroit DD13",
        trim: "Class 8 tractor",
        notes: "Verify OE number A4720921705 before purchase."
      },
      {
        id: "fit-detroit-dd13-dd15-kit-2",
        productId: "prod-detroit-dd13-dd15-fuel-filter-kit-a4720921705",
        year: 2020,
        make: "Freightliner",
        model: "Cascadia",
        engine: "Detroit DD15",
        trim: "Class 8 tractor",
        notes: "Confirm filter housing and service kit number match."
      },
      {
        id: "fit-detroit-dd13-dd15-kit-3",
        productId: "prod-detroit-dd13-dd15-fuel-filter-kit-a4720921705",
        year: 2022,
        make: "Western Star",
        model: "49X",
        engine: "Detroit DD15",
        trim: "Heavy duty",
        notes: "Application varies by engine package; verify OE cross-reference."
      }
    ]
  },
  {
    id: "prod-detroit-diesel-fuel-pro-482-element-a4720921205",
    name: "Detroit Diesel Fuel Pro 482 Element A4720921205",
    slug: "detroit-diesel-fuel-pro-482-element-a4720921205",
    sku: "A4720921205",
    brand: "Detroit Diesel",
    shortDescription:
      "Fuel Pro 482 replacement element kit for Detroit diesel service.",
    description:
      "A Detroit Diesel Fuel Pro 482 replacement element kit. Package label lists A4720921205 filter and A0209977545 O-rings. Confirm the Fuel Pro 482 housing and OE part number before ordering.",
    category: sampleCategories[0],
    imageUrl: "/detroit-diesel-fuel-pro-482-element-a4720921205.png",
    imageAlt:
      "Detroit Diesel Fuel Pro 482 replacement element A4720921205 with box",
    active: true,
    fitmentEnabled: false,
    inventoryBehavior: "in_stock",
    shippingNotes: "Ships in manufacturer box with protective packing.",
    variants: [
      {
        id: "var-detroit-fuel-pro-482-element-single",
        productId: "prod-detroit-diesel-fuel-pro-482-element-a4720921205",
        name: "Single replacement element",
        sku: "A4720921205-1",
        priceCents: 7499,
        costCents: 4280,
        stockQuantity: 8,
        backorderAllowed: false,
        weightOz: 20,
        dimensionsIn: "7 x 7 x 7",
        active: true
      }
    ],
    fitment: [
      {
        id: "fit-detroit-fuel-pro-482-1",
        productId: "prod-detroit-diesel-fuel-pro-482-element-a4720921205",
        year: 2017,
        make: "Freightliner",
        model: "Cascadia",
        engine: "Detroit DD13",
        trim: "Fuel Pro 482 housing",
        notes: "Confirm Fuel Pro 482 housing and OE number A4720921205."
      },
      {
        id: "fit-detroit-fuel-pro-482-2",
        productId: "prod-detroit-diesel-fuel-pro-482-element-a4720921205",
        year: 2019,
        make: "Freightliner",
        model: "Cascadia",
        engine: "Detroit DD15",
        trim: "Fuel Pro 482 housing",
        notes: "Includes listed O-rings; compare removed element before install."
      },
      {
        id: "fit-detroit-fuel-pro-482-3",
        productId: "prod-detroit-diesel-fuel-pro-482-element-a4720921205",
        year: 2021,
        make: "Western Star",
        model: "5700XE",
        engine: "Detroit DD15",
        trim: "Fuel Pro 482 housing",
        notes: "Verify housing and service label before purchase."
      }
    ]
  },
  {
    id: "prod-oil-filter-xg10575",
    name: "Premium Synthetic Oil Filter XG10575",
    slug: "premium-synthetic-oil-filter-xg10575",
    sku: "TF-XG10575",
    brand: "Your Filter Guys",
    shortDescription: "Extended-life spin-on oil filter for high-mileage service.",
    description:
      "A premium synthetic media oil filter designed for clean oil flow, high dirt-holding capacity, and easy service intervals.",
    category: sampleCategories[0],
    imageUrl: "/product-oil-filter.svg",
    imageAlt: "Premium spin-on oil filter",
    active: true,
    fitmentEnabled: false,
    inventoryBehavior: "in_stock",
    shippingNotes: "Ships in a protective corrugated sleeve.",
    variants: [
      {
        id: "var-xg10575-single",
        productId: "prod-oil-filter-xg10575",
        name: "Single filter",
        sku: "TF-XG10575-1",
        priceCents: 1499,
        costCents: 760,
        stockQuantity: 18,
        backorderAllowed: false,
        weightOz: 11,
        dimensionsIn: "4 x 4 x 5",
        active: true
      },
      {
        id: "var-xg10575-case",
        productId: "prod-oil-filter-xg10575",
        name: "Case of 6",
        sku: "TF-XG10575-6",
        priceCents: 7999,
        costCents: 4260,
        stockQuantity: 4,
        backorderAllowed: true,
        weightOz: 72,
        dimensionsIn: "13 x 9 x 6",
        active: true
      }
    ],
    fitment: [
      {
        id: "fit-xg10575-1",
        productId: "prod-oil-filter-xg10575",
        year: 2018,
        make: "Ford",
        model: "F-150",
        engine: "5.0L V8",
        trim: "XL, XLT, Lariat",
        notes: "Excludes heavy-duty payload package."
      },
      {
        id: "fit-xg10575-2",
        productId: "prod-oil-filter-xg10575",
        year: 2020,
        make: "Ford",
        model: "F-150",
        engine: "3.5L V6 EcoBoost",
        trim: "XLT, Lariat",
        notes: "Confirm OE filter thread before purchase."
      },
      {
        id: "fit-xg10575-3",
        productId: "prod-oil-filter-xg10575",
        year: 2021,
        make: "Lincoln",
        model: "Navigator",
        engine: "3.5L V6",
        trim: "Base, Reserve",
        notes: "Fits standard oil cooler."
      }
    ]
  },
  {
    id: "prod-cabin-filter-cf11819",
    name: "Activated Carbon Cabin Air Filter CF11819",
    slug: "activated-carbon-cabin-air-filter-cf11819",
    sku: "TF-CF11819",
    brand: "ClearCabin",
    shortDescription: "Cabin filter with odor control for daily commuting.",
    description:
      "Activated carbon cabin filtration helps reduce dust, pollen, and odors while maintaining HVAC airflow.",
    category: sampleCategories[0],
    imageUrl: "/product-cabin-filter.svg",
    imageAlt: "Pleated cabin air filter",
    active: true,
    fitmentEnabled: false,
    inventoryBehavior: "backorder_allowed",
    shippingNotes: "Lightweight item eligible for standard shipping.",
    variants: [
      {
        id: "var-cf11819-standard",
        productId: "prod-cabin-filter-cf11819",
        name: "Standard carbon",
        sku: "TF-CF11819-C",
        priceCents: 2199,
        costCents: 970,
        stockQuantity: 0,
        backorderAllowed: true,
        weightOz: 8,
        dimensionsIn: "10 x 9 x 2",
        active: true
      },
      {
        id: "var-cf11819-premium",
        productId: "prod-cabin-filter-cf11819",
        name: "Premium allergen",
        sku: "TF-CF11819-P",
        priceCents: 2799,
        costCents: 1230,
        stockQuantity: 9,
        backorderAllowed: false,
        weightOz: 9,
        dimensionsIn: "10 x 9 x 2",
        active: true
      }
    ],
    fitment: [
      {
        id: "fit-cf11819-1",
        productId: "prod-cabin-filter-cf11819",
        year: 2019,
        make: "Toyota",
        model: "Camry",
        engine: "2.5L I4",
        trim: "LE, SE, XLE",
        notes: "Fits vehicles with standard glovebox filter tray."
      },
      {
        id: "fit-cf11819-2",
        productId: "prod-cabin-filter-cf11819",
        year: 2021,
        make: "Toyota",
        model: "RAV4",
        engine: "2.5L I4",
        trim: "LE, XLE, Adventure",
        notes: "Not for hybrid models with alternate HVAC housing."
      },
      {
        id: "fit-cf11819-3",
        productId: "prod-cabin-filter-cf11819",
        year: 2022,
        make: "Lexus",
        model: "ES350",
        engine: "3.5L V6",
        trim: "Base, F Sport",
        notes: "Verify filter direction arrow during install."
      }
    ]
  }
];
