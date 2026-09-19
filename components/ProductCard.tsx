import Image from "next/image";
import Link from "next/link";
import { formatKobo } from "@/lib/money";

export interface ProductCardData {
  slug: string;
  name: string;
  brand: string | null;
  imageUrl: string;
  priceKobo: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col animate-fade-in"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f4f4f4]">
        <Image
          src={product.imageUrl}
          alt={`${product.brand ?? ""} ${product.name}`.trim()}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 py-3">
        {product.brand && (
          <span className="eyebrow text-ink">{product.brand}</span>
        )}
        <h3 className="text-sm font-medium leading-snug text-ink line-clamp-2">
          {product.name}
        </h3>
        <span className="mt-1 text-sm font-bold text-ink">
          {formatKobo(product.priceKobo)}
        </span>
      </div>
    </Link>
  );
}
