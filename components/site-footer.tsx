import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_.8fr_.8fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
              <Image
                src={brand.logoPath}
                alt={`${brand.name} logo`}
                width={48}
                height={48}
                sizes="48px"
                className="h-12 w-12 object-cover"
              />
            </span>
            <div>
              <p className="text-lg font-black uppercase text-ink">{brand.name}</p>
              <p className="text-xs font-bold text-electric">{brand.domain}</p>
            </div>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Automotive filters, brake parts, and common service components with
            clear variant and fitment data for U.S. vehicles.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Store</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/products">All products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/account/orders">Order history</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/category/engine-filters">Engine filters</Link>
            <Link href="/category/brake-parts">Brake parts</Link>
            <Link href="/category/service-kits">Service kits</Link>
            <Link href="/fitment-help">Fitment help</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Support</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/contact">Contact</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns & refunds</Link>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
