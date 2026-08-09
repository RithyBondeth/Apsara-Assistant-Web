"use client";

import { useEffect, useSyncExternalStore } from "react";
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

  useEffect(() => {
    if (!hydrated) return;

    // Send them back where they were headed once signed in, rather than
    // dumping everyone on the dashboard.
    const toLogin = () =>
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);

    if (!hasToken()) {
      toLogin();
      return;
    }
    if (user) return;

    // A token with no user means a fresh tab or a cleared store. Validating it
    // now surfaces an expired session as a redirect instead of as a burst of
    // 401s from whichever screen loaded first.
    let cancelled = false;
    fetchMe().then(() => {
      // fetchMe drops the token when it fails, but it leaves `user` at null —
      // the value it already held — so nothing here re-renders. Re-check the
      // token directly, or an expired session sits on the skeleton forever.
      if (!cancelled && !hasToken()) toLogin();
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, user, pathname, router, fetchMe]);

  const authenticated = hydrated && user && hasToken();

  if (!authenticated) {
    return (
      <div className="flex-1 space-y-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return <>{children}</>;
}
