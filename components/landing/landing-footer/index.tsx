"use client";

import Link from "next/link";
import { LucideSparkles } from "lucide-react";
import { useT } from "@/hooks/utils/use-translations";

export default function LandingFooter() {
  const t = useT("footer");

  return (
    <footer className="relative border-t border-border/60 bg-card/30">
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-dots" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-sm shadow-blue-500/20">
                <LucideSparkles className="size-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">Apsara Assistant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 sm:gap-12 md:gap-16">
            {/* Platform */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">{t.platform}</span>
              <Link href="/login">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t.signIn}</p>
              </Link>
              <Link href="/register">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t.getStarted}</p>
              </Link>
              <Link href="/dashboard">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t.dashboard}</p>
              </Link>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">{t.product}</span>
              <a href="#features">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t.features}</p>
              </a>
              <a href="#how-it-works">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t.howItWorks}</p>
              </a>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">{t.company}</span>
              <p className="text-xs text-muted-foreground">{t.privacy}</p>
              <p className="text-xs text-muted-foreground">{t.terms}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Apsara Assistant. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
