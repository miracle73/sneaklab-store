"use client";

import Link from "next/link";
import { useCart, selectCount } from "@/store/cart";
import { useHasMounted } from "@/hooks/useHasMounted";

const NAV = [
  { label: "New In", href: "/" },
  { label: "Trainers", href: "/#catalogue" },
  { label: "Brands", href: "/#brands" },
];

export function Header() {
  const mounted = useHasMounted();
  const count = useCart(selectCount);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      {/* Promo strip */}
      <div className="bg-ink text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-paper">
        <div className="container-wrap py-2">
          Free delivery on orders over ₦200,000
        </div>
      </div>

      <div className="container-wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-1" aria-label="size? home">
          <span className="font-display text-3xl leading-none tracking-tight text-ink">
            size
          </span>
          <span className="font-display text-3xl leading-none text-accent">?</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="group relative inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:text-accent"
          aria-label={`Cart, ${mounted ? count : 0} items`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M2 2h2l2.4 12.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
          <span className="hidden sm:inline">Bag</span>
          {mounted && count > 0 && (
            <span className="absolute -right-3 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-paper">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
