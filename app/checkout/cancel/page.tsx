import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-shopred">
          <ShoppingCart aria-hidden className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-ink">Checkout canceled</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Your cart is still saved in this browser.
        </p>
        <Link href="/cart" className="button-primary mt-8">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Return to cart
        </Link>
      </section>
    </div>
  );
}
