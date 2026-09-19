"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, selectTotalKobo } from "@/store/cart";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatKobo } from "@/lib/money";

export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const total = useCart(selectTotalKobo);

  // Avoid hydration mismatch: render a stable shell until mounted.
  if (!mounted) {
    return (
      <div className="container-wrap py-12">
        <div className="h-8 w-40 skeleton rounded" />
        <div className="mt-8 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 w-full skeleton rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-wrap py-20 text-center">
        <h1 className="font-display text-4xl uppercase tracking-tight">
          Your bag is empty
        </h1>
        <p className="mt-3 text-muted">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/#catalogue" className="btn-primary mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wrap py-10">
      <h1 className="font-display text-4xl uppercase tracking-tight">Your bag</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-[#f4f4f4]"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    {item.brand && (
                      <span className="eyebrow text-ink">{item.brand}</span>
                    )}
                    <Link
                      href={`/product/${item.slug}`}
                      className="block text-sm font-medium hover:text-accent"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <span className="text-sm font-bold">
                    {formatKobo(item.unitPriceKobo * item.quantity)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center border border-line">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center text-lg hover:bg-line disabled:opacity-40"
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-lg hover:bg-line"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs font-semibold uppercase tracking-wide text-muted underline-offset-2 hover:text-accent hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit border border-line p-6 lg:sticky lg:top-28">
          <h2 className="eyebrow">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatKobo(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="font-semibold text-green-700">Free</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-bold uppercase">Total</span>
            <span className="text-lg font-bold">{formatKobo(total)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Checkout
          </Link>
          <Link
            href="/#catalogue"
            className="mt-3 block text-center text-xs font-semibold uppercase tracking-wide text-muted hover:text-ink"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
