"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/format";

export function CartClient() {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email || undefined,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity
          }))
        })
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout could not be started.");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-paper">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-electric"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Continue shopping
          </Link>
          <h1 className="mt-5 text-4xl font-black text-ink">Cart</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="surface overflow-hidden">
          {items.length ? (
            <div className="divide-y divide-slate-200">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="grid gap-4 p-5 sm:grid-cols-[96px_1fr_auto] sm:items-center"
                >
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-md bg-slate-100 object-cover"
                  />
                  <div>
                    <p className="text-lg font-black text-ink">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.variantName} · {item.sku}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {formatMoney(item.priceCents)} each
                    </p>
                    {item.stockQuantity <= 0 && item.backorderAllowed ? (
                      <p className="mt-2 text-xs font-bold text-electric">
                        Ships when restocked
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <label>
                      <span className="sr-only">Quantity</span>
                      <input
                        className="field w-20 text-center"
                        value={item.quantity}
                        inputMode="numeric"
                        onChange={(event) =>
                          updateQuantity(
                            item.variantId,
                            Number(event.target.value) || 1
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="button-secondary px-3"
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remove ${item.productName}`}
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-black text-ink">Your cart is empty</h2>
              <p className="mt-2 text-sm text-slate-600">
                Add filters or service parts to start checkout.
              </p>
              <Link href="/products" className="button-primary mt-5">
                Shop products
              </Link>
            </div>
          )}
        </div>

        <aside className="surface h-fit p-5">
          <h2 className="text-2xl font-black text-ink">Order summary</h2>
          <div className="mt-5 grid gap-3 border-b border-slate-200 pb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-black text-ink">{formatMoney(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax</span>
              <span className="font-semibold text-slate-500">Calculated by Stripe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold text-slate-500">Selected in checkout</span>
            </div>
          </div>
          <label className="mt-5 grid gap-2">
            <span className="label">Email for guest checkout</span>
            <input
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@example.com"
            />
          </label>
          {error ? (
            <p className="mt-4 rounded-md bg-orange-50 p-3 text-sm font-semibold text-shopred">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            className="button-primary mt-5 w-full"
            onClick={checkout}
            disabled={!items.length || loading}
          >
            {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
            Checkout
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Payment, tax, shipping address, and shipping rate selection are
            handled by Stripe Checkout.
          </p>
        </aside>
      </section>
    </div>
  );
}
