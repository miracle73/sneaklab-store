"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, selectTotalKobo } from "@/store/cart";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatKobo } from "@/lib/money";
import { Spinner } from "@/components/Spinner";
import { isValidEmail } from "@/lib/utils";

interface Form {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const EMPTY: Form = {
  email: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

export default function CheckoutPage() {
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const total = useCart(selectTotalKobo);

  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const canSubmit =
    isValidEmail(form.email) &&
    form.fullName.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    items.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Please fill in all required fields with a valid email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shipping: {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed. Please try again.");
      }
      // Hand off to Paystack's hosted checkout.
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (mounted && items.length === 0) {
    return (
      <div className="container-wrap py-20 text-center">
        <h1 className="font-display text-4xl uppercase tracking-tight">
          Nothing to check out
        </h1>
        <p className="mt-3 text-muted">Add something to your bag first.</p>
        <Link href="/#catalogue" className="btn-primary mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wrap py-10">
      <h1 className="font-display text-4xl uppercase tracking-tight">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        {/* Details */}
        <div className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="eyebrow mb-2">Contact</legend>
            <Field
              label="Email address"
              type="email"
              required
              value={form.email}
              onChange={(v) => update("email", v)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <p className="text-xs text-muted">
              Your receipt and order confirmation will be sent here.
            </p>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="eyebrow mb-2">Delivery address</legend>
            <Field
              label="Full name"
              required
              value={form.fullName}
              onChange={(v) => update("fullName", v)}
              autoComplete="name"
            />
            <Field
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              autoComplete="tel"
            />
            <Field
              label="Street address"
              required
              value={form.address}
              onChange={(v) => update("address", v)}
              autoComplete="street-address"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="City"
                required
                value={form.city}
                onChange={(v) => update("city", v)}
                autoComplete="address-level2"
              />
              <Field
                label="State"
                required
                value={form.state}
                onChange={(v) => update("state", v)}
                autoComplete="address-level1"
              />
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit border border-line p-6 lg:sticky lg:top-28">
          <h2 className="eyebrow">Order summary</h2>

          {!mounted ? (
            <div className="mt-4 space-y-3">
              <div className="h-16 w-full skeleton rounded" />
              <div className="h-16 w-full skeleton rounded" />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#f4f4f4]">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-paper">
                      {item.quantity}
                    </span>
                  </div>
                  <span className="flex-1 text-xs leading-tight">{item.name}</span>
                  <span className="text-xs font-semibold">
                    {formatKobo(item.unitPriceKobo * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{mounted ? formatKobo(total) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span className="font-semibold text-green-700">Free</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base">
              <span className="font-bold uppercase">Total</span>
              <span className="font-bold">{mounted ? formatKobo(total) : "—"}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !mounted}
            className="btn-primary mt-6 w-full"
          >
            {loading ? (
              <>
                <Spinner /> Redirecting…
              </>
            ) : (
              "Pay with Paystack"
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted">
            You&apos;ll be redirected to Paystack&apos;s secure checkout.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}
