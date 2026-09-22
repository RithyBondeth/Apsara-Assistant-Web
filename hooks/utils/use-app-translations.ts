"use client";

import { useLanguage } from "@/components/utils/languages/language-context";
import en from "@/language/app.en.json";
import km from "@/language/app.km.json";

// The signed-in app's strings live apart from the landing page's: the two are
// edited by different people at different times, and the landing copy is
// marketing while this is a tool a seller reads all day.
const messages = { en, km } as const;

export type AppMessages = typeof en;
export type AppSection = keyof AppMessages;

export function useAppT<S extends AppSection>(section: S): AppMessages[S] {
  const language = useLanguage();
  return messages[language][section] as AppMessages[S];
}

/** Fill `{name}` placeholders. Missing values are left visible rather than
 *  swallowed, so a typo shows up in the UI instead of as a blank. */
export function fmt(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value == null ? match : String(value);
  });
}

/** Singular or plural by count, from a "one|other" template. */
export function plural(template: string, count: number): string {
  const [one, other] = template.split("|");
  return fmt(count === 1 ? one : (other ?? one), { count });
}
