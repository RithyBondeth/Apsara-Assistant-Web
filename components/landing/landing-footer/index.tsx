import Link from "next/link";
import { LucideSparkles } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-card/30">
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle,hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 shadow-sm shadow-amber-500/20">
                <LucideSparkles className="size-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">Apsara Assistant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered sales assistant for Cambodian online sellers. Handles your customer conversations in Khmer, English, and romanized Khmer — 24/7.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 sm:gap-12 md:gap-16">
            {/* Platform */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">Platform</span>
              <Link href="/login">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Sign in
                </p>
              </Link>
              <Link href="/register">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Get started
                </p>
              </Link>
              <Link href="/dashboard">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Dashboard
                </p>
              </Link>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">Product</span>
              <a href="#features">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Features
                </p>
              </a>
              <a href="#how-it-works">
                <p className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  How it works
                </p>
              </a>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">Company</span>
              <p className="text-xs text-muted-foreground">Privacy Policy</p>
              <p className="text-xs text-muted-foreground">Terms of Service</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Apsara Assistant. Built for Cambodian sellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
