"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideArrowRight } from "lucide-react";
import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useMagneticHover } from "@/hooks/utils/use-gsap-interactions";
import { useT } from "@/hooks/utils/use-translations";

export default function LandingCta() {
  const ctaRef = useGsapScrollAnimation<HTMLElement>();
  const startBtnRef = useMagneticHover<HTMLDivElement>();
  const t = useT("cta");

  return (
    <section
      ref={ctaRef}
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
    >
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />
      {/* Center glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[160px]" />
      </div>

      <div
        data-gsap="scale-up"
        className="aurora-border relative z-10 mx-auto max-w-3xl rounded-4xl border border-border/60 bg-card/40 backdrop-blur-sm px-6 py-14 text-center sm:px-12 sm:py-20"
      >
        <h2
          data-gsap="split-words"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 leading-[1.15]! perspective-midrange"
        >
          {t.heading1}{" "}
          <span className="text-shimmer bg-linear-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent">
            {t.heading2}
          </span>
          ?
        </h2>

        <p
          data-gsap="fade-up"
          className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8"
        >
          {t.description}
        </p>

        <div
          data-gsap="fade-up"
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <div ref={startBtnRef} className="w-full sm:w-auto">
            <Link href="/register" className="block w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full px-10 gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                {t.startFree}
                <LucideArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full px-10 border-blue-300/50 hover:bg-blue-50 hover:border-blue-400/50 transition-all"
            >
              {t.signIn}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
