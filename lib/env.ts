export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";

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

export type PaymentProvider = "square" | "stripe" | "disabled";

function getPaymentProvider(value: string | undefined): PaymentProvider {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "stripe" || normalized === "disabled") {
    return normalized;
  }

  return "square";
}

export const paymentProvider = getPaymentProvider(process.env.PAYMENT_PROVIDER);

export const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN ?? "";
export const squareLocationId = process.env.SQUARE_LOCATION_ID ?? "";
export const squareEnvironment =
  process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase() === "production"
    ? "production"
    : "sandbox";
export const squareWebhookSignatureKey =
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? "";
export const squareWebhookNotificationUrl =
  process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.replace(/\/$/, "") ??
  `${siteUrl}/api/webhooks/square`;
export const squareShippingFeeCents = Math.max(
  0,
  Number.parseInt(process.env.SQUARE_SHIPPING_FEE_CENTS ?? "0", 10) || 0
);
export const squareShippingFeeName =
  process.env.SQUARE_SHIPPING_FEE_NAME?.trim() || "Standard shipping";
export const squareTaxPercentage =
  process.env.SQUARE_TAX_PERCENTAGE?.trim() ?? "";

export const hasSquareEnv = Boolean(squareAccessToken && squareLocationId);
export const hasSquareWebhookEnv = Boolean(
  squareWebhookSignatureKey && squareWebhookNotificationUrl
);

const defaultAdminEmails = ["maiko.ssb@gmail.com", "filterguys726@gmail.com"];

export const adminEmails = Array.from(
  new Set(
    [
      ...defaultAdminEmails,
      ...(process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    ].map((email) => email.toLowerCase())
  )
);

export const resendApiKey = process.env.RESEND_API_KEY ?? "";
export const orderFromEmail =
  process.env.ORDER_FROM_EMAIL ?? "Your Filter Guys <orders@yourfilterguys.com>";
export const adminOrderEmail = process.env.ADMIN_ORDER_EMAIL ?? "";
export const hasEmailEnv = Boolean(resendApiKey && orderFromEmail);
