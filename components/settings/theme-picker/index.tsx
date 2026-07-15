"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LucideCheck } from "lucide-react";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

/** A miniature app window — sidebar rail plus content lines. */
function Preview({ variant }: { variant: "light" | "dark" }) {
  const light = variant === "light";
  return (
    <div className={cn("flex h-full w-full", light ? "bg-white" : "bg-slate-900")}>
      <div className={cn("w-1/3 border-r", light ? "border-slate-200 bg-slate-100" : "border-slate-700/60 bg-slate-800")}>
        <div className="space-y-1 p-1.5">
          <div className={cn("h-1 w-full rounded-full", light ? "bg-slate-300" : "bg-slate-600")} />
          <div className={cn("h-1 w-2/3 rounded-full", light ? "bg-slate-300" : "bg-slate-600")} />
        </div>
      </div>
      <div className="flex-1 space-y-1 p-1.5">
        <div className="h-1 w-1/2 rounded-full bg-blue-500" />
        <div className={cn("h-1 w-full rounded-full", light ? "bg-slate-200" : "bg-slate-700")} />
        <div className={cn("h-1 w-4/5 rounded-full", light ? "bg-slate-200" : "bg-slate-700")} />
      </div>
    </div>
  );
}

export default function ThemePicker() {
  const t = useT("settings");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // `theme` rather than `resolvedTheme` so "System" stays selected instead of
  // collapsing to light/dark.
  const options = [
    { value: "light", label: t.light },
    { value: "dark", label: t.dark },
    { value: "system", label: t.system },
  ];

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => (
          <div key={o.value} className="h-[86px] rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={t.theme} className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 text-left transition-all",
              active
                ? "border-blue-500 shadow-md shadow-blue-500/15"
                : "border-transparent ring-1 ring-border hover:ring-blue-500/40"
            )}
          >
            {/* ── Preview */}
            <div className="relative h-14 overflow-hidden">
              {option.value === "system" ? (
                // Split preview: light on the left, dark on the right.
                <>
                  <Preview variant="light" />
                  <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                    <div className="h-full w-[200%]">
                      <Preview variant="dark" />
                    </div>
                  </div>
                </>
              ) : (
                <Preview variant={option.value as "light" | "dark"} />
              )}
            </div>

            {/* ── Label */}
            <div className="flex items-center justify-between gap-1 border-t border-border/60 bg-card px-2.5 py-1.5">
              <span className="truncate text-xs font-medium">{option.label}</span>
              {active && (
                <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-blue-500">
                  <LucideCheck className="size-2.5 text-white" />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
