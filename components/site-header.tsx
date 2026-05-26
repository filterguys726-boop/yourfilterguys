"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { brand } from "@/lib/brand";

const links = [
  { href: "/products", label: "Products" },
  { href: "/category/engine-filters", label: "Engine filters" },
  { href: "/category/brake-parts", label: "Brake parts" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm sm:h-16 sm:w-16">
            <Image
              src={brand.logoPath}
              alt={`${brand.name} logo`}
              width={64}
              height={64}
              sizes="64px"
              className="h-14 w-14 object-cover sm:h-16 sm:w-16"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black uppercase leading-tight text-ink sm:text-lg">
              {brand.name}
            </span>
            <span className="block text-xs font-bold text-electric">
              {brand.domain}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="button-secondary hidden px-3 sm:inline-flex"
            aria-label="Search products"
          >
            <Search aria-hidden className="h-4 w-4" />
          </Link>
          <Link href="/account" className="button-secondary hidden px-3 sm:inline-flex">
            <UserRound aria-hidden className="h-4 w-4" />
            <span className="hidden md:inline">Account</span>
          </Link>
          <Link href="/cart" className="button-primary relative px-3">
            <ShoppingCart aria-hidden className="h-4 w-4" />
            <span>Cart</span>
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-shopred px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="button-secondary px-3 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Open navigation"
          >
            <Menu aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              Account
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
