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
import { AppMessages, useAppT } from "@/hooks/utils/use-app-translations";

function buildSchema(t: AppMessages["auth"]) {
  return z.object({
    full_name: z.string().min(2, t.nameMin2),
    email: z.string().email(t.invalidEmail),
    password: z.string().min(6, t.passwordMin6),
    business_name: z.string().optional(),
  });
}

type RegisterForm = z.infer<ReturnType<typeof buildSchema>>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const submitRef = useMagneticHover<HTMLDivElement>(0.25);
  const a = useAppT("auth");
  const t = a.register;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(buildSchema(a)) });

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
      <div data-auth className="flex flex-col gap-1 opacity-0">
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="full_name" className="text-sm font-medium">{t.fullName}</Label>
          <div className="group relative">
            <LucideUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="full_name"
              placeholder={t.namePlaceholder}
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("full_name")}
            />
          </div>
          {errors.full_name && (
            <p className="animate-shake text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="business_name" className="text-sm font-medium">
            {t.businessName}{" "}
            <span className="text-muted-foreground font-normal">{t.optional}</span>
          </Label>
          <div className="group relative">
            <LucideStore className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="business_name"
              placeholder={t.businessPlaceholder}
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("business_name")}
            />
          </div>
        </div>

        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="email" className="text-sm font-medium">{a.email}</Label>
          <div className="group relative">
            <LucideMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 transition-colors group-focus-within:text-blue-500" />
            <Input
              id="email"
              type="email"
              placeholder={a.emailPlaceholder}
              className="pl-9 transition-shadow focus-visible:shadow-md focus-visible:shadow-blue-500/10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="animate-shake text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div data-auth className="flex flex-col gap-1.5 opacity-0">
          <Label htmlFor="password" className="text-sm font-medium">{a.password}</Label>
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
              aria-label={showPassword ? a.hidePassword : a.showPassword}
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
                {t.creating}
              </>
            ) : (
              <>
                {t.create}
                <LucideArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer */}
      <p data-auth className="text-center text-sm text-muted-foreground opacity-0">
        {t.haveAccount}{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
        >
          {a.signIn}
        </Link>
      </p>
    </div>
  );
}
