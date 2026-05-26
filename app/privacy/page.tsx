import type { Metadata } from "next";
import { LaunchPage, PolicyList, PolicySection } from "@/components/launch-page";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Your Filter Guys customer accounts, checkout, and ecommerce services."
};

export default function PrivacyPage() {
  return (
    <LaunchPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This policy explains what information we collect, how we use it, and the services that help power customer accounts and checkout."
    >
      <PolicySection title="Information We Collect">
        <PolicyList
          items={[
            "Contact information such as name, email address, phone number, and shipping address.",
            "Order details such as products purchased, SKUs, quantities, payment status, shipping status, and order history.",
            "Account information created through Supabase Auth, including login email and profile details you choose to provide.",
            "Technical information such as device, browser, approximate location, and site usage data that helps us operate and improve the website."
          ]}
        />
      </PolicySection>

      <PolicySection title="How We Use Information">
        <PolicyList
          items={[
            "Process orders, payments, taxes, shipping, returns, and customer support requests.",
            "Show order history, purchased products, and account profile information.",
            "Improve product fitment clarity, inventory accuracy, and website performance.",
            "Send transactional messages related to accounts, orders, checkout, and support."
          ]}
        />
      </PolicySection>

      <PolicySection title="Payments and Service Providers">
        <p>
          Payments are processed through Stripe. We do not store full card
          numbers on our servers. Supabase helps provide authentication,
          database, storage, and account functionality. These providers process
          information as needed to operate the store.
        </p>
      </PolicySection>

      <PolicySection title="Cookies and Analytics">
        <p>
          The site may use cookies or similar technologies to keep you signed in,
          maintain cart behavior, support checkout, and understand site
          performance. Browser settings may allow you to block or delete cookies,
          but some store features may stop working correctly.
        </p>
      </PolicySection>

      <PolicySection title="Your Choices">
        <p>
          You can contact{" "}
          <a className="font-bold text-electric" href={`mailto:${brand.supportEmail}`}>
            {brand.supportEmail}
          </a>{" "}
          to request help accessing, correcting, or deleting account information,
          subject to order record, fraud prevention, tax, and legal retention
          requirements.
        </p>
      </PolicySection>

      <PolicySection title="Policy Updates">
        <p>
          We may update this policy as the store, services, or legal
          requirements change. The latest version will be posted on this page.
        </p>
      </PolicySection>
    </LaunchPage>
  );
}
