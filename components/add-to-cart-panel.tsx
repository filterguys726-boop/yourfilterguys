"use client";

import { CheckCircle2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/format";
import type { CatalogProduct } from "@/lib/types";

function isPurchasable(stockQuantity: number, backorderAllowed: boolean) {
  return stockQuantity > 0 || backorderAllowed;
}

function inventoryCopy(stockQuantity: number, backorderAllowed: boolean) {
  if (stockQuantity > 0) {
    return `${stockQuantity} in stock`;
  }

  if (backorderAllowed) {
    return "Ships when restocked";
  }

  return "Sold Out";
}

export function AddToCartPanel({ product }: { product: CatalogProduct }) {
  const activeVariants = product.variants.filter((variant) => variant.active);
  const [variantId, setVariantId] = useState(activeVariants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const variant = useMemo(
    () => activeVariants.find((item) => item.id === variantId) ?? activeVariants[0],
    [activeVariants, variantId]
  );

  if (!variant) {
    return (
      <div className="surface p-5">
        <p className="text-sm font-semibold text-slate-700">
          No active variants are available for this product.
        </p>
      </div>
    );
  }

  const canPurchase = isPurchasable(
    variant.stockQuantity,
    variant.backorderAllowed
  );

  return (
    <aside className="surface p-5">
      <div className="space-y-5">
        <div>
          <p className="label">Variant</p>
          <div className="mt-2 grid gap-2">
            {activeVariants.map((item) => {
              const selected = item.id === variant.id;

              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm ${
                    selected
                      ? "border-ink bg-slate-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span>
                    <span className="block font-bold text-ink">{item.name}</span>
                    <span className="block text-xs text-slate-500">{item.sku}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-black text-ink">
                      {formatMoney(item.priceCents)}
                    </span>
                    <span
                      className={`block text-xs font-semibold ${
                        item.stockQuantity > 0
                          ? "text-bay"
                          : item.backorderAllowed
                            ? "text-electric"
                            : "text-shopred"
                      }`}
                    >
                      {inventoryCopy(item.stockQuantity, item.backorderAllowed)}
                    </span>
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    name="variant"
                    value={item.id}
                    checked={selected}
                    onChange={() => setVariantId(item.id)}
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2">
          <p className="label">Quantity</p>
          <div className="flex w-36 items-center overflow-hidden rounded-md border border-slate-300 bg-white">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center hover:bg-slate-50"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Decrease quantity"
            >
              <Minus aria-hidden className="h-4 w-4" />
            </button>
            <input
              className="h-10 w-14 border-x border-slate-300 text-center text-sm font-bold outline-none"
              value={quantity}
              onChange={(event) => {
                const next = Number(event.target.value);
                setQuantity(Number.isFinite(next) ? Math.max(1, next) : 1);
              }}
              inputMode="numeric"
            />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center hover:bg-slate-50"
              onClick={() => setQuantity((value) => value + 1)}
              aria-label="Increase quantity"
            >
              <Plus aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-md bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">Item total</span>
            <span className="text-2xl font-black text-ink">
              {formatMoney(variant.priceCents * quantity)}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Tax and shipping are calculated in Stripe Checkout.
          </p>
        </div>

        <button
          type="button"
          className="button-primary w-full"
          disabled={!canPurchase}
          onClick={() => {
            addItem({
              productId: product.id,
              variantId: variant.id,
              productName: product.name,
              variantName: variant.name,
              sku: variant.sku,
              priceCents: variant.priceCents,
              imageUrl: product.imageUrl,
              quantity,
              stockQuantity: variant.stockQuantity,
              backorderAllowed: variant.backorderAllowed
            });
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1800);
          }}
        >
          {canPurchase ? (
            <>
              <ShoppingCart aria-hidden className="h-4 w-4" />
              Add to cart
            </>
          ) : (
            "Sold Out"
          )}
        </button>

        {added ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-bay">
            <CheckCircle2 aria-hidden className="h-4 w-4" />
            Added to cart
          </p>
        ) : null}
      </div>
    </aside>
  );
}
