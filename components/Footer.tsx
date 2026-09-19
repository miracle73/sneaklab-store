import Link from "next/link";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/" },
      { label: "Trainers", href: "/#catalogue" },
      { label: "Brands", href: "/#brands" },
      { label: "Your Bag", href: "/cart" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-paper">
      <div className="container-wrap flex flex-col justify-between gap-8 py-12 sm:flex-row">
        <div>
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display text-3xl leading-none">size</span>
            <span className="font-display text-3xl leading-none text-accent">?</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            A portfolio demo storefront. Real Paystack test payments, real
            orders in the database.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="eyebrow text-white/70">{col.title}</h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-wrap flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} size? demo. Not affiliated with size?.</span>
          <span>Payments secured by Paystack · Test mode</span>
        </div>
      </div>
    </footer>
  );
}
