/**
 * Single source of truth for brand + domain strings.
 *
 * A future rebrand or domain change should only require editing this file —
 * do not hardcode the product name or site URL anywhere else.
 */
export const BRAND = {
  /** Product name as shown to users. */
  name: "QRFUSE",
  /** Short tagline used in default titles. */
  tagline: "Free QR Code Generator",
  /** Canonical site origin, no trailing slash. */
  siteUrl: "https://qrfuse.vercel.app",
  /** Absolute logo URL used in schema markup. */
  logoUrl: "https://qrfuse.vercel.app/favicon.png",
  /** Default author byline for blog content. */
  author: "QRFUSE Team",
  /** Blog feed title. */
  blogTitle: "QRFUSE Blog",
  /** Default site description. */
  description:
    "Generate QR codes instantly for URLs, text, Wi-Fi, email, phone numbers, and SMS.",
} as const;

/** Builds an absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) return `${BRAND.siteUrl}/${path}`;
  return `${BRAND.siteUrl}${path}`;
}
