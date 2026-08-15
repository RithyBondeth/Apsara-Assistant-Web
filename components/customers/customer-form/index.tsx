"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICustomerFormProps, CustomerFormValues } from "./props";

const PLATFORMS = ["facebook", "telegram", "tiktok", "website"];

const schema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  platform: z.string().optional(),
  platform_id: z.string().optional(),
});

export default function CustomerForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = "Save customer",
}: ICustomerFormProps) {
  const {
    register,
    handleSubmit,
    control,
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
  const selectedPlatform = useWatch({ control, name: "platform" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name *</Label>
        <Input
          id="name"
          placeholder="Sophea Chan"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "customer-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="customer-name-error" className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* ── Phone & Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+855 12 345 678" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="customer@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "customer-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="customer-email-error" className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* ── Platform & Platform ID */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="platform">Platform</Label>
          <select
            id="platform"
            {...register("platform")}
            className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">— None —</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="platform_id">Platform ID</Label>
          <Input
            id="platform_id"
            placeholder={selectedPlatform ? `${selectedPlatform} user ID…` : "Choose a platform first"}
            disabled={!selectedPlatform}
            {...register("platform_id")}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
