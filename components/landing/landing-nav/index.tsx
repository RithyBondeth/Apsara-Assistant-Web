"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LucideMenu,
  LucideX,
  LucideArrowRight,
  LucideSun,
  LucideMoon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useLanguageStore } from "@/stores/languages/language-store";
import { useLanguage } from "@/components/utils/languages/language-context";
import { useT } from "@/hooks/utils/use-translations";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="size-8" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <LucideSun className="size-4" />
      ) : (
        <LucideMoon className="size-4" />
      )}
    </Button>
  );
}

function LanguageToggle() {
  const language = useLanguage();           // context: server-safe, no flash
  const { setLanguage } = useLanguageStore(); // Zustand: only for writing
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-8" />;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5"
      onClick={() => setLanguage(language === "en" ? "km" : "en")}
      aria-label="Toggle language"
    >
      <span
        className={cn(
          "transition-all",
          language === "en" ? "text-foreground" : "text-muted-foreground/50",
        )}
      >
        EN
      </span>
      <span className="text-muted-foreground/30">|</span>
      <span
        className={cn(
          "transition-all",
          language === "km" ? "text-foreground" : "text-muted-foreground/50",
        )}
      >
        ខ្មែរ
      </span>
    </Button>
  );
}

export default function LandingNav() {
  const t = useT("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-lg border-b border-border/40 shadow-sm"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.svg"
            alt="Apsara logo"
            width={28}
            height={42}
            className="h-9 w-auto"
            priority
          />
          <span className="font-bold text-base tracking-tight">Apsara</span>
          <span className="hidden sm:inline text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Assistant
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          <a href="#features">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t.features}
            </Button>
          </a>
          <a href="#how-it-works">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t.howItWorks}
            </Button>
          </a>
        </div>

        {/* ── Desktop CTAs ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t.signIn}
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="rounded-full px-5 gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-sm shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
            >
              {t.getStarted}
              <LucideArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* ── Mobile: toggles + menu ────────────────────────────── */}
        <div className="md:hidden flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <LucideX className="size-5" />
            ) : (
              <LucideMenu className="size-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg px-4 py-4 space-y-1 animate-fade-up">
          <a href="#features" onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground"
            >
              {t.features}
            </Button>
          </a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground"
            >
              {t.howItWorks}
            </Button>
          </a>
          <div className="pt-3 mt-2 border-t border-border/40 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full rounded-full">
                {t.signIn}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white">
                {t.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
