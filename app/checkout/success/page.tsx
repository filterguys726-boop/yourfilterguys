import Link from "next/link";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-paper">
      <ClearCartOnMount />
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-bay">
          <CheckCircle2 aria-hidden className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-ink">Payment received</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Stripe confirmed the checkout. The webhook creates the Supabase order,
          records line items, and reduces inventory after the payment event.
        </p>
        {params?.session_id ? (
          <p className="mt-4 rounded-md bg-white p-3 text-xs font-semibold text-slate-500">
            Session: {params.session_id}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account/orders" className="button-primary">
            <PackageSearch aria-hidden className="h-4 w-4" />
            View orders
          </Link>
          <Link href="/products" className="button-secondary">
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
