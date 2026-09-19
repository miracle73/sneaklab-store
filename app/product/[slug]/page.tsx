import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { formatKobo } from "@/lib/money";
import { ProductGallery } from "@/components/ProductGallery";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.brand ?? ""} ${product.name}`.trim(),
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const gallery = product.images.length > 0 ? product.images : [product.imageUrl];
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 8;

  return (
    <div className="container-wrap py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/#catalogue" className="hover:text-ink">
          Trainers
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={gallery}
          alt={`${product.brand ?? ""} ${product.name}`.trim()}
        />

        <div className="lg:pt-4">
          {product.brand && (
            <span className="eyebrow text-ink">{product.brand}</span>
          )}
          <h1 className="mt-2 font-display text-3xl uppercase leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-bold">{formatKobo(product.priceKobo)}</p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                In stock
                {lowStock && (
                  <span className="text-accent">· only {product.stock} left</span>
                )}
              </span>
            ) : (
              <span className="text-muted">Currently unavailable</span>
            )}
          </div>

          <div className="mt-8 max-w-sm">
            <AddToCartButton
              stock={product.stock}
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                imageUrl: product.imageUrl,
                unitPriceKobo: product.priceKobo,
              }}
            />
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <h2 className="eyebrow mb-3">Product details</h2>
            <p className="text-sm leading-relaxed text-ink/80">
              {product.description}
            </p>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-ink/70">
            <li className="flex items-center gap-2">
              <Dot /> Free standard delivery over ₦200,000
            </li>
            <li className="flex items-center gap-2">
              <Dot /> Secure checkout with Paystack
            </li>
            <li className="flex items-center gap-2">
              <Dot /> 30-day returns
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />;
}
