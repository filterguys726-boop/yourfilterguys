import type { Metadata } from "next";
import Link from "next/link";
import { Mail, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { LaunchPage, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Your Filter Guys for product questions, order support, shipping, and returns."
};

export default function ContactPage() {
  return (
    <LaunchPage
      eyebrow="Contact"
      title="How can we help?"
      intro="Send us your order number and product SKU when relevant. That helps us answer product and order questions faster."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <section>
          <h2 className="text-2xl font-black text-ink">Support Email</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            For order help, product questions, return requests, or shipping
            questions, email us at:
          </p>
          <a
            className="button-primary mt-5"
            href={`mailto:${brand.supportEmail}?subject=Your%20Filter%20Guys%20Support%20Request`}
          >
            <Mail aria-hidden className="h-4 w-4" />
            {brand.supportEmail}
          </a>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Include your order number if you have one, plus the product SKU or
            part number you are considering.
          </p>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-black text-ink">Helpful Links</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-electric">
            <Link className="inline-flex items-center gap-2" href="/shipping">
              <Truck aria-hidden className="h-4 w-4" />
              Shipping policy
            </Link>
            <Link className="inline-flex items-center gap-2" href="/returns">
              <PackageSearch aria-hidden className="h-4 w-4" />
              Returns and refunds
            </Link>
            <Link className="inline-flex items-center gap-2" href="/privacy">
              <ShieldCheck aria-hidden className="h-4 w-4" />
              Privacy policy
            </Link>
          </div>
        </aside>
      </div>

      <PolicySection title="Before You Install">
        <p>
          If a part looks different from what you removed from the vehicle, pause
          before installation and contact us. Photos of the old part, new part,
          product label, and packaging details help us review the issue.
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
