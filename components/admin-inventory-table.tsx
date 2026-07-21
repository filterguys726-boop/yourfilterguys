"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { adjustInventoryAction } from "@/app/admin/products/actions";

export type AdminInventoryRow = {
  productId: string;
  productName: string;
  productSku: string;
  variantId: string;
  variantName: string;
  variantSku: string;
  stockQuantity: number;
  backorderAllowed: boolean;
};

export function AdminInventoryTable({ rows }: { rows: AdminInventoryRow[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      [row.productName, row.productSku, row.variantName, row.variantSku]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery, rows]);

  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid w-full max-w-xl gap-1.5">
            <span className="label">Search inventory</span>
            <span className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                type="search"
                className="field h-11 pl-10 pr-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search product, SKU, or variant"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-ink focus-ring"
                  onClick={() => setQuery("")}
                  aria-label="Clear inventory search"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              ) : null}
            </span>
          </label>
          <p className="shrink-0 text-sm text-slate-600" aria-live="polite">
            Showing <span className="font-black text-ink">{filteredRows.length}</span> of{" "}
            {rows.length} variants
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-bold">Product</th>
              <th className="px-5 py-3 font-bold">Variant</th>
              <th className="px-5 py-3 font-bold">Stock</th>
              <th className="px-5 py-3 font-bold">Backorder</th>
              <th className="px-5 py-3 font-bold">Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRows.map((row) => (
              <tr key={row.variantId}>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/products/${row.productId}`}
                    className="font-black text-electric"
                  >
                    {row.productName}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{row.productSku}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-ink">{row.variantName}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.variantSku}</p>
                </td>
                <td className="px-5 py-4 font-black text-ink">
                  {row.stockQuantity}
                </td>
                <td className="px-5 py-4">
                  {row.backorderAllowed ? "Allowed" : "Disabled"}
                </td>
                <td className="px-5 py-4">
                  <form
                    action={adjustInventoryAction}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="product_id" value={row.productId} />
                    <input type="hidden" name="variant_id" value={row.variantId} />
                    <label className="grid gap-1">
                      <span className="text-[11px] font-black uppercase text-slate-500">
                        Qty change
                      </span>
                      <input
                        className="field h-10 w-28"
                        name="quantity_delta"
                        placeholder="+5 or -2"
                        inputMode="numeric"
                      />
                    </label>
                    <button className="button-secondary px-3" type="submit">
                      Adjust stock
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!filteredRows.length ? (
              <tr>
                <td className="px-5 py-10 text-center text-slate-600" colSpan={5}>
                  {rows.length
                    ? `No inventory matches “${query.trim()}”.`
                    : "No variants yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
