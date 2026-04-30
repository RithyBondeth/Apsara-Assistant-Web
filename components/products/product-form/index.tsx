"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IProductFormProps, ProductFormValues } from "./props";

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().default(""),
  price: z.number().min(0, "Price must be 0 or more"),
  stock: z.number().int().min(0, "Stock must be 0 or more"),
  image_url: z.string().optional().default(""),
});

export default function ProductForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = "Save product",
}: IProductFormProps) {
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
      image_url: defaultValues?.image_url ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Product name *</Label>
        <Input id="name" placeholder="Khmer silk scarf" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
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
          <Label htmlFor="price">Price ($) *</Label>
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
          <Label htmlFor="stock">Stock *</Label>
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
