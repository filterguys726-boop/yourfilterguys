export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type InventoryBehavior = "in_stock" | "sold_out" | "backorder_allowed";

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceCents: number;
  costCents: number | null;
  stockQuantity: number;
  backorderAllowed: boolean;
  weightOz: number | null;
  dimensionsIn: string | null;
  active: boolean;
};

export type VehicleFitment = {
  id: string;
  productId: string;
  year: number;
  make: string;
  model: string;
  engine: string;
  trim: string | null;
  notes: string | null;
};

export type ProductImage = {
  id?: string;
  productId?: string;
  url: string;
  alt: string;
  position?: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  shortDescription: string;
  description: string;
  category: Category;
  imageUrl: string;
  imageAlt: string;
  imageGallery?: ProductImage[];
  active: boolean;
  fitmentEnabled: boolean;
  inventoryBehavior: InventoryBehavior;
  shippingNotes: string | null;
  variants: ProductVariant[];
  fitment: VehicleFitment[];
};

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  stockQuantity: number;
  backorderAllowed: boolean;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  stripeCheckoutSessionId?: string | null;
  paymentIntentId?: string | null;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  customerEmail: string;
  subtotalCents?: number;
  taxCents?: number;
  shippingCents?: number;
  totalCents: number;
  currency: string;
  shippingAddress?: Record<string, unknown> | null;
  createdAt: string;
  items?: Array<{
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitAmountCents: number;
    lineTotalCents: number;
  }>;
};
