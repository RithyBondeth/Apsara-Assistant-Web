"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { extractErrorMessage } from "@/utils/functions/error";
import { useMagneticHover } from "@/hooks/utils/use-gsap-interactions";
import { useAuthFormAnimation } from "@/hooks/utils/use-gsap-auth";
import {
  LucideMail,
  LucideLoader2,
  LucideArrowRight,
  LucideArrowLeft,
  LucideMailCheck,
} from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return sentTo ? (
    <SentConfirmation email={sentTo} onRetry={() => setSentTo(null)} />
  ) : (
    <RequestLinkStep onSent={setSentTo} />
  );
}

// Each step is its own component so remounting replays the [data-auth]
// cascade (the hook's entrance effect runs once per mount).
function RequestLinkStep({ onSent }: { onSent: (email: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);
  const cardRef = useAuthFormAnimation<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(schema) });

  async function onSubmit(values: ForgotPasswordForm) {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_API.FORGOT_PASSWORD, values);
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
      <div data-auth className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
            <p className="animate-shake text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <p className="animate-shake rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        <div data-auth ref={submitRef} className="">
          <Button
            type="submit"
            disabled={loading}
            className="group w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <LucideLoader2 className="size-4 animate-spin" />
                Sending link…
              </>
            ) : (
              <>
                Send reset link
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p data-auth className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
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

// Mounted after the card's entrance already ran, so it replays the
// [data-auth] cascade itself.
function SentConfirmation({ email, onRetry }: { email: string; onRetry: () => void }) {
  const ref = useAuthFormAnimation<HTMLDivElement>();

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 text-center">
      <div data-auth className="flex size-14 items-center justify-center rounded-full bg-blue-500/10">
        <LucideMailCheck className="size-7 text-blue-500" />
      </div>
      <div data-auth className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{email}</span>, we sent
          a link to reset your password.
        </p>
      </div>
      <p data-auth className="text-sm text-muted-foreground">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
        >
          Try again
        </button>
      </p>
      <Link
        data-auth
        href="/login"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
      >
        <LucideArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
}
