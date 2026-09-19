import { createHmac, timingSafeEqual } from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return key;
}

export interface InitializeParams {
  email: string;
  /** Amount in kobo (Paystack's smallest currency unit). */
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

/**
 * Initialize a Paystack transaction. Paystack expects the amount in kobo.
 * We always pass our own server-generated reference so the webhook and the
 * confirmation page can look the order up by it.
 */
export async function initializeTransaction(
  params: InitializeParams
): Promise<InitializeResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      currency: "NGN",
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
    }),
    // Never cache a payment init.
    cache: "no-store",
  });

  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: InitializeResult;
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(`Paystack initialize failed: ${json.message ?? res.status}`);
  }
  return json.data;
}

/**
 * Verify a transaction directly with Paystack by reference. Used as a
 * belt-and-braces reconciliation path; the webhook remains the source of truth.
 */
export async function verifyTransaction(reference: string): Promise<{
  status: string; // "success" | "failed" | "abandoned" ...
  amount: number; // kobo
  reference: string;
}> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    }
  );
  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { status: string; amount: number; reference: string };
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(`Paystack verify failed: ${json.message ?? res.status}`);
  }
  return json.data;
}

/**
 * Verify the `x-paystack-signature` header. Paystack signs the *raw* request
 * body as HMAC-SHA512 using your secret key. We compare with a timing-safe
 * equality check. Returns false on any mismatch or malformed input.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey())
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
