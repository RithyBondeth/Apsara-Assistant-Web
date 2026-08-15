"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
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
});

export default function ProductForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = "Save product",
  allowStockEditing = true,
  allowImageSelection = false,
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
    },
  });
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; url: string }>>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function chooseImages(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    if (selectedImages.length + incoming.length > 8) {
      setImageError("A product can have at most 8 images.");
      return;
    }
    const invalid = incoming.find(
      (file) => !["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5_000_000,
    );
    if (invalid) {
      setImageError("Use PNG, JPEG, or WebP images up to 5 MB each.");
      return;
    }
    const added = incoming.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      return { file, url };
    });
    setSelectedImages((current) => [...current, ...added]);
    setImageError(null);
  }

  function removeImage(index: number) {
    setSelectedImages((current) => {
      URL.revokeObjectURL(current[index].url);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, selectedImages.map((item) => item.file)))}
      className="space-y-5"
    >
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

      {allowImageSelection && (
        <div className="space-y-2">
          <Label htmlFor="product-images">Product images</Label>
          <label
            htmlFor="product-images"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-sm text-muted-foreground hover:bg-muted/50"
          >
            <ImagePlus className="h-4 w-4" />
            Choose up to 8 images
          </label>
          <Input
            id="product-images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => chooseImages(event.target.files)}
          />
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {selectedImages.map((image, index) => (
                <div key={image.url} className="relative aspect-square overflow-hidden rounded-lg border">
                  {/* Local object URLs do not benefit from Next image optimization. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={`Selected product ${index + 1}`} className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="destructive"
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute right-1 top-1"
                    onClick={() => removeImage(index)}
                  >
                    <X />
                  </Button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {imageError && <p role="alert" className="text-xs text-destructive">{imageError}</p>}
          <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP. Maximum 5 MB each.</p>
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
