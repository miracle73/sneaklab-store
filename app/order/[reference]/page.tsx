import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getOrderByReference } from "@/lib/orders";
import { formatKobo } from "@/lib/money";
import { OrderStatus } from "@/components/OrderStatus";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmation",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  if (!order) {
    return (
      <div className="container-wrap py-20 text-center">
        <h1 className="font-display text-4xl uppercase tracking-tight">
          Order not found
        </h1>
        <p className="mt-3 text-muted">
          We couldn&apos;t find an order with reference{" "}
          <code className="rounded bg-line px-1.5 py-0.5">{reference}</code>.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wrap max-w-3xl py-10">
      <div className="mb-2 text-xs text-muted">
        Order reference
        <span className="ml-2 font-mono font-semibold text-ink">
          {order.reference}
        </span>
      </div>
      <h1 className="font-display text-4xl uppercase tracking-tight">
        Thanks for your order
      </h1>

      <div className="mt-6">
        <OrderStatus
          reference={order.reference}
          initialStatus={order.status}
        />
      </div>

      {/* Items */}
      <section className="mt-10">
        <h2 className="eyebrow mb-3">Items</h2>
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#f4f4f4]">
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                {item.product.brand && (
                  <span className="eyebrow text-ink">{item.product.brand}</span>
                )}
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-muted">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-bold">
                {formatKobo(item.unitPriceKobo * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between py-4">
          <span className="font-bold uppercase">Total</span>
          <span className="text-lg font-bold">{formatKobo(order.amountKobo)}</span>
        </div>
      </section>

      {/* Delivery details */}
      {(order.fullName || order.address) && (
        <section className="mt-4 border-t border-line pt-6">
          <h2 className="eyebrow mb-3">Delivery to</h2>
          <address className="text-sm not-italic text-ink/80">
            {order.fullName && <div>{order.fullName}</div>}
            {order.address && <div>{order.address}</div>}
            <div>
              {[order.city, order.state].filter(Boolean).join(", ")}
            </div>
            {order.phone && <div>{order.phone}</div>}
            <div className="mt-1 text-muted">{order.email}</div>
          </address>
        </section>
      )}

      <p className="mt-10 text-center text-xs text-muted">
        Payment status is set only by our verified Paystack webhook — never by
        this page or the redirect back from checkout.
      </p>
    </div>
  );
}
