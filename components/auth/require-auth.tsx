"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, fetchMe } = useAuthStore();
  const revalidated = useRef(false);
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
    if (revalidated.current) return;
    // Once per mount, guarded by a ref: fetchMe sets `user`, which this effect
    // would otherwise depend on and loop over.
    revalidated.current = true;

    let cancelled = false;
    fetchMe().then((ok) => {
      if (cancelled) return;
      setChecked(true);
      if (!ok) toLogin();
    });
    return () => {
      cancelled = true;
    };
    // Deliberately not keyed on `user`: this revalidates the session once per
    // app load. The persisted store can be stale — a profile changed on the
    // server or in another tab, most consequentially the shop's currency,
    // which decides how every price on screen is read.
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
