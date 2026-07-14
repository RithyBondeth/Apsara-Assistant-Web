"use client";

import { LucideUsers, LucideMessageCircle, LucideLanguages } from "lucide-react";
import { useCountUp } from "@/hooks/utils/use-gsap-interactions";
import { useT } from "@/hooks/utils/use-translations";

export default function LandingStats() {
  const sectionRef = useCountUp<HTMLElement>();
  const t = useT("hero");

  const STATS = [
    { icon: LucideUsers, value: "500+", label: t.statSellers },
    { icon: LucideMessageCircle, value: "50K+", label: t.statMessages },
    { icon: LucideLanguages, value: "3", label: t.statLanguages },
  ];

  return (
    <section ref={sectionRef} className="relative border-y border-border/60 bg-card/30 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-dots" />

      {/* Mobile: a w-fit column so every row shares one left edge — icons and
          numbers line up vertically and the block stays centred. sm+: the
          original 3-up grid of centred, stacked stats. */}
      <div className="stagger-list relative z-10 mx-auto flex w-fit max-w-4xl flex-col gap-8 px-4 sm:grid sm:w-auto sm:grid-cols-3 sm:gap-6 sm:px-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex w-full items-center gap-4 sm:w-auto sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 sm:mb-1">
              <stat.icon className="size-5" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col sm:items-center">
              <span
                data-countup={stat.value}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"
              >
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
