"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideLoader2,
  LucideArrowRight,
  LucideArrowLeft,
  LucideShieldAlert,
} from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ResetPasswordForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const token = useSearchParams().get("token");
  // The prerendered HTML has no search params, so branching on the token
  // during hydration mismatches and wipes the card. Render nothing until
  // hydrated; each view then replays its own [data-auth] cascade.
  const hydrated = useSyncExternalStore(subscribeNoop, getTrue, getFalse);

  if (!hydrated) return null;
  return token ? <ResetForm token={token} /> : <InvalidLink />;
}

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

function InvalidLink() {
  const cardRef = useAuthFormAnimation<HTMLDivElement>();

  return (
    <div ref={cardRef} className="flex flex-col items-center gap-6 text-center">
      <div data-auth className="flex size-14 items-center justify-center rounded-full bg-destructive/10 opacity-0">
        <LucideShieldAlert className="size-7 text-destructive" />
      </div>
      <div data-auth className="flex flex-col gap-1 opacity-0">
        <h1 className="text-2xl font-bold tracking-tight">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">
          This link is missing or expired. Request a new one to reset your
          password.
        </p>
      </div>
      <Link
        data-auth
        href="/forgot-password"
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors opacity-0"
      >
        <LucideArrowLeft className="size-4" />
        Request a new link
      </Link>
    </div>
  );
}

function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);
  const cardRef = useAuthFormAnimation<HTMLDivElement>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(schema) });

  async function onSubmit(values: ResetPasswordForm) {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_API.RESET_PASSWORD, {
        token,
        new_password: values.password,
      });
      router.push("/login");
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
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="password" className="text-sm font-medium">New password</Label>
          <div className="group relative">
            <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="px-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? <LucideEyeOff className="size-4" /> : <LucideEye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="animate-shake text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm password</Label>
          <div className="group relative">
            <LucideLock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("confirm_password")}
            />
          </div>
          {errors.confirm_password && (
            <p className="animate-shake text-xs text-destructive">{errors.confirm_password.message}</p>
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
                Resetting…
              </>
            ) : (
              <>
                Reset password
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p data-auth className="text-center text-sm text-muted-foreground opacity-0">
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
