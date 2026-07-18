import type { Metadata } from "next";
import { LaunchPage, PolicyList, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Return and refund policy for Your Filter Guys automotive filters and service parts."
};

export default function ReturnsPage() {
  return (
    <LaunchPage
      eyebrow="Returns"
      title="Returns & Refunds"
      intro="We want you to order with confidence. Review the product details before installing any part, and contact us quickly if something does not look right."
    >
      <PolicySection title="Return Window">
        <p>
          Eligible items may be returned within 30 days of delivery. To start a
          return, email{" "}
          <a className="font-bold text-electric" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>{" "}
          with your order number, item SKU, and reason for return.
        </p>
      </PolicySection>

      <PolicySection title="Return Eligibility">
        <PolicyList
          items={[
            "Items must be unused, uninstalled, clean, and in resellable condition.",
            "Items should be returned with original packaging, labels, manuals, and included hardware when applicable.",
            "Installed, damaged, altered, contaminated, or visibly used parts may not be eligible for refund.",
            "Returns should include the order number, product SKU, and the reason for return."
          ]}
        />
      </PolicySection>

      <PolicySection title="Incorrect, Damaged, or Missing Items">
        <p>
          If your order arrives damaged, missing an item, or different from what
          you ordered, contact us within 7 days of delivery. Please include
          photos of the package, packing slip, product label, and the item
          condition so we can review the issue quickly.
        </p>
      </PolicySection>

      <PolicySection title="Refund Timing">
        <p>
          Approved refunds are issued to the original payment method after the
          returned item has been received and inspected. Your bank or card issuer
          may take additional time to post the refund.
        </p>
      </PolicySection>

      <PolicySection title="Return Shipping">
        <p>
          Return shipping responsibility depends on the reason for return. If we
          sent the wrong item or the item arrived damaged, we will help make it
          right. If the return is due to buyer preference, duplicate order, or
          incorrect vehicle selection, return shipping may be the customer&apos;s
          responsibility.
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
