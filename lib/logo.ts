import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Intrinsic aspect ratio of `public/logo.svg` (viewBox 75 × 112.5). */
export const LOGO_ASPECT = 75 / 112.499997;

let cached: string | null = null;

/**
 * Reads the brand logo SVG and returns it as a base64 data URI, suitable for
 * embedding in a `next/og` `ImageResponse` `<img>` element. The result is
 * memoized for the lifetime of the module (icons are generated at build time).
 */
export async function getLogoDataUri(): Promise<string> {
  if (cached) return cached;
  const svg = await readFile(join(process.cwd(), "public", "logo.svg"));
  cached = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return cached;
}

/** Width in px that preserves the logo aspect ratio for a given height. */
export function logoWidthForHeight(height: number): number {
  return Math.round(height * LOGO_ASPECT);
}
