import type { User } from "@supabase/supabase-js";
import { getProducts } from "@/lib/catalog";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { CatalogProduct, OrderSummary } from "@/lib/types";

type AdminOrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  customer_email: string;
  total_cents: number;
  currency: string;
  created_at: string;
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
  const supabase = await createServerSupabaseClient();

  if (!state.configured || !state.user || !state.isAdmin || !supabase) {
    return { state, orders: [] };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_number,status,payment_status,fulfillment_status,tracking_carrier,tracking_number,tracking_url,customer_email,total_cents,currency,created_at"
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { state, orders: [] };
  }

  return {
    state,
    orders: (data as AdminOrderRow[]).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      trackingCarrier: order.tracking_carrier,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      customerEmail: order.customer_email,
      totalCents: order.total_cents,
      currency: order.currency,
      createdAt: order.created_at
    }))
  };
}
