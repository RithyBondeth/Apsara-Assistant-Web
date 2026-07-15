"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LucideSun, LucideMoon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Binary light/dark switch. Renders a same-sized placeholder until mounted,
 * because the resolved theme isn't known during SSR and swapping the icon after
 * hydration would flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-8" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <LucideSun
        className={cn(
          "absolute size-4 transition-all duration-300",
          resolvedTheme === "dark" ? "opacity-100 rotate-0" : "opacity-0 rotate-90",
        )}
      />
      <LucideMoon
        className={cn(
          "absolute size-4 transition-all duration-300",
          resolvedTheme === "dark" ? "opacity-0 -rotate-90" : "opacity-100 rotate-0",
        )}
      />
    </button>
  );
}
