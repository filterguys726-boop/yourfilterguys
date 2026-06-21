export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
export const hasSupabaseServiceEnv = Boolean(
  supabaseUrl && supabaseServiceRoleKey
);

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const stripeShippingRates = [
  process.env.STRIPE_SHIPPING_RATE_STANDARD,
  process.env.STRIPE_SHIPPING_RATE_EXPRESS
].filter(Boolean) as string[];

export const hasStripeEnv = Boolean(stripeSecretKey);

export const resendApiKey = process.env.RESEND_API_KEY ?? "";
export const orderFromEmail =
  process.env.ORDER_FROM_EMAIL ?? "Your Filter Guys <orders@yourfilterguys.com>";
export const adminOrderEmail = process.env.ADMIN_ORDER_EMAIL ?? "";
export const hasEmailEnv = Boolean(resendApiKey && orderFromEmail);
