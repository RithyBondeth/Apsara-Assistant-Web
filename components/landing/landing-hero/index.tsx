import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideArrowRight, LucideChevronDown, LucideSparkles } from "lucide-react";

const STATS = [
  { value: "500+", label: "Sellers" },
  { value: "50K+", label: "Messages handled" },
  { value: "3", label: "Languages" },
];

export default function LandingHero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* ── Ambient background ──────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-20 h-[400px] w-[400px] rounded-full bg-amber-500/20 blur-[140px]" />
        <div className="absolute right-[-100px] top-[-60px] h-[500px] w-[500px] rounded-full bg-amber-600/10 blur-[160px]" />
        <div className="absolute right-[15%] bottom-[-100px] h-[400px] w-[400px] rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle,hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-8 pt-28 sm:pt-32 pb-20 text-center">
        <div className="flex flex-col items-center gap-6 stagger-list">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 backdrop-blur-sm">
            <LucideSparkles className="size-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              AI Sales Assistant for Cambodian Sellers
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.08]">
            Sell more.{" "}
            <br className="hidden sm:block" />
            Answer less. Let{" "}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Apsara
            </span>{" "}
            handle your{" "}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              customers.
            </span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground !leading-relaxed text-base sm:text-lg md:text-xl max-w-[640px]">
            Your AI-powered shop assistant that understands{" "}
            <span className="font-medium text-foreground">Khmer</span>,{" "}
            <span className="font-medium text-foreground">English</span>, and{" "}
            <span className="font-medium text-foreground">romanized Khmer</span>{" "}
            — replying to customers 24/7 on Facebook, Telegram, TikTok, and your website.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full px-8 gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
              >
                Start free
                <LucideArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full px-8 border-amber-300/50 hover:bg-amber-50 hover:border-amber-400/50 transition-all"
              >
                Sign in
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 sm:gap-8 pt-2">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6 sm:gap-8">
                {i > 0 && (
                  <div className="h-8 w-px bg-amber-300/30" />
                )}
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#features">
            <LucideChevronDown className="size-6 text-muted-foreground/40" />
          </a>
        </div>
      </div>
    </section>
  );
}
