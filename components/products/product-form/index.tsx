"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/image-upload";
import { useT } from "@/hooks/utils/use-translations";
import { IProductFormProps, ProductFormValues } from "./props";

/** Built per-render so validation messages follow the active language. */
function buildSchema(t: ReturnType<typeof useT<"products">>) {
  return z.object({
    name: z.string().min(1, t.errName),
    description: z.string().optional().default(""),
    price: z.number().min(0, t.errPrice),
    stock: z.number().int().min(0, t.errStock),
    image_url: z.string().optional().default(""),
  });
}

export default function ProductForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel,
}: IProductFormProps) {
  const t = useT("products");
  const tc = useT("common");
  const schema = buildSchema(t);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ? parseFloat(String(defaultValues.price)) : 0,
      stock: defaultValues?.stock ?? 0,
      image_url: defaultValues?.image_url ?? "",
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

      {/* ── Description            ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="description">{t.fieldDescription}</Label>
        <Textarea
          id="description"
          placeholder={t.fieldDescriptionPlaceholder}
          rows={3}
          {...register("description")}
        />
      </div>

      {/* ── Price & Stock          ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price">{t.fieldPrice}</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="9.99"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stock">{t.fieldStock}</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="100"
            {...register("stock", { valueAsNumber: true })}
          />
          {errors.stock && (
            <p className="text-xs text-destructive">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* ── Image                  ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label>{t.fieldPhoto}</Label>
        <Controller
          name="image_url"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value ?? ""}
              onChange={field.onChange}
              disabled={loading}
            />
          )}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? tc.saving : (submitLabel ?? t.saveChanges)}
      </Button>
    </form>
  );
}
