"use client";

import { useLanguageStore } from "@/stores/languages/language-store";
import { useEffect } from "react";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute("data-lang", language);
  }, [language]);

  return <>{children}</>;
}
