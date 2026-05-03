"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideArrowRight } from "lucide-react";
import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";

export default function LandingCta() {
  const ctaRef = useGsapScrollAnimation<HTMLElement>();

  return (
    <section ref={ctaRef} className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />
      {/* Center glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber-500/15 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center px-4 sm:px-6">
        <h2
          data-gsap="split-words"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 !leading-[1.15] [perspective:800px]"
        >
          Ready to sell{" "}
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
            smarter
          </span>
          ?
        </h2>

        <p
          data-gsap="fade-up"
          className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8"
        >
          Join hundreds of Cambodian sellers using Apsara to handle customer messages automatically — in Khmer, English, and romanized Khmer.
        </p>

        <div
          data-gsap="fade-up"
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full px-10 gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
            >
              Start free
              <LucideArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full px-10 border-amber-300/50 hover:bg-amber-50 hover:border-amber-400/50 transition-all"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
