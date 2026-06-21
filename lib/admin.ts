import type { User } from "@supabase/supabase-js";
import { getProducts } from "@/lib/catalog";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient
} from "@/lib/supabase";
import type { CatalogProduct, OrderSummary } from "@/lib/types";

type AdminOrderRow = {
  id: string;
  order_number: string;
  stripe_checkout_session_id: string | null;
  payment_intent_id: string | null;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  customer_email: string;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
};

type AdminOrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  unit_amount_cents: number;
  line_total_cents: number;
};

export type AdminState = {
  configured: boolean;
  user: User | null;
  isAdmin: boolean;
};

export async function getAdminState(): Promise<AdminState> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { configured: false, user: null, isAdmin: false };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, isAdmin: false };
  }

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { configured: true, user, isAdmin: Boolean(data) };
}

export async function getAdminProducts(): Promise<{
  state: AdminState;
  products: CatalogProduct[];
}> {
  const state = await getAdminState();

  if (!state.configured || !state.user || !state.isAdmin) {
    return { state, products: [] };
  }

  return {
    state,
    products: await getProducts({ includeInactive: true })
  };
}

export async function getAdminProduct(productId: string): Promise<{
  state: AdminState;
  product: CatalogProduct | null;
}> {
  const { state, products } = await getAdminProducts();

  return {
    state,
    product: products.find((product) => product.id === productId) ?? null
  };
}

export async function getAdminOrders(): Promise<{
  state: AdminState;
  orders: OrderSummary[];
}> {
  const state = await getAdminState();

  if (!state.configured || !state.user || !state.isAdmin) {
    return { state, orders: [] };
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,order_number,stripe_checkout_session_id,payment_intent_id,status,payment_status,fulfillment_status,
      tracking_carrier,tracking_number,tracking_url,customer_email,subtotal_cents,tax_cents,shipping_cents,total_cents,
      currency,shipping_address,created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Admin orders query failed", error);
    return { state, orders: [] };
  }

  const orderRows = data as AdminOrderRow[];
  const orderIds = orderRows.map((order) => order.id);
  const { data: itemRows, error: itemsError } = orderIds.length
    ? await supabase
        .from("order_items")
        .select(
          "id,order_id,product_name,variant_name,sku,quantity,unit_amount_cents,line_total_cents"
        )
        .in("order_id", orderIds)
    : { data: [], error: null };

  if (itemsError) {
    console.error("Admin order items query failed", itemsError);
  }

  const itemsByOrderId = new Map<string, AdminOrderItemRow[]>();

  ((itemRows ?? []) as AdminOrderItemRow[]).forEach((item) => {
    const items = itemsByOrderId.get(item.order_id) ?? [];
    items.push(item);
    itemsByOrderId.set(item.order_id, items);
  });

  return {
    state,
    orders: orderRows.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      stripeCheckoutSessionId: order.stripe_checkout_session_id,
      paymentIntentId: order.payment_intent_id,
      status: order.status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      trackingCarrier: order.tracking_carrier,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      customerEmail: order.customer_email,
      subtotalCents: order.subtotal_cents,
      taxCents: order.tax_cents,
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
      currency: order.currency,
      shippingAddress: order.shipping_address,
      createdAt: order.created_at,
      items: itemsByOrderId.get(order.id)?.map((item) => ({
        id: item.id,
        productName: item.product_name,
        variantName: item.variant_name,
        sku: item.sku,
        quantity: item.quantity,
        unitAmountCents: item.unit_amount_cents,
        lineTotalCents: item.line_total_cents
      }))
    }))
  };
}
