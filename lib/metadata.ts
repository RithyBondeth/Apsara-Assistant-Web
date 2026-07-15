import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteName = "Apsara Assistant";

export const siteDescription =
  "AI-powered sales assistant for Cambodian sellers. Understands Khmer, English, and romanized Khmer.";

/**
 * Next.js merges `metadata` shallowly: a child segment that defines
 * `openGraph`/`twitter` overwrites the parent's object entirely. Spread these
 * shared bases into each segment so nested defaults (site name, card type,
 * locale) are preserved. See generate-metadata docs — "Merging".
 */
export const baseOpenGraph: Metadata["openGraph"] = {
  type: "website",
  siteName,
  locale: "en_US",
};

export const baseTwitter: Metadata["twitter"] = {
  card: "summary_large_image",
};
