import Link from "next/link";
import { BrandLogo } from "@/components/landing/brand-logo";
import AuthPanel from "@/components/auth/auth-panel";
import AuthShowcase from "@/components/auth/auth-showcase";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* ── Left: form panel ──────────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-12 md:w-1/2 lg:px-16">
        {/* Ambient backdrop behind the form card */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-dots" />
          <div className="absolute -top-32 -left-32 size-96 rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-24 size-80 rounded-full bg-blue-400/10 blur-[110px]" />
        </div>

        {/* Back to home */}
        <Link
          href="/"
          aria-label="Apsara Assistant home"
          className="absolute top-6 left-6 z-10 transition-opacity hover:opacity-80"
        >
          <BrandLogo size="sm" />
        </Link>

        <div className="relative z-10 flex w-full justify-center">
          <AuthPanel>{children}</AuthPanel>
        </div>
      </div>

      {/* ── Right: animated brand showcase ────────────────────────── */}
      <AuthShowcase />
    </div>
  );
}
