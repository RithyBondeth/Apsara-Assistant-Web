"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LucideLoader2 } from "lucide-react";
import { useAuthStore } from "@/stores/apis/auth/auth.store";

/**
 * Gates the authenticated app shell.
 *
 * The JWT lives in localStorage, which is unreadable from Proxy (it runs on the
 * server), so this check has to happen on the client. It is a UX guard, not a
 * security boundary — every endpoint behind it is enforced by the API's own
 * `get_current_user`.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!localStorage.getItem("access_token")) {
        router.replace("/login");
        return;
      }

      // `user` is persisted to localStorage, but the token it came with may have
      // expired server-side since the last visit, so revalidate before trusting
      // it. fetchMe clears the token on failure; read the store afterwards
      // rather than the closed-over value.
      await fetchMe();
      if (cancelled) return;

      if (!useAuthStore.getState().user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [fetchMe, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LucideLoader2 className="size-5 animate-spin text-muted-foreground" />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
