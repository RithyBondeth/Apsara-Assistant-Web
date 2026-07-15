import Image from "next/image";
import { cn } from "@/lib/utils";

/* Brand kit lives in public/brand/ (generated — mark, horizontal lockups in
   light/dark, mono silhouettes, and PNG exports for external use). */
const LOCKUP = { width: 598, height: 128 };

const SIZES = {
  sm: "h-7",
  md: "h-9",
} as const;

/**
 * The full horizontal logo lockup (crowned-bubble mark + "Apsara Assistant"
 * wordmark) used by the landing header, footer, and auth pages. Ships as two
 * pre-rendered SVGs — one per theme — swapped with the `dark:` variant.
 */
export function BrandLogo({
  size = "md",
  priority = false,
  className,
}: {
  size?: keyof typeof SIZES;
  /** Preload the logo — enable only for the above-the-fold header instance. */
  priority?: boolean;
  className?: string;
}) {
  const h = SIZES[size];

  return (
    <span className={cn("flex items-center", className)}>
      <Image
        src="/brand/apsara-logo-light.svg"
        alt="Apsara Assistant"
        {...LOCKUP}
        priority={priority}
        className={cn("w-auto dark:hidden", h)}
      />
      <Image
        src="/brand/apsara-logo-dark.svg"
        alt="Apsara Assistant"
        {...LOCKUP}
        priority={priority}
        className={cn("hidden w-auto dark:block", h)}
      />
    </span>
  );
}

/**
 * Just the brand mark (chat bubble wearing an Apsara crown) inside a circular
 * chip — used as the assistant avatar in chat mockups. The white fill keeps
 * the mark legible on any surface, matching the app-icon treatment.
 */
export function BrandMark({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/5",
        className,
      )}
    >
      <Image
        src="/brand/apsara-mark.svg"
        alt=""
        width={128}
        height={128}
        className={cn("w-auto", imgClassName)}
      />
    </span>
  );
}
