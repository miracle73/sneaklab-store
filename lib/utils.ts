import { randomBytes } from "crypto";

/** Tiny classnames helper (avoids pulling in clsx for a demo). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Generate a unique, human-readable order reference.
 * Format: SZ-<base36 timestamp>-<random>. Uniqueness is additionally
 * enforced by the @unique constraint on Order.reference.
 */
export function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `SZ-${ts}-${rand}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
