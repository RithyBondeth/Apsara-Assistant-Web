"use client";

import {
  LucideLanguages,
  LucideSmartphone,
  LucideShoppingBag,
  LucideBell,
  LucideClipboardList,
  LucideBarChart3,
} from "lucide-react";
import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";

export default function LandingFeatures() {
  const sectionRef = useGsapScrollAnimation<HTMLElement>();
  const t = useT("features");

  const FEATURES = [
    { icon: LucideLanguages,    title: t.f1Title, description: t.f1Desc },
    { icon: LucideSmartphone,   title: t.f2Title, description: t.f2Desc },
    { icon: LucideShoppingBag,  title: t.f3Title, description: t.f3Desc },
    { icon: LucideBell,         title: t.f4Title, description: t.f4Desc },
    { icon: LucideClipboardList,title: t.f5Title, description: t.f5Desc },
    { icon: LucideBarChart3,    title: t.f6Title, description: t.f6Desc },
  ];

  return (
    <section ref={sectionRef} id="features" className="relative py-16 sm:py-24 md:py-32">
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span
            data-gsap="fade-up"
            className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3"
          >
            {t.sectionLabel}
          </span>
          <h2
            data-gsap="split-words"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 [perspective:800px]"
          >
            {t.heading1}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {t.heading2}
            </span>
          </h2>
          <p
            data-gsap="fade-up"
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            {t.description}
          </p>
        </div>

        {/* Grid */}
        <div
          data-gsap="stagger-children"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-7 transition-all duration-300 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="mb-4 inline-flex items-center justify-center size-11 rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/15">
                <feature.icon className="size-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
