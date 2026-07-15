"use client";

import { useLanguage } from "@/components/utils/languages/language-context";
import en from "@/language/en.json";
import km from "@/language/km.json";

const messages = { en, km } as const;

type Messages = typeof en;
type Section = keyof Messages;

export function useT<S extends Section>(section: S): Messages[S] {
  const language = useLanguage();
  return messages[language][section] as Messages[S];
}
