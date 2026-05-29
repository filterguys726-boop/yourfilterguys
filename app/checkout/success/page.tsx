import Link from "next/link";
import { CheckCircle2, Mail, PackageSearch, ShoppingBag } from "lucide-react";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-paper">
      <ClearCartOnMount />
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-bay">
          <CheckCircle2 aria-hidden className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-ink">
          Thanks, your order is confirmed.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          We received your payment and are getting your order ready. A receipt
          and order details will be sent to the email used at checkout.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Mail aria-hidden className="h-5 w-5 text-electric" />
            <h2 className="mt-3 text-base font-black text-ink">
              Check your email
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your receipt and order confirmation should arrive shortly.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <ShoppingBag aria-hidden className="h-5 w-5 text-shopred" />
            <h2 className="mt-3 text-base font-black text-ink">
              We&apos;ll prepare the order
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Shipping updates will appear in your account when available.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account/orders" className="button-primary">
            <PackageSearch aria-hidden className="h-4 w-4" />
            View order history
          </Link>
          <Link href="/products" className="button-secondary">
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
