import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { logo: "h-7", apsara: "text-sm", assistant: "text-sm" },
  md: { logo: "h-9", apsara: "text-base", assistant: "text-base" },
} as const;

/**
 * Shared brand lockup (logo mark + "Apsara Assistant" wordmark) used by both
 * the landing header and footer so they stay visually identical.
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
  const s = SIZES[size];

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.svg"
        alt="Apsara Assistant"
        width={28}
        height={42}
        className={cn("w-auto", s.logo)}
        priority={priority}
      />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            s.apsara,
          )}
        >
          Apsara
        </span>
        <span
          className={cn(
            "font-semibold tracking-tight text-blue-600 dark:text-blue-400",
            s.assistant,
          )}
        >
          Assistant
        </span>
      </span>
    </span>
  );
}

/**
 * Just the logo mark inside a circular chip — used as the assistant avatar in
 * chat mockups. Rendered on a white fill so the colored illustration reads on
 * dark surfaces, matching the app icon / OG image treatment.
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
        src="/logo.svg"
        alt=""
        width={28}
        height={42}
        className={cn("w-auto", imgClassName)}
      />
    </span>
  );
}
