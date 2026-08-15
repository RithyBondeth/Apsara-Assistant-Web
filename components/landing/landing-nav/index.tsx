"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/landing/brand-logo";
import {
  LucideMenu,
  LucideX,
  LucideArrowRight,
  LucideSun,
  LucideMoon,
  LucideChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useLanguageStore } from "@/stores/languages/language-store";
import { useLanguage } from "@/components/utils/languages/language-context";
import { useT } from "@/hooks/utils/use-translations";
import { useHydrated } from "@/hooks/utils/use-hydrated";

/* ── Theme toggle ─────────────────────────────────────────────────────────── */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  // The resolved theme is unknowable on the server, so hold the space until
  // hydration rather than render the wrong icon and swap it.
  if (!hydrated) return <div className="size-8" />;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <LucideSun
        className={cn(
          "absolute size-4 transition-all duration-300",
          resolvedTheme === "dark"
            ? "opacity-100 rotate-0"
            : "opacity-0 rotate-90",
        )}
      />
      <LucideMoon
        className={cn(
          "absolute size-4 transition-all duration-300",
          resolvedTheme === "dark"
            ? "opacity-0 -rotate-90"
            : "opacity-100 rotate-0",
        )}
      />
    </button>
  );
}

/* ── Language toggle ──────────────────────────────────────────────────────── */
function LanguageToggle({ className }: { className?: string }) {
  const language = useLanguage();
  const { setLanguage } = useLanguageStore();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-7 w-[72px]" />;

  return (
    <div
      className={cn(
        "relative flex items-center gap-0.5 rounded-full bg-muted p-0.5",
        className,
      )}
    >
      {/* sliding pill indicator */}
      <span
        className={cn(
          "absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-background shadow-sm transition-all duration-200",
          language === "km" ? "left-[calc(50%+1px)]" : "left-0.5",
        )}
      />
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "relative z-10 px-2.5 py-1 text-xs font-semibold rounded-full transition-colors duration-200",
          language === "en" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("km")}
        className={cn(
          "relative z-10 px-2.5 py-1 text-xs font-semibold rounded-full transition-colors duration-200",
          language === "km" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        ខ្មែរ
      </button>
    </div>
  );
}

/* ── Nav link ─────────────────────────────────────────────────────────────── */
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group relative px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="absolute inset-0 rounded-full bg-muted opacity-0 transition-opacity group-hover:opacity-100" />
      <span className="relative">{children}</span>
    </a>
  );
}

/* ── Main nav ─────────────────────────────────────────────────────────────── */
export default function LandingNav() {
  const t = useT("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);

  // Single scroll listener drives both the "scrolled" threshold (glassmorphism
  // backdrop) and the top progress rail — keeping them on one source avoids
  // two independent listeners drifting out of sync with Lenis-driven scroll.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${pct})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm shadow-black/[0.03]"
          : "bg-transparent",
      )}
    >
      {/* ── Top gradient accent line ─────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      {/* ── Scroll-progress rail ─────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
        <span
          ref={progressRef}
          className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"
        />
      </div>

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link
          href="/"
          aria-label="Apsara Assistant home"
          className="shrink-0 rounded-full transition-opacity hover:opacity-80"
        >
          <BrandLogo priority />
        </Link>

        {/* ── Desktop centre links ──────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          <NavLink href="#features">{t.features}</NavLink>
          <NavLink href="#how-it-works">{t.howItWorks}</NavLink>
        </div>

        {/* ── Desktop right controls ────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <ThemeToggle />

          <div className="mx-1 h-4 w-px bg-border" />

          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground rounded-full px-4"
            >
              {t.signIn}
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="rounded-full px-5 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              {t.getStarted}
              <LucideArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* ── Mobile: right controls ────────────────────────────── */}
        <div className="md:hidden flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LucideMenu
              className={cn(
                "absolute size-4.5 transition-all duration-200",
                open
                  ? "opacity-0 rotate-45 scale-50"
                  : "opacity-100 rotate-0 scale-100",
              )}
            />
            <LucideX
              className={cn(
                "absolute size-4.5 transition-all duration-200",
                open
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-45 scale-50",
              )}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 pb-5 pt-3 space-y-1">
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {t.features}
            <LucideChevronRight className="size-4 opacity-40" />
          </a>
          <a
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {t.howItWorks}
            <LucideChevronRight className="size-4 opacity-40" />
          </a>

          <div className="pt-3 mt-1 border-t border-border/50 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="w-full rounded-full font-medium"
              >
                {t.signIn}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                {t.getStarted}
                <LucideArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
