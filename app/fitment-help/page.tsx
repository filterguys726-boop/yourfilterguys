import type { Metadata } from "next";
import Link from "next/link";
import { LaunchPage, PolicyList, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Fitment Help",
  description:
    "Fitment help for choosing automotive filters and service parts from Your Filter Guys."
};

export default function FitmentHelpPage() {
  return (
    <LaunchPage
      eyebrow="Fitment help"
      title="Make sure the part fits before you install it."
      intro="Use the fitment table on each product page to compare your vehicle details before checkout and again before installation."
    >
      <PolicySection title="What to Check">
        <PolicyList
          items={[
            "Year, make, and model must match the vehicle you are shopping for.",
            "Engine details matter, especially displacement, fuel type, and hybrid or diesel variations.",
            "Trim and package notes may affect part compatibility.",
            "Fitment notes and exceptions should be reviewed before adding the item to cart."
          ]}
        />
      </PolicySection>

      <PolicySection title="Before Installing">
        <p>
          Compare the new part with the part removed from the vehicle. If the
          shape, connection points, gasket, thread, diameter, or label looks
          wrong, pause before installation and contact support.
        </p>
      </PolicySection>

      <PolicySection title="When You Contact Us">
        <p>
          Send the vehicle year, make, model, engine, trim, product SKU, and a
          photo of the old part or product label when available. That gives us
          enough context to review the fitment quickly.
        </p>
        <p>
          Email{" "}
          <a className="font-bold text-electric" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>{" "}
          or use the{" "}
          <Link className="font-bold text-electric" href="/contact">
            contact page
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Fitment Reminder">
        <p>
          Product fitment data is meant to reduce guesswork, but vehicle changes,
          modifications, prior repairs, and manufacturer variations can affect
          compatibility. Confirm fitment before installing the part.
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
