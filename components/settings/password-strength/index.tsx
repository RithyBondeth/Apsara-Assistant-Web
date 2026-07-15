"use client";

import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

/**
 * Rough 0–4 heuristic — length carries the most weight, then character
 * variety. This is guidance for the seller, not a security control; the API
 * enforces the real minimum (8 chars).
 */
export function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  // Anything typed scores at least "Weak" — a short password meets none of the
  // criteria above, and showing an empty label with no filled bars reads as
  // broken rather than as bad news.
  return Math.min(Math.max(score, 1), 4);
}

const BAR_STYLES = [
  "bg-muted",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
];

const TEXT_STYLES = [
  "text-muted-foreground",
  "text-red-500",
  "text-orange-500",
  "text-yellow-600 dark:text-yellow-500",
  "text-green-600 dark:text-green-500",
];

export default function PasswordStrength({ password }: { password: string }) {
  const t = useT("settings");
  const score = scorePassword(password);

  if (!password) return null;

  const labels = ["", t.strengthWeak, t.strengthFair, t.strengthGood, t.strengthStrong];

  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex gap-1" role="presentation">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              step <= score ? BAR_STYLES[score] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t.passwordStrength}:{" "}
        <span className={cn("font-medium", TEXT_STYLES[score])}>{labels[score]}</span>
      </p>
    </div>
  );
}
