import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL("https://yourfilterguys.com"),
  title: {
    default: `${brand.name} | Automotive Filters & Parts`,
    template: `%s | ${brand.name}`
  },
  description: brand.description,
  openGraph: {
    title: `${brand.name} | Automotive Filters & Parts`,
    description: brand.description,
    url: "https://yourfilterguys.com",
    siteName: brand.name,
    images: [
      {
        url: brand.logoPath,
        width: 1024,
        height: 1024,
        alt: `${brand.name} logo`
      }
    ],
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
