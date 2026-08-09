"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

// The token lives in localStorage, which the server cannot read — so this gate
// is necessarily client-side and cannot run during SSR. Branching on it before
// hydration would mismatch the prerendered HTML, so we render a placeholder
// until mounted, matching the pattern in the reset-password screen.
const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

function hasToken() {
  return Boolean(localStorage.getItem("access_token"));
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(subscribeNoop, getTrue, getFalse);
  const { user, fetchMe } = useAuthStore();
  const revalidated = useRef(false);

  // Send them back where they were headed once signed in, rather than dumping
  // everyone on the dashboard.
  const toLogin = useCallback(() => {
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasToken()) toLogin();
  }, [hydrated, user, toLogin]);

  useEffect(() => {
    if (!hydrated || revalidated.current || !hasToken()) return;
    // Once per mount, guarded by a ref: fetchMe sets `user`, which this effect
    // would otherwise depend on and loop over.
    revalidated.current = true;

    let cancelled = false;
    fetchMe().then(() => {
      // fetchMe drops the token when it fails but leaves `user` at the value it
      // already held, so a failure may not re-render anything. Re-check the
      // token directly, or an expired session sits on the skeleton forever.
      if (!cancelled && !hasToken()) toLogin();
    });
    return () => {
      cancelled = true;
    };
    // Deliberately not keyed on `user`: this revalidates the session once per
    // app load. The persisted store can be stale — a profile changed on the
    // server or in another tab, most consequentially the shop's currency,
    // which decides how every price on screen is read.
  }, [hydrated, fetchMe, toLogin]);

  if (!(hydrated && user && hasToken())) {
    return (
      <div className="flex-1 space-y-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return <>{children}</>;
}
