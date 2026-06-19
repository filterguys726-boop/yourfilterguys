import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Wrench } from "lucide-react";
import { LaunchPage, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Your Filter Guys, an automotive filters and service parts store focused on clear fitment and reliable checkout."
};

export default function AboutPage() {
  return (
    <LaunchPage
      eyebrow="About"
      title="Filters, parts, and fitment without the guesswork."
      intro={`${brand.name} is built for drivers and repair buyers who want a cleaner way to order common automotive filters and service parts online.`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Fitment First",
            text: "Product pages are designed to show year, make, model, engine, trim, and notes before checkout."
          },
          {
            icon: Wrench,
            title: "Service Essentials",
            text: "The catalog focuses on filters and service components buyers regularly need."
          },
          {
            icon: Truck,
            title: "Launch Ready Flow",
            text: "Checkout, tax, shipping, order records, and customer accounts are structured for a real ecommerce launch."
          }
        ].map((item) => (
          <section
            key={item.title}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <item.icon aria-hidden className="h-6 w-6 text-shopred" />
            <h2 className="mt-4 text-lg font-black text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.text}
            </p>
          </section>
        ))}
      </div>

      <PolicySection title="What We Are Building">
        <p>
          {brand.name} is a modern U.S. ecommerce store for automotive filters
          and parts. The MVP is intentionally focused: catalog browsing, clear
          product variants, vehicle fitment, cart, secure Stripe Checkout,
          inventory updates, and customer order history.
        </p>
      </PolicySection>

      <PolicySection title="Why Fitment Matters">
        <p>
          Automotive parts can vary by engine, trim, production date, and
          vehicle package. Our product experience is built to make fitment
          details visible before customers add a part to cart.
        </p>
        <p>
          Need help before ordering? Visit the{" "}
          <Link className="font-bold text-electric" href="/fitment-help">
            fitment help page
          </Link>{" "}
          or contact{" "}
          <a className="font-bold text-electric" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>
          .
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
