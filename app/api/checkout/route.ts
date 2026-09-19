import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { generateReference, isValidEmail } from "@/lib/utils";

// Prisma + crypto require the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutBody {
  email?: string;
  items?: Array<{ productId?: string; quantity?: number }>;
  shipping?: {
    fullName?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const items = body.items ?? [];

  // --- Validate input -------------------------------------------------------
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Normalise + de-duplicate the requested line items. We only trust the
  // productId and quantity from the client — never the price.
  const quantityByProduct = new Map<string, number>();
  for (const item of items) {
    const id = item.productId;
    const qty = Number(item.quantity);
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json(
        { error: "Invalid cart line item." },
        { status: 400 }
      );
    }
    quantityByProduct.set(id, (quantityByProduct.get(id) ?? 0) + qty);
  }

  // --- Load authoritative prices from the database --------------------------
  const productIds = [...quantityByProduct.keys()];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "One or more products are no longer available." },
      { status: 409 }
    );
  }

  // Compute the total from DB prices. The client-sent amount is ignored.
  let amountKobo = 0;
  const orderItems = products.map((product) => {
    const quantity = quantityByProduct.get(product.id)!;
    amountKobo += product.priceKobo * quantity;
    return {
      productId: product.id,
      quantity,
      unitPriceKobo: product.priceKobo,
    };
  });

  if (amountKobo < 100) {
    // Paystack's minimum charge is ₦1 (100 kobo).
    return NextResponse.json(
      { error: "Order total is below the minimum charge." },
      { status: 400 }
    );
  }

  const reference = generateReference();
  const shipping = body.shipping ?? {};

  // --- Create the pending order (source of the amount we will charge) -------
  const order = await prisma.order.create({
    data: {
      reference,
      email,
      amountKobo,
      status: "pending",
      fullName: shipping.fullName?.trim() || null,
      address: shipping.address?.trim() || null,
      city: shipping.city?.trim() || null,
      state: shipping.state?.trim() || null,
      phone: shipping.phone?.trim() || null,
      items: { create: orderItems },
    },
  });

  // --- Initialize Paystack with OUR reference and OUR amount ----------------
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    req.nextUrl.origin;

  try {
    const init = await initializeTransaction({
      email,
      amountKobo,
      reference,
      callbackUrl: `${baseUrl}/order/${reference}`,
      metadata: { orderId: order.id, reference },
    });

    return NextResponse.json({
      authorization_url: init.authorization_url,
      reference,
    });
  } catch (err) {
    // Payment provider failed to initialize — mark the order failed so it
    // isn't left dangling as pending forever.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "failed" },
    });
    console.error("Paystack initialize error:", err);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 502 }
    );
  }
}
