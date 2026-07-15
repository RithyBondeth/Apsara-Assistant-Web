"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LucideLoader2, LucideUser, LucideCircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileHeader from "@/components/settings/profile-header";
import SectionCard from "@/components/settings/section-card";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useT } from "@/hooks/utils/use-translations";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  business_name: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsAccountPage() {
  // ── Translations
  const t = useT("settings");

  // ── API Integration
  const { user, loading, updateProfile, clearError } = useAuthStore();

  // ── All States
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: user?.full_name ?? "",
      business_name: user?.business_name ?? "",
    },
  });

  // ── Effects
  useEffect(() => clearError, [clearError]);

  // ── Methods
  async function onSubmit(values: ProfileForm) {
    setError(null);
    setSaved(false);
    const ok = await updateProfile(values);
    if (ok) setSaved(true);
    else setError(useAuthStore.getState().error);
  }

  // ── Render UI
  return (
    <>
      <ProfileHeader />

      <SectionCard icon={LucideUser} title={t.profile} description={t.profileDesc}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">{t.fullName}</Label>
              <Input id="full_name" {...form.register("full_name")} />
              {form.formState.errors.full_name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="business_name">{t.businessName}</Label>
              <Input
                id="business_name"
                placeholder={t.businessNamePlaceholder}
                {...form.register("business_name")}
              />
              <p className="text-xs text-muted-foreground">{t.businessNameHelp}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t.email}</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">{t.emailHelp}</p>
          </div>

          {error && (
            <p className="animate-shake rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600"
            >
              {loading && <LucideLoader2 className="size-4 animate-spin" />}
              {t.saveChanges}
            </Button>
            {saved && (
              <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                <LucideCircleCheck className="size-4" />
                {t.profileSaved}
              </p>
            )}
          </div>
        </form>
      </SectionCard>
    </>
  );
}
