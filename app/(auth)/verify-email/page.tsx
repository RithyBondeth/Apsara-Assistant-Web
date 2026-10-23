"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LucideCircleCheck, LucideLoader2, LucideShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ResendVerification from "@/components/auth/resend-verification";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { useAppT } from "@/hooks/utils/use-app-translations";
import { cn } from "@/lib/utils";

// useSearchParams needs a Suspense boundary on a prerendered page.
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

type TState = "checking" | "done" | "failed";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  // The prerendered HTML has no search params, so branching on the token
  // during hydration mismatches and wipes the card — as on reset-password.
  const hydrated = useSyncExternalStore(subscribeNoop, getTrue, getFalse);
  if (!hydrated) return null;
  return <VerifyEmailResult token={token} />;
}

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

function VerifyEmailResult({ token }: { token: string | null }) {
  const t = useAppT("auth").verify;
  const [state, setState] = useState<TState>(token ? "checking" : "failed");
  // The link is single-use: a second request (React's development double
  // effect, or a re-render) would find it spent and report failure.
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (!token || sentFor.current === token) return;
    sentFor.current = token;
    api.post(AUTH_API.VERIFY_EMAIL, { token })
      .then(() => setState("done"))
      .catch(() => setState("failed"));
  }, [token]);

  if (state === "checking") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <LucideLoader2 className="size-7 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">{t.checking}</p>
      </div>
    );
  }

  const done = state === "done";
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div data-auth className={cn("flex size-14 items-center justify-center rounded-full opacity-0",
                                   done ? "bg-emerald-500/10" : "bg-destructive/10")}>
        {done
          ? <LucideCircleCheck className="size-7 text-emerald-600" />
          : <LucideShieldAlert className="size-7 text-destructive" />}
      </div>
      <div data-auth className="flex flex-col gap-1 opacity-0">
        <h1 className="text-2xl font-bold tracking-tight">{done ? t.doneTitle : t.failedTitle}</h1>
        <p className="text-sm text-muted-foreground">{done ? t.doneBody : t.failedBody}</p>
      </div>
      <div data-auth className="w-full opacity-0">
        {done ? (
          <Link href="/login" className={cn(buttonVariants(), "w-full rounded-full")}>{t.signIn}</Link>
        ) : (
          <ResendVerification label={t.send} sentText={t.sent} />
        )}
      </div>
    </div>
  );
}
