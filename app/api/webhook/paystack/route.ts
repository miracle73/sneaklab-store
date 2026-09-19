import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaystackEvent {
  event: string;
  data: {
    id: number | string;
    reference: string;
    amount: number; // kobo
    status: string; // "success" | ...
  };
}

export async function POST(req: NextRequest) {
  // 1) Read the RAW body. Signature is computed over these exact bytes;
  //    re-serialising parsed JSON would change them and break verification.
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  // 2) Verify the HMAC-SHA512 signature. Reject anything that fails.
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: PaystackEvent;
  try {
    payload = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // We only settle orders on a successful charge. Acknowledge everything else
  // with 200 so Paystack does not retry events we intentionally ignore.
  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const { data } = payload;
  // Idempotency key: unique per Paystack event delivery for this transaction.
  const paystackEventId = `${payload.event}:${data.id}`;

  try {
    await prisma.$transaction(async (tx) => {
      // 3) The unique constraint is the idempotency gate. A replayed delivery
      //    hits the conflict below and the whole transaction is rolled back.
      await tx.webhookEvent.create({ data: { paystackEventId } });

      const order = await tx.order.findUnique({
        where: { reference: data.reference },
      });

      // Unknown reference — nothing to settle, but the event is consumed.
      if (!order) {
        console.warn(`Webhook for unknown reference: ${data.reference}`);
        return;
      }

      // Already settled — stay settled exactly once, do nothing.
      if (order.status === "paid") return;

      // 4) Confirm the charged amount matches the order we created. Never
      //    settle on a mismatch (possible tampering / wrong reference).
      if (data.status !== "success" || data.amount !== order.amountKobo) {
        console.error(
          `Amount/status mismatch for ${data.reference}: ` +
            `expected ${order.amountKobo}, got ${data.amount} (${data.status})`
        );
        return;
      }

      // 5) Settle.
      await tx.order.update({
        where: { id: order.id },
        data: { status: "paid", paidAt: new Date() },
      });
    });
  } catch (err) {
    // Duplicate delivery: unique violation on paystackEventId -> already
    // processed. Return 200 and do nothing.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Genuine processing error: return 500 so Paystack retries the delivery.
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  // 6) Return 200 quickly.
  return NextResponse.json({ received: true });
}
