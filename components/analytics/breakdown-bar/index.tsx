"use client";

import { cn } from "@/lib/utils";
import { IBreakdownBarProps } from "./props";

export default function BreakdownBar({ rows, emptyLabel }: IBreakdownBarProps) {
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  if (total === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-3">
      {rows
        .filter((row) => row.value > 0)
        .map((row) => {
          const pct = Math.round((row.value / total) * 100);
          return (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium capitalize">{row.label}</span>
                <span className="text-muted-foreground">
                  {row.value} · {pct}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${row.label}: ${row.value} of ${total}`}
              >
                <div
                  className={cn("h-full rounded-full bg-blue-500", row.className)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
