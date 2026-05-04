"use client";

import { useEffect, useState } from "react";
import { useLanguageStore, type TLanguage } from "@/stores/languages/language-store";
import { LanguageContext } from "./language-context";

export function LanguageProviderClient({
  children,
  defaultLanguage,
}: {
  children: React.ReactNode;
  defaultLanguage: TLanguage;
}) {
  const { language, isHydrated, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isHydrated) setLanguage(defaultLanguage);
    setMounted(true);
  }, [defaultLanguage, isHydrated, setLanguage]);

  // Before hydration use the server-read cookie value — eliminates the flash
  const activeLanguage: TLanguage = mounted && isHydrated ? language : defaultLanguage;

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
    document.documentElement.setAttribute("data-lang", activeLanguage);
  }, [activeLanguage]);

  return (
    <LanguageContext.Provider value={activeLanguage}>
      {children}
    </LanguageContext.Provider>
  );
}
