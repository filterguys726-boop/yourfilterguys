import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { OrderSummary } from "@/lib/types";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  customer_email: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: number;
    unit_amount_cents: number;
    line_total_cents: number;
  }>;
};

export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  marketingOptIn: boolean;
};

export async function getCurrentUser(): Promise<{
  configured: boolean;
  user: User | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { configured: false, user: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { configured: true, user };
}

function mapOrder(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    customerEmail: row.customer_email,
    totalCents: row.total_cents,
    currency: row.currency,
    createdAt: row.created_at,
    items: row.order_items?.map((item) => ({
      id: item.id,
      productName: item.product_name,
      variantName: item.variant_name,
      sku: item.sku,
      quantity: item.quantity,
      unitAmountCents: item.unit_amount_cents,
      lineTotalCents: item.line_total_cents
    }))
  };
}

export async function getCustomerProfile() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { configured: false, user: null, profile: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, profile: null };
  }

  const { data } = await supabase
    .from("customer_profiles")
    .select("id,email,full_name,phone,marketing_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data
    ? {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone,
        marketingOptIn: data.marketing_opt_in
      }
    : null;

  return { configured: true, user, profile };
}

export async function getCustomerOrders(): Promise<{
  configured: boolean;
  user: User | null;
  orders: OrderSummary[];
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { configured: false, user: null, orders: [] };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, orders: [] };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,order_number,status,payment_status,fulfillment_status,customer_email,total_cents,currency,created_at,
      order_items(id,product_name,variant_name,sku,quantity,unit_amount_cents,line_total_cents)
    `
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { configured: true, user, orders: [] };
  }

  return {
    configured: true,
    user,
    orders: (data as OrderRow[]).map(mapOrder)
  };
}

export async function getCustomerOrder(orderId: string): Promise<{
  configured: boolean;
  user: User | null;
  order: OrderSummary | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { configured: false, user: null, order: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, order: null };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,order_number,status,payment_status,fulfillment_status,customer_email,total_cents,currency,created_at,
      order_items(id,product_name,variant_name,sku,quantity,unit_amount_cents,line_total_cents)
    `
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return { configured: true, user, order: null };
  }

  return {
    configured: true,
    user,
    order: mapOrder(data as OrderRow)
  };
}
