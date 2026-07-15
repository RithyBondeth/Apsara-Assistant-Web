"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/stores/languages/language-store";
import { useLanguage } from "@/components/utils/languages/language-context";
import { cn } from "@/lib/utils";

/**
 * EN / ខ្មែរ switch. setLanguage also mirrors the choice to a cookie so the
 * server provider can read it on the next request and avoid a flash.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const language = useLanguage();
  const { setLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-7 w-[72px]" />;

  return (
    <div
      className={cn(
        "relative flex w-fit items-center gap-0.5 rounded-full bg-muted p-0.5",
        className,
      )}
    >
      {/* sliding pill indicator */}
      <span
        className={cn(
          "absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-background shadow-sm transition-all duration-200",
          language === "km" ? "left-[calc(50%+1px)]" : "left-0.5",
        )}
      />
      <button
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200",
          language === "en" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("km")}
        aria-pressed={language === "km"}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-200",
          language === "km" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        ខ្មែរ
      </button>
    </div>
  );
}
