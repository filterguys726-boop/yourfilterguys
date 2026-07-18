"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Menu, Phone, Search, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand } from "@/lib/brand";

const links = [
  { href: "/products", label: "Products" },
  { href: "/category/engine-filters", label: "Engine filters" },
  { href: "/category/service-kits", label: "Service kits" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div data-enter="utility" className="border-b border-amber-300/20 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-[11px] font-bold uppercase tracking-wide sm:px-6 sm:text-xs lg:px-8">
          <span className="text-slate-300">Need help finding a part?</span>
          <a
            href="tel:+15627240298"
            className="inline-flex items-center gap-1.5 text-shopred transition hover:text-amber-300"
          >
            <Phone aria-hidden className="h-3.5 w-3.5" />
            Call or text (562) 724-0298
          </a>
          <a
            href="mailto:filterguys726@gmail.com"
            className="inline-flex items-center gap-1.5 text-slate-200 transition hover:text-white"
          >
            <Mail aria-hidden className="h-3.5 w-3.5" />
            Email us
          </a>
        </div>
      </div>

      <div data-enter="navbar" className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        <Link href="/" data-enter="right" data-enter-delay="2" className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          <span className="flex h-14 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-24">
            <Image
              src="/yourfilterguys-logo-transparent.png"
              alt={`${brand.name} logo`}
              width={96}
              height={96}
              sizes="(min-width: 640px) 96px, 80px"
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="hidden min-w-0 overflow-hidden leading-none min-[350px]:block">
            <span className="brand-condensed block whitespace-nowrap text-base uppercase text-ink sm:text-2xl">
              <span>Your </span>
              <span className="text-shopred">Filter</span>
              <span> Guys</span>
            </span>
            <span className="brand-tagline -mt-0.5 hidden whitespace-nowrap text-[8px] uppercase leading-none text-slate-600 min-[430px]:block sm:text-xs">
              Real Parts. Real Results.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              data-enter="fade"
              data-enter-delay={String(index + 3)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link
            href="/products"
            className="button-secondary hidden h-10 w-10 p-0 sm:inline-flex"
            aria-label="Search products"
            data-enter="fade"
            data-enter-delay="7"
          >
            <Search aria-hidden className="h-4 w-4" />
          </Link>
          <Link href="/account" data-enter="fade" data-enter-delay="8" className="button-secondary hidden px-3 sm:inline-flex">
            <UserRound aria-hidden className="h-4 w-4" />
            <span className="hidden md:inline">Account</span>
          </Link>
          <Link href="/cart" data-enter="fade" data-enter-delay="9" className="button-primary relative h-10 w-10 p-0 sm:w-auto sm:px-3">
            <ShoppingCart aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-shopred px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="button-secondary h-10 w-10 p-0 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Open navigation"
            data-enter="fade"
            data-enter-delay="9"
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
