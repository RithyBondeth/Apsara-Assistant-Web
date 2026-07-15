"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/apis/auth/auth.store";
import { useMagneticHover } from "@/hooks/utils/use-gsap-interactions";
import { LucideMail, LucideLock, LucideEye, LucideEyeOff, LucideLoader2, LucideArrowRight } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  async function onSubmit(values: LoginForm) {
    const ok = await login(values.email, values.password);
    if (ok) router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div data-auth className="flex flex-col gap-1 opacity-0">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Apsara account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5 opacity-0">
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

        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
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
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p data-auth className="text-center text-sm text-muted-foreground opacity-0">
        <Link
          href="/login-otp"
          className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
        >
          Sign in with a one-time code
        </Link>
      </p>
      <p data-auth className="-mt-3 text-center text-sm text-muted-foreground opacity-0">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
        >
          Register free
        </Link>
      </p>
    </div>
  );
}
