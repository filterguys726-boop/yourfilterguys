import {
  hasSquareEnv,
  hasStripeEnv,
  paymentProvider,
  type PaymentProvider
} from "@/lib/env";

export function isPaymentProviderConfigured(provider: PaymentProvider) {
  if (provider === "square") {
    return hasSquareEnv;
  }

  if (provider === "stripe") {
    return hasStripeEnv;
  }

  return false;
}

export function checkoutConfigurationError() {
  if (paymentProvider === "disabled") {
    return "Online checkout is temporarily unavailable.";
  }

  return `${paymentProvider === "square" ? "Square" : "Stripe"} checkout is not configured.`;
}
