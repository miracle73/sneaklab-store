import { PrismaClient } from "@prisma/client";
import { amplienceUrl } from "../lib/images";

const prisma = new PrismaClient();

// GBP list price -> NGN (demo FX ~ £1 = ₦2,000) -> integer kobo.
const gbpToKobo = (gbp: number) => Math.round(gbp * 2000) * 100;

interface Seed {
  slug: string;
  brand: string;
  name: string;
  color: string;
  gbp: number;
  code: string; // Amplience image code
  category: string;
  stock: number;
  description: string;
}

const SEED: Seed[] = [
  {
    slug: "red-adidas-originals-archive-zx-8000",
    brand: "adidas Originals",
    name: "Archive ZX 8000",
    color: "Red",
    gbp: 110,
    code: "sz_803965",
    category: "trainers",
    stock: 24,
    description:
      "A size? archive reissue of the iconic ZX 8000. Torsion System midsole, OG mesh-and-suede upper and a colourway pulled straight from the vault.",
  },
  {
    slug: "blue-adidas-originals-zx-8000-made-in-germany",
    brand: "adidas Originals",
    name: "ZX 8000 'Made in Germany'",
    color: "Blue",
    gbp: 170,
    code: "sz_806059",
    category: "trainers",
    stock: 12,
    description:
      "Craftsmanship-led ZX 8000 built in Germany with premium leather and suede, Torsion support and a heritage running silhouette.",
  },
  {
    slug: "pink-adidas-originals-jabbar-hi-made-in-la",
    brand: "adidas Originals",
    name: "Jabbar Hi 'Made in LA'",
    color: "Pink",
    gbp: 220,
    code: "sz_797713",
    category: "trainers",
    stock: 6,
    description:
      "Hand-finished in Los Angeles, the Jabbar Hi returns in supple leather with a vulcanised sole and a bold, considered colour hit.",
  },
  {
    slug: "brown-adidas-originals-handball-spezial",
    brand: "adidas Originals",
    name: "Handball Spezial — Brown",
    color: "Brown",
    gbp: 90,
    code: "sz_803608",
    category: "trainers",
    stock: 30,
    description:
      "The terrace-ready Handball Spezial in rich brown suede with a classic gum sole and slim, low-profile fit.",
  },
  {
    slug: "red-adidas-originals-handball-spezial",
    brand: "adidas Originals",
    name: "Handball Spezial — Red",
    color: "Red",
    gbp: 90,
    code: "sz_803609",
    category: "trainers",
    stock: 18,
    description:
      "A punchy red take on the Handball Spezial. Premium suede upper, gold foil branding and the signature gum outsole.",
  },
  {
    slug: "grey-nike-air-liquid-max",
    brand: "Nike",
    name: "Air Liquid Max",
    color: "Grey",
    gbp: 200,
    code: "sz_799943",
    category: "trainers",
    stock: 9,
    description:
      "Nike's Air Liquid Max fuses a sculpted, fluid upper with visible Air cushioning for a future-facing everyday silhouette.",
  },
  {
    slug: "white-jordan-air-12-retro-bucks",
    brand: "Jordan",
    name: "Air Jordan 12 Retro 'Bucks'",
    color: "White",
    gbp: 190,
    code: "sz_799963",
    category: "trainers",
    stock: 8,
    description:
      "The Air Jordan 12 Retro returns in the 'Bucks' colourway — tumbled leather, stitched midsole detailing and Zoom Air comfort.",
  },
  {
    slug: "blue-reebok-club-c-size-exclusive",
    brand: "Reebok",
    name: "Club C — size? Exclusive",
    color: "Blue",
    gbp: 80,
    code: "sz_806287",
    category: "trainers",
    stock: 22,
    description:
      "A size? exclusive Club C. Clean leather tennis silhouette with a soft blue accent and vintage court styling.",
  },
  {
    slug: "white-new-balance-1890-slip",
    brand: "New Balance",
    name: "1890 Slip",
    color: "White",
    gbp: 160,
    code: "sz_798891",
    category: "trainers",
    stock: 14,
    description:
      "A slip-on evolution of New Balance's dad-shoe lineage — ABZORB cushioning, a sculpted sole unit and easy on-off comfort.",
  },
  {
    slug: "brown-asics-gel-transcend-fj",
    brand: "ASICS",
    name: "Gel-Transcend FJ",
    color: "Brown",
    gbp: 155,
    code: "sz_804597",
    category: "trainers",
    stock: 11,
    description:
      "Trail-inspired ASICS Gel-Transcend FJ with GEL cushioning, a rugged outsole and layered technical upper.",
  },
  {
    slug: "beige-diadora-seoul-indoor",
    brand: "Diadora",
    name: "Seoul Indoor — Beige",
    color: "Beige",
    gbp: 80,
    code: "sz_800575",
    category: "trainers",
    stock: 20,
    description:
      "Retro indoor-court styling from Diadora in a neutral beige suede, with a slim gum sole and heritage T-toe overlay.",
  },
  {
    slug: "blue-diadora-seoul-indoor",
    brand: "Diadora",
    name: "Seoul Indoor — Blue",
    color: "Blue",
    gbp: 80,
    code: "sz_800576",
    category: "trainers",
    stock: 16,
    description:
      "The Diadora Seoul Indoor in a cool blue suede. Low, clean and terrace-approved with a classic gum outsole.",
  },
  {
    slug: "beige-diadora-game-low",
    brand: "Diadora",
    name: "Game Low — Beige",
    color: "Beige",
    gbp: 85,
    code: "sz_801665",
    category: "trainers",
    stock: 26,
    description:
      "A timeless leather court sneaker. The Diadora Game Low pairs a beige leather upper with tonal branding and a vulcanised sole.",
  },
  {
    slug: "brown-diadora-game-low",
    brand: "Diadora",
    name: "Game Low — Brown",
    color: "Brown",
    gbp: 85,
    code: "sz_801666",
    category: "trainers",
    stock: 21,
    description:
      "Brown-leather Diadora Game Low with a minimal court profile, perforated toe and everyday-ready cushioning.",
  },
  {
    slug: "brown-puma-klim",
    brand: "PUMA",
    name: "Klim — Brown",
    color: "Brown",
    gbp: 100,
    code: "sz_804855",
    category: "trainers",
    stock: 19,
    description:
      "PUMA's Klim delivers a rugged outdoor-inspired look with a chunky lugged sole and layered textile-and-suede upper.",
  },
  {
    slug: "pink-puma-klim",
    brand: "PUMA",
    name: "Klim — Pink",
    color: "Pink",
    gbp: 100,
    code: "sz_804856",
    category: "trainers",
    stock: 13,
    description:
      "A standout pink colourway of the PUMA Klim, blending trail-ready grip with street-ready styling.",
  },
  {
    slug: "grey-salomon-xt-4-gore-tex",
    brand: "Salomon",
    name: "XT-4 GORE-TEX",
    color: "Grey",
    gbp: 195,
    code: "sz_802736",
    category: "outdoor",
    stock: 7,
    description:
      "The cult Salomon XT-4 with a GORE-TEX membrane, Quicklace system and Contagrip outsole — technical trail heritage, all-weather ready.",
  },
  {
    slug: "black-scarpa-mojito",
    brand: "Scarpa",
    name: "Mojito",
    color: "Black",
    gbp: 150,
    code: "sz_804763",
    category: "outdoor",
    stock: 10,
    description:
      "Scarpa's approach-shoe icon. Suede upper, Vibram Megagrip outsole and a versatile silhouette equally at home on rock or pavement.",
  },
  {
    slug: "green-crocs-classic-clog",
    brand: "Crocs",
    name: "Classic Clog",
    color: "Green",
    gbp: 55,
    code: "sz_804751",
    category: "clogs",
    stock: 40,
    description:
      "The original Crocs Classic Clog. Lightweight Croslite foam, ventilation ports and pivoting heel strap for all-day comfort.",
  },
  {
    slug: "green-crocs-classic-boat-clog",
    brand: "Crocs",
    name: "Classic Boat Clog — Green",
    color: "Green",
    gbp: 75,
    code: "sz_804749",
    category: "clogs",
    stock: 28,
    description:
      "A boat-shoe twist on the Classic Clog with a woven-look upper and the same cushioned Croslite comfort underfoot.",
  },
  {
    slug: "brown-crocs-classic-boat-clog",
    brand: "Crocs",
    name: "Classic Boat Clog — Brown",
    color: "Brown",
    gbp: 65,
    code: "sz_804750",
    category: "clogs",
    stock: 25,
    description:
      "The Crocs Classic Boat Clog in brown — nautical styling meets iconic clog comfort and grip.",
  },
  {
    slug: "black-timberland-heritage-clog",
    brand: "Timberland",
    name: "Heritage Clog",
    color: "Black",
    gbp: 130,
    code: "sz_802987",
    category: "clogs",
    stock: 15,
    description:
      "Timberland reworks the clog with premium leather, a lugged rubber outsole and its unmistakable heritage build quality.",
  },
  {
    slug: "brown-birkenstock-highwood-moc",
    brand: "Birkenstock",
    name: "Highwood Moc — Brown",
    color: "Brown",
    gbp: 150,
    code: "sz_807507",
    category: "clogs",
    stock: 12,
    description:
      "A moc-toe clog from Birkenstock with the legendary contoured cork-latex footbed wrapped in rich brown leather.",
  },
  {
    slug: "beige-birkenstock-highwood-moc",
    brand: "Birkenstock",
    name: "Highwood Moc — Beige",
    color: "Beige",
    gbp: 150,
    code: "sz_807508",
    category: "clogs",
    stock: 12,
    description:
      "Birkenstock's Highwood Moc in soft beige nubuck, built on the anatomically shaped footbed for support that lasts.",
  },
];

async function main() {
  console.log(`Seeding ${SEED.length} products...`);
  for (const p of SEED) {
    const data = {
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      description: p.description,
      priceKobo: gbpToKobo(p.gbp),
      imageUrl: amplienceUrl(`${p.code}_a`, { w: 800 }),
      images: [
        amplienceUrl(`${p.code}_a`, { w: 1000 }),
        amplienceUrl(`${p.code}_b`, { w: 1000 }),
      ],
      category: p.category,
      stock: p.stock,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: data,
      update: data,
    });
  }
  const count = await prisma.product.count();
  console.log(`Done. ${count} products in the catalogue.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
