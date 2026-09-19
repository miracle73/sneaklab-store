"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import type { CartItem } from "@/store/cart";

type Props = {
  product: Omit<CartItem, "quantity">;
  stock: number;
};

export function AddToCartButton({ product, stock }: Props) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const soldOut = stock <= 0;

  function handleAdd() {
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  if (soldOut) {
    return (
      <button className="btn w-full cursor-not-allowed bg-line text-muted" disabled>
        Sold out
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button onClick={handleAdd} className="btn-primary w-full">
        {added ? "Added to bag ✓" : "Add to bag"}
      </button>
      {added && (
        <Link
          href="/cart"
          className="btn-outline w-full animate-fade-in"
        >
          Go to bag
        </Link>
      )}
    </div>
  );
}
