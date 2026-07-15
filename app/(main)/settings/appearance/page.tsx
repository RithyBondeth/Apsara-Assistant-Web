"use client";

import { LucidePalette } from "lucide-react";
import { Label } from "@/components/ui/label";
import SectionCard from "@/components/settings/section-card";
import ThemePicker from "@/components/settings/theme-picker";
import LanguagePicker from "@/components/settings/language-picker";
import { useT } from "@/hooks/utils/use-translations";

export default function SettingsAppearancePage() {
  const t = useT("settings");

  return (
    <SectionCard
      icon={LucidePalette}
      title={t.appearance}
      description={t.appearanceDesc}
      accent="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>{t.language}</Label>
          <LanguagePicker />
          <p className="text-xs text-muted-foreground">{t.languageHelp}</p>
        </div>

        <div className="space-y-2 border-t border-border pt-5">
          <Label>{t.theme}</Label>
          <ThemePicker />
          <p className="text-xs text-muted-foreground">{t.themeHelp}</p>
        </div>
      </div>
    </SectionCard>
  );
}
