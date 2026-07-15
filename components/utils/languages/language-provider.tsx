import { cookies } from "next/headers";
import { LanguageProviderClient } from "./language-provider-client";
import type { TLanguage } from "@/stores/languages/language-store";

/**
 * Server component — reads the "language" cookie so the initial render
 * already has the correct locale, preventing the EN → KM flash on reload.
 */
export async function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const language = (cookieStore.get("language")?.value ?? "en") as TLanguage;

  return (
    <LanguageProviderClient defaultLanguage={language}>
      {children}
    </LanguageProviderClient>
  );
}
