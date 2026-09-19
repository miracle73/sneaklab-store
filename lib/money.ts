// All monetary values are stored as integer *kobo* (1 Naira = 100 kobo)
// to avoid floating-point rounding errors in the payment path.

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format an integer kobo amount as Naira, e.g. 22000000 -> "₦220,000". */
export function formatKobo(kobo: number): string {
  return nairaFormatter.format(Math.round(kobo / 100));
}

/** Convert kobo to a plain naira number (for display where the symbol is separate). */
export function koboToNaira(kobo: number): number {
  return Math.round(kobo / 100);
}
