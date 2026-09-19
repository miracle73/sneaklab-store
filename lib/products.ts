import { prisma } from "@/lib/prisma";

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

/** Distinct brand names for the "shop by brand" strip. */
export async function getBrands(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { brand: { not: null } },
    distinct: ["brand"],
    select: { brand: true },
    orderBy: { brand: "asc" },
  });
  return rows.map((r) => r.brand!).filter(Boolean);
}
