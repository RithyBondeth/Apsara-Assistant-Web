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
      {/* Side by side on wide screens; stacked (with a divider) below xl. */}
      <div className="grid gap-5 xl:grid-cols-2 xl:gap-8">
        <div className="space-y-2">
          <Label>{t.language}</Label>
          <LanguagePicker />
          <p className="text-xs text-muted-foreground">{t.languageHelp}</p>
        </div>

        <div className="space-y-2 border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <Label>{t.theme}</Label>
          <ThemePicker />
          <p className="text-xs text-muted-foreground">{t.themeHelp}</p>
        </div>
      </div>
    </SectionCard>
  );
}
