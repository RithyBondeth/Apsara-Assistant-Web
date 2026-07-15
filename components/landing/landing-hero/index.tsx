"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LucideArrowRight,
  LucideCheck,
  LucideChevronDown,
  LucideSparkles,
} from "lucide-react";
import { BrandMark } from "@/components/landing/brand-logo";
import { useGsapHeroAnimation } from "@/hooks/utils/use-gsap-animation";
import {
  useMagneticHover,
  useMouseParallax,
} from "@/hooks/utils/use-gsap-interactions";
import { useT } from "@/hooks/utils/use-translations";
import { useLanguage } from "@/components/utils/languages/language-context";

export default function LandingHero() {
  const heroRef = useGsapHeroAnimation<HTMLElement>();
  const parallaxRef = useMouseParallax<HTMLElement>(24);
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      heroRef.current = node;
      parallaxRef.current = node;
    },
    [heroRef, parallaxRef],
  );

  const startBtnRef = useMagneticHover<HTMLDivElement>();
  const signInBtnRef = useMagneticHover<HTMLDivElement>();

  const t = useT("hero");
  const language = useLanguage();

  return (
    <section
      ref={setSectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* ── Ambient background — orbs drift forever + follow the mouse ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          data-parallax="1"
          data-drift="1"
          className="absolute -left-32 top-20 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[140px]"
        />
        <div
          data-parallax="0.6"
          data-drift="1.4"
          className="absolute right-[-100px] top-[-60px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[160px]"
        />
        <div
          data-parallax="0.8"
          data-drift="0.8"
          className="absolute right-[15%] bottom-[-100px] h-[400px] w-[400px] rounded-full bg-blue-400/10 blur-[140px]"
        />
        <div className="absolute inset-0 opacity-[0.04] bg-dots" />
      </div>

      {/* ── Floating chat cards (desktop only) ──────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] hidden lg:block"
        aria-hidden="true"
      >
        {/* customer question — top left */}
        <div
          data-hero="float-card"
          data-parallax="1.6"
          className="absolute left-[6%] top-[24%] max-w-[220px] rounded-2xl rounded-bl-sm border border-border/60 bg-card/80 px-4 py-2.5 text-sm shadow-xl shadow-blue-500/10 backdrop-blur-md opacity-0"
        >
          {t.floatQ}
        </div>
        {/* AI answer — left, below */}
        <div
          data-hero="float-card"
          data-parallax="2.2"
          className="absolute left-[9%] top-[38%] max-w-[240px] rounded-2xl rounded-br-sm bg-linear-to-br from-blue-600 to-blue-500 px-4 py-2.5 text-sm text-white shadow-xl shadow-blue-500/30 opacity-0"
        >
          {t.floatA}
        </div>
        {/* order toast — top right */}
        <div
          data-hero="float-card"
          data-parallax="1.9"
          className="absolute right-[7%] top-[27%] flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm font-medium shadow-xl shadow-blue-500/10 backdrop-blur-md opacity-0"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <LucideCheck className="size-4" strokeWidth={2.5} />
          </span>
          {t.floatOrder}
        </div>
        {/* online status — right, below */}
        <div
          data-hero="float-card"
          data-parallax="1.3"
          className="absolute right-[10%] top-[44%] flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-xs font-medium text-muted-foreground shadow-lg shadow-blue-500/10 backdrop-blur-md opacity-0"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {t.floatOnline}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-8 pt-28 sm:pt-32 pb-20 text-center">
        <div className="flex flex-col items-center gap-6">
          {/* Badge */}
          <div
            data-hero="badge"
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 backdrop-blur-sm opacity-0"
          >
            <LucideSparkles className="size-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">{t.badge}</span>
          </div>

          {/* Heading — Khmer renders as natural two-line sentence */}
          <h1
            data-hero="heading"
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.15] opacity-0 perspective-midrange"
          >
            {language === "km" ? (
              <>
                {/* Line 1: លក់ច្រើន ឆ្លើយតបតិច */}
                <span className="block">{t.heading1}</span>
                {/* Line 2: ទុក [Apsara] ជួយ [អតិថិជនរបស់អ្នក] */}
                <span className="block">
                  {t.heading2}{" "}
                  <span className="text-shimmer bg-linear-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                    Apsara
                  </span>{" "}
                  {t.heading3}{" "}
                  <span className="text-shimmer bg-linear-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                    {t.heading4}
                  </span>
                </span>
              </>
            ) : (
              <>
                {t.heading1} <br className="hidden sm:block" />
                {t.heading2}{" "}
                <span className="text-shimmer bg-linear-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                  Apsara
                </span>{" "}
                {t.heading3}{" "}
                <span className="text-shimmer bg-linear-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                  {t.heading4}
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p
            data-hero="description"
            className="text-muted-foreground !leading-relaxed text-base sm:text-lg md:text-xl max-w-[640px] opacity-0"
          >
            {t.description}
          </p>

          {/* CTA buttons */}
          <div
            data-hero="cta"
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto opacity-0"
          >
            <div ref={startBtnRef} className="w-full sm:w-auto">
              <Link href="/register" className="block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  {t.startFree}
                  <LucideArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
            <div ref={signInBtnRef} className="w-full sm:w-auto">
              <Link href="/login" className="block w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-8 border-blue-300/50 hover:bg-blue-50 hover:border-blue-400/50 transition-all"
                >
                  {t.signIn}
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Mobile/tablet chat preview ──────────────────────────
              The floating cards above are desktop-only (they'd collide
              with the centred heading on small screens), so surface the
              same "Apsara in action" demo inline for < lg viewports. */}
          <div
            data-hero="preview"
            className="mt-4 w-full max-w-sm opacity-0 lg:hidden"
          >
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-xl shadow-blue-500/10 backdrop-blur-md">
              {/* Header — assistant identity + live status */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrandMark className="size-7" imgClassName="h-5" />
                  <span className="text-sm font-semibold">Apsara</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {t.floatOnline}
                </span>
              </div>

              {/* Conversation */}
              <div className="flex flex-col gap-2 text-left">
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border/60 bg-background/80 px-3.5 py-2 text-sm">
                    {t.floatQ}
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-linear-to-br from-blue-600 to-blue-500 px-3.5 py-2 text-sm text-white shadow-md shadow-blue-500/20">
                    {t.floatA}
                  </div>
                </div>
              </div>

              {/* Order confirmed toast */}
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <LucideCheck className="size-3.5" strokeWidth={2.5} />
                </span>
                {t.floatOrder}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          data-hero="scroll"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-0"
        >
          <a href="#features">
            <LucideChevronDown className="size-6 text-muted-foreground/40" />
          </a>
        </div>
      </div>
    </section>
  );
}
