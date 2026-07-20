import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MotionController } from "@/components/motion-controller";
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}else{document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <CartProvider>
          <MotionController />
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
