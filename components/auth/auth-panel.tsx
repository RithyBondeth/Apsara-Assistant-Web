"use client";

import { usePathname } from "next/navigation";
import { useAuthFormAnimation } from "@/hooks/utils/use-gsap-auth";

/**
 * Client shell for the auth form column. Keyed by pathname so navigating
 * between /login and /register fully remounts the card and replays the
 * GSAP cascade (elements tagged [data-auth] rise in with a blur settle).
 */
export default function AuthPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return <AnimatedCard key={pathname}>{children}</AnimatedCard>;
}

function AnimatedCard({ children }: { children: React.ReactNode }) {
  const ref = useAuthFormAnimation<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="aurora-border w-full max-w-sm rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-sm sm:p-8"
    >
      {children}
    </div>
  );
}
