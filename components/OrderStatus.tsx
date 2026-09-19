"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { Spinner } from "@/components/Spinner";

type Status = "pending" | "paid" | "failed";

export function OrderStatus({
  reference,
  initialStatus,
}: {
  reference: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const clear = useCart((s) => s.clear);
  const cleared = useRef(false);
  const attempts = useRef(0);

  // Clear the local cart once the order is confirmed paid.
  useEffect(() => {
    if (status === "paid" && !cleared.current) {
      cleared.current = true;
      clear();
    }
  }, [status, clear]);

  // Poll the read-only status endpoint while the webhook settles the order.
  useEffect(() => {
    if (status !== "pending") return;
    let active = true;

    const id = window.setInterval(async () => {
      attempts.current += 1;
      // Give up polling after ~90s; the webhook may still settle later and a
      // page refresh will reflect it.
      if (attempts.current > 30) {
        window.clearInterval(id);
        return;
      }
      try {
        const res = await fetch(`/api/order/${reference}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { status: Status };
        if (active && data.status !== "pending") {
          setStatus(data.status);
          window.clearInterval(id);
        }
      } catch {
        // transient network error — keep polling
      }
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [status, reference]);

  if (status === "paid") {
    return (
      <Banner
        tone="success"
        icon="✓"
        title="Payment confirmed"
        body="Your order is settled and confirmed. Thank you! A receipt has been sent to your email."
      >
        <Link href="/#catalogue" className="btn-primary mt-2">
          Continue shopping
        </Link>
      </Banner>
    );
  }

  if (status === "failed") {
    return (
      <Banner
        tone="error"
        icon="✕"
        title="Payment not completed"
        body="We couldn't confirm a successful payment for this order. If you were charged, it will be automatically reversed."
      >
        <Link href="/checkout" className="btn-outline mt-2">
          Try again
        </Link>
      </Banner>
    );
  }

  return (
    <Banner
      tone="pending"
      icon={<Spinner className="text-ink" />}
      title="Confirming your payment…"
      body="We're waiting for Paystack to confirm this transaction via webhook. This usually takes a few seconds — this page updates automatically."
    />
  );
}

function Banner({
  tone,
  icon,
  title,
  body,
  children,
}: {
  tone: "success" | "error" | "pending";
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const tones = {
    success: "border-green-300 bg-green-50",
    error: "border-red-300 bg-red-50",
    pending: "border-line bg-[#fafafa]",
  } as const;
  const iconTones = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    pending: "bg-white",
  } as const;

  return (
    <div className={`flex flex-col items-start gap-3 border p-6 ${tones[tone]}`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${iconTones[tone]}`}
        >
          {icon}
        </span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <p className="text-sm text-ink/70">{body}</p>
      {children}
    </div>
  );
}
