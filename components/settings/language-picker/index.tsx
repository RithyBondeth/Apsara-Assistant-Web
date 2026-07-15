"use client";

import { useEffect, useState } from "react";
import { LucideCheck } from "lucide-react";
import { useLanguageStore, type TLanguage } from "@/stores/languages/language-store";
import { useLanguage } from "@/components/utils/languages/language-context";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

export default function LanguagePicker() {
  const t = useT("settings");
  const language = useLanguage();
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Each language is labelled in its own script first, so a Khmer speaker can
  // find it without reading English.
  const options: { value: TLanguage; native: string; label: string }[] = [
    { value: "en", native: "English", label: t.english },
    { value: "km", native: "ភាសាខ្មែរ", label: t.khmer },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <div key={o.value} className="h-[52px] rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={t.language} className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const active = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLanguage(option.value)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all",
              active
                ? "border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/10"
                : "border-transparent ring-1 ring-border hover:ring-blue-500/40"
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{option.native}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {option.label}
              </span>
            </span>
            {active && (
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-blue-500">
                <LucideCheck className="size-2.5 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
