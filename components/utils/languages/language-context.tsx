"use client";

import { createContext, useContext } from "react";
import type { TLanguage } from "@/stores/languages/language-store";

export const LanguageContext = createContext<TLanguage>("en");

export function useLanguage(): TLanguage {
  return useContext(LanguageContext);
}
