"use client";

import { useEffect } from "react";
import { useLanguageStore, type TLanguage } from "@/stores/languages/language-store";
import { useHydrated } from "@/hooks/utils/use-hydrated";
import { LanguageContext } from "./language-context";

export function LanguageProviderClient({
  children,
  defaultLanguage,
}: {
  children: React.ReactNode;
  defaultLanguage: TLanguage;
}) {
  const { language, isHydrated, setLanguage } = useLanguageStore();
  const mounted = useHydrated();

  // Seeds the store from the server-read cookie the first time. This one stays
  // an effect: it writes to an external store, which is what effects are for.
  useEffect(() => {
    if (!isHydrated) setLanguage(defaultLanguage);
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
