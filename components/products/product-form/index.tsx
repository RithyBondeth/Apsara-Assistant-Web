"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IProductFormProps, ProductFormValues } from "./props";
import { useAuthStore } from "@/stores/apis/auth/auth.store";

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().default(""),
  price: z.number().min(0, "Price must be 0 or more"),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  low_stock_threshold: z.number().int().min(0, "Threshold must be 0 or more"),
  image_url: z.string().optional().default(""),
});

export default function ProductForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = "Save product",
  allowStockEditing = true,
}: IProductFormProps) {
  const currency = useAuthStore((state) => state.user?.currency ?? "USD");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ? parseFloat(String(defaultValues.price)) : 0,
      stock: defaultValues?.stock ?? 0,
      low_stock_threshold: defaultValues?.low_stock_threshold ?? 5,
      image_url: defaultValues?.image_url ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Product name *</Label>
        <Input
          id="name"
          placeholder="Khmer silk scarf"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "product-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="product-name-error" className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="low_stock_threshold">Low-stock alert at *</Label>
        <Input
          id="low_stock_threshold"
          type="number"
          min="0"
          placeholder="5"
          {...register("low_stock_threshold", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Inventory is flagged when available stock reaches this level.
        </p>
        {errors.low_stock_threshold && (
          <p className="text-xs text-destructive">
            {errors.low_stock_threshold.message}
          </p>
        )}
      </div>

      {/* ── Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your product…"
          rows={3}
          {...register("description")}
        />
      </div>

      {/* ── Price & Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price ({currency}) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="9.99"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? "product-price-error" : undefined}
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p id="product-price-error" className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        {allowStockEditing ? (
          <div className="space-y-1.5">
            <Label htmlFor="stock">Opening stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              placeholder="100"
              aria-invalid={Boolean(errors.stock)}
              aria-describedby={errors.stock ? "product-stock-error" : undefined}
              {...register("stock", { valueAsNumber: true })}
            />
            {errors.stock && (
              <p id="product-stock-error" className="text-xs text-destructive">{errors.stock.message}</p>
            )}
          </div>
        ) : (
          <input type="hidden" {...register("stock", { valueAsNumber: true })} />
        )}
      </div>

      {/* ── Image URL */}
      <div className="space-y-1.5">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://…"
          {...register("image_url")}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
