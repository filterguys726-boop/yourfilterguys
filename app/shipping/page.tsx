import type { Metadata } from "next";
import { LaunchPage, PolicyList, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping policy for Your Filter Guys automotive filters and service parts."
};

export default function ShippingPage() {
  return (
    <LaunchPage
      eyebrow="Shipping"
      title="Shipping Policy"
      intro="We ship automotive filters and service parts across the United States with rates and delivery options shown during checkout."
    >
      <PolicySection title="Where We Ship">
        <p>
          {brand.name} currently ships to addresses within the United States.
          Available delivery methods, shipping costs, and taxes are calculated
          during checkout based on the items in your cart and your shipping
          address.
        </p>
      </PolicySection>

      <PolicySection title="Processing Times">
        <PolicyList
          items={[
            "In-stock items are typically prepared for shipment within 1-2 business days.",
            "Orders placed on weekends or holidays begin processing on the next business day.",
            "If an item is listed as backorder allowed, the product page will display that it ships when restocked."
          ]}
        />
      </PolicySection>

      <PolicySection title="Delivery Estimates">
        <p>
          Delivery estimates are provided at checkout when available. Carrier
          delays, weather, holidays, and address issues can affect final delivery
          timing after an order leaves our facility.
        </p>
      </PolicySection>

      <PolicySection title="Order Tracking">
        <p>
          When tracking is available, it will be added to your order and shown in
          your account order history. Guest checkout customers can contact{" "}
          <a className="font-bold text-electric" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>{" "}
          with their order number for help.
        </p>
      </PolicySection>

      <PolicySection title="Address Accuracy">
        <p>
          Please verify your shipping address before placing an order. We may not
          be able to redirect a package after it has been handed to the carrier.
          If you notice an address issue, contact us as soon as possible.
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
