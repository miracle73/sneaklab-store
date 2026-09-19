import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getBrands } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { amplienceUrl } from "@/lib/images";

// Reads live catalogue data on each request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, brands] = await Promise.all([getAllProducts(), getBrands()]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="container-wrap grid items-center gap-8 py-14 md:grid-cols-2 md:py-20">
          <div className="animate-fade-in">
            <span className="eyebrow text-accent">size? archive</span>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Step into
              <br />
              the archive
            </h1>
            <p className="mt-6 max-w-md text-white/70">
              The latest drops, exclusives and reissued classics. Trainers built
              to last and delivered fast, with a secure checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#catalogue" className="btn-primary bg-accent hover:bg-paper hover:text-ink">
                Shop the drop
              </Link>
              <Link href="#brands" className="btn-outline border-white text-white hover:bg-white hover:text-ink">
                Browse brands
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white/5">
            <Image
              src={amplienceUrl("sz_803965_a", { w: 1200 })}
              alt="adidas Originals Archive ZX 8000"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute bottom-4 left-4 bg-ink/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
              Featured · adidas ZX 8000
            </span>
          </div>
        </div>
      </section>

      {/* Brands strip */}
      <section id="brands" className="border-b border-line">
        <div className="container-wrap flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6">
          <span className="eyebrow mr-2">Shop by brand</span>
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-sm font-semibold uppercase tracking-wide text-ink/80"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="container-wrap py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">Mens footwear</span>
            <h2 className="mt-1 font-display text-3xl uppercase tracking-tight sm:text-4xl">
              New in trainers
            </h2>
          </div>
          <span className="hidden text-sm text-muted sm:inline">
            {products.length} products
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-sm border border-line bg-[#fafafa] p-12 text-center">
            <p className="text-lg font-semibold">The catalogue is empty.</p>
            <p className="mt-2 text-sm text-muted">
              Run <code className="rounded bg-line px-1.5 py-0.5">npm run db:seed</code>{" "}
              to load products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
