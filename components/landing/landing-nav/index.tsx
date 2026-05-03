"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LucideMenu,
  LucideX,
  LucideSparkles,
  LucideArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingNav() {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 shadow-sm shadow-amber-500/30">
            <LucideSparkles className="size-4 text-white" />
          </div>
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
              Features
            </Button>
          </a>
          <a href="#how-it-works">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              How it works
            </Button>
          </a>
        </div>

        {/* ── Desktop CTAs ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="rounded-full px-5 gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-sm shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
            >
              Get started
              <LucideArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* ── Mobile menu button ───────────────────────────────── */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <LucideX className="size-5" />
          ) : (
            <LucideMenu className="size-5" />
          )}
        </Button>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg px-4 py-4 space-y-1 animate-fade-up">
          <a href="#features" onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground"
            >
              Features
            </Button>
          </a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-muted-foreground"
            >
              How it works
            </Button>
          </a>
          <div className="pt-3 mt-2 border-t border-border/40 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full rounded-full">
                Sign in
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
