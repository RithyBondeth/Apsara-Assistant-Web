"use client";

import { cn } from "@/lib/utils";
import { ISectionCardProps } from "./props";

/**
 * Shared shell for a settings section: icon tile, title, description, body.
 * Matches the card rhythm used on the integrations page so the two sections
 * read as one system.
 */
export default function SectionCard({
  icon: Icon,
  title,
  description,
  accent = "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  children,
}: ISectionCardProps) {
  return (
    // Solid surface + full-strength border: at 60% opacity on a near-black
    // background the card dissolved into the page and stopped reading as a card.
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-start gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            accent
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold leading-none">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </header>

      <div className="p-4">{children}</div>
    </section>
  );
}
