"use client";

import { useFormStatus } from "react-dom";

export function SquareCatalogSyncButton({
  productCount
}: {
  productCount: number;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="button-secondary disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      aria-live="polite"
    >
      {pending
        ? `Syncing ${productCount} active product${productCount === 1 ? "" : "s"}…`
        : "Sync active products to Square"}
    </button>
  );
}
