"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, fetchMe } = useAuthStore();
  const [checked, setChecked] = useState(false);

  // Send them back where they were headed once signed in, rather than dumping
  // everyone on the dashboard.
  const toLogin = useCallback(() => {
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  useEffect(() => {
    window.addEventListener("apsara:unauthorized", toLogin);
    return () => window.removeEventListener("apsara:unauthorized", toLogin);
  }, [toLogin]);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((ok) => {
      if (cancelled) return;
      setChecked(true);
      if (!ok) toLogin();
    });
    return () => {
      cancelled = true;
    };
    // Deliberately not keyed on `user`: the store action is stable, so this
    // revalidates once per effect setup without looping when it updates the
    // profile. React Strict Mode sets the effect up twice in development; the
    // first request is cancelled and the second must be allowed to complete.
  }, [fetchMe, toLogin]);

  if (!(checked && user)) {
    return (
      <div className="flex-1 space-y-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return <>{children}</>;
}
