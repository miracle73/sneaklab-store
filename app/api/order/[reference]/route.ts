import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Read-only status endpoint used by the confirmation page to poll for the
// webhook-driven settlement. It NEVER writes the order status.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const order = await prisma.order.findUnique({
    where: { reference },
    select: { status: true, paidAt: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    paidAt: order.paidAt,
  });
}
