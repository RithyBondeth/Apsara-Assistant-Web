"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/utils/languages/language-context";
import { useLanguageStore } from "@/stores/languages/language-store";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

/**
 * One tap between English and Khmer, anywhere in the app. The choice is
 * kept in the browser (cookie + store, as on the landing page) and also sent
 * to the API when signed in, so Telegram alerts arrive in the same language.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const language = useLanguage();
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const syncLanguage = useAuthStore((s) => s.syncLanguage);
  const t = useAppT("header");
  const c = useAppT("common");

  const next = language === "en" ? "km" : "en";
  const nextLabel = next === "en" ? c.english : c.khmer;

  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      aria-label={fmt(t.switchLanguage, { language: nextLabel })}
      title={fmt(t.switchLanguage, { language: nextLabel })}
      onClick={() => {
        setLanguage(next);
        syncLanguage(next);
      }}
    >
      <Languages />
      <span className="font-medium">{nextLabel}</span>
    </Button>
  );
}
