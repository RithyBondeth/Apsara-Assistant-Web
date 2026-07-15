"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LucideLoader2, LucideLock, LucideCircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/ui/password-input";
import SectionCard from "@/components/settings/section-card";
import PasswordStrength from "@/components/settings/password-strength";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useT } from "@/hooks/utils/use-translations";

// The API enforces min 8 on the new password (schemas/user.py PasswordChange).
const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsSecurityPage() {
  // ── Translations
  const t = useT("settings");

  // ── API Integration
  const { loading, changePassword, clearError } = useAuthStore();

  // ── All States
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  // useWatch rather than form.watch() — the latter returns a fresh function each
  // render and can't be memoized safely.
  const newPassword = useWatch({ control: form.control, name: "new_password" }) ?? "";

  // ── Effects
  useEffect(() => clearError, [clearError]);

  // ── Methods
  async function onSubmit(values: PasswordForm) {
    setError(null);
    setSaved(false);
    const ok = await changePassword(values.current_password, values.new_password);
    if (ok) {
      setSaved(true);
      form.reset();
    } else {
      setError(useAuthStore.getState().error);
    }
  }

  // ── Render UI
  return (
    <SectionCard
      icon={LucideLock}
      title={t.changePassword}
      description={t.passwordDesc}
      accent="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current_password">{t.currentPassword}</Label>
          <PasswordInput
            id="current_password"
            autoComplete="current-password"
            {...form.register("current_password")}
          />
          {form.formState.errors.current_password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.current_password.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new_password">{t.newPassword}</Label>
            <PasswordInput
              id="new_password"
              autoComplete="new-password"
              {...form.register("new_password")}
            />
            {form.formState.errors.new_password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.new_password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">{t.confirmPassword}</Label>
            <PasswordInput
              id="confirm_password"
              autoComplete="new-password"
              {...form.register("confirm_password")}
            />
            {form.formState.errors.confirm_password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>

        <PasswordStrength password={newPassword} />

        {error && (
          <p className="animate-shake rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Button type="submit" size="sm" variant="outline" disabled={loading} className="gap-1.5">
            {loading && <LucideLoader2 className="size-4 animate-spin" />}
            {t.updatePassword}
          </Button>
          {saved && (
            <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500">
              <LucideCircleCheck className="size-4" />
              {t.passwordUpdated}
            </p>
          )}
        </div>
      </form>
    </SectionCard>
  );
}
