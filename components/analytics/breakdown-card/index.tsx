"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IBreakdownCardProps } from "./props";

export default function BreakdownCard({
  title,
  rows,
  unit,
  empty,
  capitalizeLabels,
}: IBreakdownCardProps) {
  // Shares are relative to the largest row, not the total: the bars are there
  // to compare rows against each other, and against a total most would be
  // slivers.
  const largest = Math.max(...rows.map((r) => r.value), 1);
  const sorted = [...rows].sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((row) => (
              <div key={row.key} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  {row.badgeClass ? (
                    <Badge className={cn(capitalizeLabels && "capitalize", row.badgeClass)}>
                      {row.label}
                    </Badge>
                  ) : (
                    <span className={cn("truncate", capitalizeLabels && "capitalize")}>
                      {row.label}
                    </span>
                  )}
                  <span className="shrink-0 font-medium">
                    {row.value}
                    {unit ? ` ${unit}` : ""}
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(row.value / largest) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
