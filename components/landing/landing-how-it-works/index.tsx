"use client";

import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";

export default function LandingHowItWorks() {
  const sectionRef = useGsapScrollAnimation<HTMLElement>();
  const t = useT("howItWorks");

  const STEPS = [
    { number: "01", title: t.s1Title, description: t.s1Desc },
    { number: "02", title: t.s2Title, description: t.s2Desc },
    { number: "03", title: t.s3Title, description: t.s3Desc },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
    >
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />

      {/* Accent orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-amber-500/8 blur-[180px]" />
        <div className="absolute right-[-10%] top-1/3 h-[400px] w-[400px] rounded-full bg-amber-400/6 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16 md:mb-20">
          <span
            data-gsap="fade-up"
            className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3"
          >
            {t.sectionLabel}
          </span>
          <h2
            data-gsap="split-words"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 perspective-midrange"
          >
            {t.heading1}{" "}
            <span className="bg-linear-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              {t.heading2}
            </span>
          </h2>
          <p
            data-gsap="fade-up"
            className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto"
          >
            {t.description}
          </p>
        </div>

        {/* Steps */}
        <div
          data-gsap="stagger-children"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10"
        >
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative text-center md:text-left">
              {/* Connector line (desktop only) */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-amber-400/40 to-amber-400/10" />
              )}

              {/* Step number */}
              <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/20 mb-5">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
