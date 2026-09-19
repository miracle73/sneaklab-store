import { prisma } from "@/lib/prisma";

export async function getOrderByReference(reference: string) {
  return prisma.order.findUnique({
    where: { reference },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}
