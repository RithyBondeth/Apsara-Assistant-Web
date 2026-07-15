"use client";

import { LucideCalendar, LucideStore } from "lucide-react";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/hooks/utils/use-translations";
import { formatDate } from "@/utils/functions/date";

export default function ProfileHeader() {
  const t = useT("settings");
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Skeleton className="h-[68px] rounded-xl" />;
  }

  const initial = user.full_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 text-base font-semibold text-white">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">{user.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>

      {/* Metadata sits inline on the right rather than stretching the banner —
          it's reference detail, not the headline. */}
      <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
        <span className="flex items-center gap-1.5">
          <LucideStore className="size-3.5 shrink-0" />
          <span className={user.business_name ? "" : "italic opacity-70"}>
            {user.business_name || t.noBusinessName}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <LucideCalendar className="size-3.5 shrink-0" />
          {t.memberSince} {formatDate(user.created_at)}
        </span>
      </div>
    </div>
  );
}
