"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ImagePlus, Plus, X } from "lucide-react";
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
  allowVariantSelection = false,
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
  const [variantMode, setVariantMode] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [variants, setVariants] = useState([
    { id: "variant-1", options: "", sku: "", barcode: "", price: 0, stock: 0, threshold: 5 },
  ]);
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

  function parseOptions(value: string): Record<string, string> | null {
    const result: Record<string, string> = {};
    const entries = value.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.length === 0 || entries.length > 5) return null;
    for (const entry of entries) {
      const separator = entry.indexOf("=");
      if (separator < 1) return null;
      const name = entry.slice(0, separator).trim();
      const optionValue = entry.slice(separator + 1).trim();
      if (!name || !optionValue || result[name]) return null;
      result[name] = optionValue;
    }
    return result;
  }

  function submit(values: ProductFormValues) {
    if (!variantMode) {
      onSubmit(values, selectedImages.map((item) => item.file));
      return;
    }
    const parsed = variants.map((variant) => ({ variant, options: parseOptions(variant.options) }));
    if (parsed.some(({ variant, options }) =>
      !options || variant.price < 0 || variant.stock < 0 || variant.threshold < 0
    )) {
      setVariantError("Use options like Color=Red, Size=M and enter non-negative price and stock values.");
      return;
    }
    const signatures = parsed.map(({ options }) => JSON.stringify(options));
    if (new Set(signatures).size !== signatures.length) {
      setVariantError("Each variant must have a unique option combination.");
      return;
    }
    setVariantError(null);
    onSubmit({
      ...values,
      variants: parsed.map(({ variant, options }) => ({
        option_values: options!,
        sku: variant.sku.trim() || undefined,
        barcode: variant.barcode.trim() || undefined,
        price: variant.price,
        stock: variant.stock,
        low_stock_threshold: variant.threshold,
      })),
    }, selectedImages.map((item) => item.file));
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
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

      {allowVariantSelection && (
        <div className="space-y-3 rounded-lg border p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={variantMode}
              onChange={(event) => setVariantMode(event.target.checked)}
            />
            This product has options such as size or color
          </label>
          {variantMode && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Add one row for every sellable combination. Separate options with commas.
              </p>
              {variants.map((variant, index) => (
                <div key={variant.id} className="space-y-2 rounded-md bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Variant {index + 1}</p>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Remove variant ${index + 1}`}
                      disabled={variants.length === 1}
                      onClick={() => setVariants((current) => current.filter((item) => item.id !== variant.id))}
                    ><X /></Button>
                  </div>
                  <Input
                    aria-label={`Options for variant ${index + 1}`}
                    placeholder="Color=Red, Size=M"
                    value={variant.options}
                    onChange={(event) => setVariants((current) => current.map((item) =>
                      item.id === variant.id ? { ...item, options: event.target.value } : item
                    ))}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input aria-label={`SKU for variant ${index + 1}`} placeholder="SKU (optional)" value={variant.sku} onChange={(event) => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, sku: event.target.value } : item))} />
                    <Input aria-label={`Barcode for variant ${index + 1}`} placeholder="Barcode (optional)" value={variant.barcode} onChange={(event) => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, barcode: event.target.value } : item))} />
                    <Input aria-label={`Price for variant ${index + 1}`} type="number" min="0" step="0.01" placeholder={`Price (${currency})`} value={variant.price} onChange={(event) => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, price: Number(event.target.value) } : item))} />
                    <Input aria-label={`Stock for variant ${index + 1}`} type="number" min="0" placeholder="Opening stock" value={variant.stock} onChange={(event) => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, stock: Number(event.target.value) } : item))} />
                    <Input aria-label={`Threshold for variant ${index + 1}`} type="number" min="0" placeholder="Low-stock threshold" value={variant.threshold} onChange={(event) => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, threshold: Number(event.target.value) } : item))} />
                  </div>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" disabled={variants.length >= 100} onClick={() => setVariants((current) => [...current, { id: `variant-${Date.now()}-${current.length}`, options: "", sku: "", barcode: "", price: 0, stock: 0, threshold: 5 }])}>
                <Plus /> Add variant
              </Button>
              {variantError && <p role="alert" className="text-xs text-destructive">{variantError}</p>}
            </div>
          )}
        </div>
      )}

      {!variantMode && <div className="space-y-1.5">
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
      </div>}

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
      {!variantMode && <div className="grid gap-4 sm:grid-cols-2">
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
      </div>}

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
