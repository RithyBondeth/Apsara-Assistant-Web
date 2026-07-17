"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORMS } from "@/utils/constants/platforms.constant";
import { useT } from "@/hooks/utils/use-translations";
import { ICustomerFormProps, CustomerFormValues } from "./props";

/** Built per-render so validation messages follow the active language. */
function buildSchema(t: ReturnType<typeof useT<"customers">>) {
  return z.object({
    name: z.string().min(1, t.errName),
    phone: z.string().optional(),
    email: z.string().email(t.errEmail).optional().or(z.literal("")),
    // "" means "not tied to a channel"; the API takes the field as absent.
    platform: z
      .enum(["telegram", "messenger", "instagram", "website"])
      .optional()
      .or(z.literal("")),
    platform_id: z.string().optional(),
  });
}

export default function CustomerForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel,
}: ICustomerFormProps) {
  const t = useT("customers");
  const tc = useT("common");
  const schema = buildSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      platform: defaultValues?.platform ?? "",
      platform_id: defaultValues?.platform_id ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Name                   ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="name">{t.fieldName}</Label>
        <Input
          id="name"
          placeholder={t.fieldNamePlaceholder}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* ── Phone & Email          ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t.fieldPhone}</Label>
          <Input id="phone" placeholder="+855 12 345 678" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.fieldEmail}</Label>
          <Input id="email" type="email" placeholder="customer@example.com" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* ── Platform & Platform ID ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="platform">{t.fieldPlatform}</Label>
          <select
            id="platform"
            {...register("platform")}
            className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">{tc.none}</option>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="platform_id">{t.fieldPlatformId}</Label>
          <Input
            id="platform_id"
            placeholder={t.fieldPlatformIdPlaceholder}
            {...register("platform_id")}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? tc.saving : (submitLabel ?? t.saveCustomer)}
      </Button>
    </form>
  );
}
