import type { Metadata } from "next";
import { LaunchPage, PolicyList, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for using Your Filter Guys and purchasing automotive filters and service parts."
};

export default function TermsPage() {
  return (
    <LaunchPage
      eyebrow="Terms"
      title="Terms of Service"
      intro="These terms apply when you use this website, create an account, or purchase automotive filters and service parts from Your Filter Guys."
    >
      <PolicySection title="Product Information">
        <p>
          We work to keep product descriptions, SKUs, prices, and stock
          information accurate. Review the product description, part number,
          and package details before purchase and installation.
        </p>
      </PolicySection>

      <PolicySection title="Orders and Payment">
        <PolicyList
          items={[
            "Orders are not accepted until checkout is completed and payment is confirmed.",
            "Taxes, shipping rates, and final totals are calculated during checkout.",
            "We may cancel or refund an order if an item is unavailable, pricing is incorrect, payment cannot be verified, or fraud risk is detected.",
            "Inventory is reduced after successful payment confirmation."
          ]}
        />
      </PolicySection>

      <PolicySection title="Customer Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account
          login. Account features may include order history, purchased products,
          profile details, and shipping status when available.
        </p>
      </PolicySection>

      <PolicySection title="Installation and Vehicle Safety">
        <p>
          Parts should be installed by a qualified person using proper tools,
          safety practices, and vehicle-specific procedures. Stop installation if
          a part appears damaged, incorrect, contaminated, or unsafe. We are not
          responsible for damage caused by improper installation, misuse, or
          modified vehicles.
        </p>
      </PolicySection>

      <PolicySection title="Returns, Shipping, and Privacy">
        <p>
          Shipping, returns, refunds, and privacy are governed by their
          respective policy pages. Those policies are part of these terms.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a className="font-bold text-electric" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>
          .
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
