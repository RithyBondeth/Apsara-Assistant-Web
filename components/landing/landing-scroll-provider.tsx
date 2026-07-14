"use client";

import { useLenis } from "@/hooks/utils/use-lenis";

export function LandingScrollProvider({ children }: { children: React.ReactNode }) {
  useLenis();
  return <>{children}</>;
}
