import Image from "next/image";
import Link from "next/link";
import { LucideMessageCircle, LucideShoppingBag, LucideUsers } from "lucide-react";

const HIGHLIGHTS = [
  { icon: LucideMessageCircle, text: "Replies in Khmer, English & romanized Khmer" },
  { icon: LucideShoppingBag, text: "Knows your entire product catalog automatically" },
  { icon: LucideUsers, text: "Handles customers 24/7 on every platform" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* ── Left: form panel ──────────────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 md:w-1/2 lg:px-16">
        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Image src="/logo.svg" alt="Apsara logo" width={20} height={30} className="h-7 w-auto" />
          <span className="font-medium">Apsara</span>
        </Link>

        <div className="w-full max-w-sm animate-page-in">{children}</div>
      </div>

      {/* ── Right: amber poster panel ─────────────────────────────── */}
      <div className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-white/10" />
        <div className="absolute top-1/4 -left-10 size-36 rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-1/3 right-12 size-24 rounded-full bg-white/[0.08]" />
        <div className="absolute top-12 left-1/3 size-14 rounded-full bg-white/[0.06]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center text-white">
          {/* Logo mark */}
          <div className="animate-float drop-shadow-xl">
            <Image src="/logo.svg" alt="Apsara logo" width={72} height={108} className="h-28 w-auto" />
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Your AI sales assistant
              <br />
              speaks Khmer
            </h2>
            <p className="text-sm text-white/80 max-w-xs leading-relaxed">
              Apsara handles customer messages automatically so you can focus on what matters — growing your business.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.text}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm border border-white/10"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <h.icon className="size-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-white/90 text-left leading-snug">
                  {h.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
