"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { extractErrorMessage } from "@/utils/functions/error";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useMagneticHover } from "@/hooks/utils/use-gsap-interactions";
import { useAuthFormAnimation } from "@/hooks/utils/use-gsap-auth";
import {
  LucideMail,
  LucideKeyRound,
  LucideLoader2,
  LucideArrowRight,
  LucideArrowLeft,
} from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const codeSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only digits"),
});

type EmailForm = z.infer<typeof emailSchema>;
type CodeForm = z.infer<typeof codeSchema>;

const RESEND_SECONDS = 30;

export default function LoginOtpPage() {
  const [email, setEmail] = useState<string | null>(null);

  return email ? (
    <VerifyCodeStep email={email} onBack={() => setEmail(null)} />
  ) : (
    <RequestCodeStep onSent={setEmail} />
  );
}

// ── Step 1: request a one-time code by email ────────────────────── ────────
// Each step runs its own [data-auth] cascade so remounting (switching
// steps) replays the entrance.
function RequestCodeStep({ onSent }: { onSent: (email: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);
  const cardRef = useAuthFormAnimation<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });

  async function onSubmit(values: EmailForm) {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_API.OTP_REQUEST, values);
      onSent(values.email);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={cardRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-auth className="flex flex-col gap-1 opacity-0">
        <h1 className="text-2xl font-bold tracking-tight">
          Sign in with a code
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a one-time code — no password needed
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="group relative">
            <LucideMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="email"
              type="email"
              placeholder="seller@example.com"
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="animate-shake text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {error && (
          <p className="animate-shake rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        <div data-auth ref={submitRef} className="opacity-0">
          <Button
            type="submit"
            disabled={loading}
            className="group w-full gap-2 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <LucideLoader2 className="size-4 animate-spin" />
                Sending code…
              </>
            ) : (
              <>
                Send code
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p
        data-auth
        className="text-center text-sm text-muted-foreground opacity-0"
      >
        Prefer your password?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ── Step 2: verify the emailed code ─────────────────────────────── ────────
function VerifyCodeStep({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const { loginWithOtp, loading, error, clearError } = useAuthStore();
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);
  const cardRef = useAuthFormAnimation<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeForm>({ resolver: zodResolver(codeSchema) });

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  async function onSubmit(values: CodeForm) {
    const ok = await loginWithOtp(email, values.code);
    if (ok) router.push("/dashboard");
  }

  async function resend() {
    setResending(true);
    clearError();
    try {
      await api.post(AUTH_API.OTP_REQUEST, { email });
      setResendIn(RESEND_SECONDS);
    } finally {
      setResending(false);
    }
  }

  return (
    <div ref={cardRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-auth className="flex flex-col gap-1 opacity-0">
        <h1 className="text-2xl font-bold tracking-tight">Enter your code</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="code" className="text-sm font-medium">
            One-time code
          </Label>
          <div className="group relative">
            <LucideKeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              className="pl-9 text-center text-lg font-semibold tracking-[0.5em] transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("code")}
            />
          </div>
          {errors.code && (
            <p className="animate-shake text-xs text-destructive">
              {errors.code.message}
            </p>
          )}
        </div>

        {error && (
          <p className="animate-shake rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        <div data-auth ref={submitRef} className="opacity-0">
          <Button
            type="submit"
            disabled={loading}
            className="group w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <LucideLoader2 className="size-4 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                Verify &amp; sign in
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div
        data-auth
        className="flex flex-col items-center gap-2 text-sm text-muted-foreground opacity-0"
      >
        <p>
          Didn&apos;t get it?{" "}
          {resendIn > 0 ? (
            <span>Resend in {resendIn}s</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors disabled:opacity-60"
            >
              {resending ? "Resending…" : "Resend code"}
            </button>
          )}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
        >
          <LucideArrowLeft className="size-4" />
          Use a different email
        </button>
      </div>
    </div>
  );
}
