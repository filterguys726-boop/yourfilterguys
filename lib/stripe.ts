import Stripe from "stripe";
import { stripeSecretKey } from "@/lib/env";

export function getStripe() {
  if (!stripeSecretKey) {
    throw new Error("Stripe secret key is missing.");
  }

  return new Stripe(stripeSecretKey);
}
