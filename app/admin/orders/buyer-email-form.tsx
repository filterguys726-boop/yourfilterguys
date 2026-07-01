"use client";

import { useRef, useState } from "react";
import { Lock, Save, Unlock } from "lucide-react";
import { updateOrderCustomerEmailAction } from "@/app/admin/orders/actions";

type BuyerEmailFormProps = {
  orderId: string;
  customerEmail: string;
};

export function BuyerEmailForm({ orderId, customerEmail }: BuyerEmailFormProps) {
  const [locked, setLocked] = useState(true);
  const [email, setEmail] = useState(customerEmail);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleLocked() {
    const nextLocked = !locked;
    setLocked(nextLocked);

    if (nextLocked) {
      setEmail(customerEmail);
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  return (
    <form
      action={updateOrderCustomerEmailAction}
      className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]"
    >
      <input type="hidden" name="order_id" value={orderId} />
      <label className="grid gap-2">
        <span className="label">Buyer email</span>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className={`field min-w-0 flex-1 ${
              locked ? "bg-slate-100 text-slate-600" : ""
            }`}
            name="customer_email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            readOnly={locked}
            required
          />
          <button
            type="button"
            className="button-secondary h-10 w-10 shrink-0 px-0"
            aria-label={locked ? "Unlock buyer email editing" : "Lock buyer email editing"}
            aria-pressed={!locked}
            title={locked ? "Unlock buyer email editing" : "Lock buyer email editing"}
            onClick={toggleLocked}
          >
            {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </button>
        </div>
      </label>
      <div className="flex items-end">
        <button type="submit" className="button-secondary" disabled={locked}>
          {locked ? <Lock className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          Save buyer email
        </button>
      </div>
    </form>
  );
}
