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
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { extractErrorMessage } from "@/utils/functions/error";
import { useMagneticHover } from "@/hooks/utils/use-gsap-interactions";
import {
  LucideUser,
  LucideMail,
  LucideLock,
  LucideStore,
  LucideEye,
  LucideEyeOff,
  LucideLoader2,
  LucideArrowRight,
} from "lucide-react";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  business_name: z.string().optional(),
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  async function onSubmit(values: RegisterForm) {
    setLoading(true);
    setError(null);
    try {
      await api.post(AUTH_API.REGISTER, values);
      router.push("/login");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div data-auth className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start selling smarter with Apsara AI
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5">
          <Label htmlFor="full_name" className="text-sm font-medium">Full name</Label>
          <div className="group relative">
            <LucideUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="full_name"
              placeholder="Sophea Chan"
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("full_name")}
            />
          </div>
          {errors.full_name && (
            <p className="animate-shake text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div data-auth className="flex flex-col gap-1.5">
          <Label htmlFor="business_name" className="text-sm font-medium">
            Business name{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="group relative">
            <LucideStore className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="business_name"
              placeholder="Sophea Shop"
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("business_name")}
            />
          </div>
        </div>

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

        <div data-auth className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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

        <div data-auth ref={submitRef} className="">
          <Button
            type="submit"
            disabled={loading}
            className="group w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30"
          >
            {loading ? (
              <>
                <LucideLoader2 className="size-4 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p data-auth className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
