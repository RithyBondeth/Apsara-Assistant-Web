"use client";

import { ChangeEvent } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { IProductImage, IProductVariant } from "@/utils/interfaces/product/product.interface";
import { SHARED_SELECT_CLASS } from "@/utils/constants/order.constant";
import { useAppT, fmt } from "@/hooks/utils/use-app-translations";

interface ProductImageManagerProps {
  productId: string;
  images: IProductImage[];
  legacyImageUrl?: string | null;
  variants: IProductVariant[];
}

export default function ProductImageManager({
  productId,
  images,
  legacyImageUrl,
  variants,
}: ProductImageManagerProps) {
  const { loading, error, uploadImages, orderImages, deleteImage, assignImageVariant, clearError } = useProductsStore();
  const t = useAppT("products").gallery;

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    await uploadImages(productId, files);
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const primary = next.find((image) => image.is_primary) ?? next[0];
    await orderImages(productId, next.map((image) => image.id), primary.id);
  }

  async function makePrimary(imageId: string) {
    await orderImages(productId, images.map((image) => image.id), imageId);
  }

  async function remove(image: IProductImage) {
    if (!confirm(fmt(t.confirmRemove, { name: image.file_name }))) return;
    await deleteImage(productId, image.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="gallery-upload">{t.title}</Label>
          <p className="text-xs text-muted-foreground">{fmt(t.uploaded, { count: images.length })}</p>
        </div>
        <label htmlFor="gallery-upload">
          <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium hover:bg-muted">
            <ImagePlus className="h-4 w-4" /> {t.addImages}
          </span>
        </label>
        <Input
          id="gallery-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={loading || images.length >= 8}
          className="sr-only"
          onClick={clearError}
          onChange={handleUpload}
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          {t.none}
          {legacyImageUrl && t.legacy}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <div key={image.id} className="flex gap-3 rounded-lg border p-2">
              {/* Dynamic API media URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={fmt(t.preview, { name: image.file_name })} className="h-24 w-24 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{image.file_name}</p>
                <p className="text-xs text-muted-foreground">{Math.ceil(image.file_size / 1024)} KB</p>
                {image.is_primary && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary"><Star className="h-3 w-3 fill-current" /> {t.cover}</span>
                )}
                <div className="mt-2 flex gap-1">
                  <Button type="button" size="icon-xs" variant="outline" aria-label={t.moveLeft} disabled={loading || index === 0} onClick={() => move(index, -1)}><ArrowLeft /></Button>
                  <Button type="button" size="icon-xs" variant="outline" aria-label={t.moveRight} disabled={loading || index === images.length - 1} onClick={() => move(index, 1)}><ArrowRight /></Button>
                  {!image.is_primary && <Button type="button" size="xs" variant="outline" disabled={loading} onClick={() => makePrimary(image.id)}>{t.setCover}</Button>}
                  <Button type="button" size="icon-xs" variant="destructive" aria-label={fmt(t.remove, { name: image.file_name })} disabled={loading} onClick={() => remove(image)}><Trash2 /></Button>
                </div>
                <select
                  aria-label={fmt(t.variantFor, { name: image.file_name })}
                  value={image.variant_id ?? ""}
                  disabled={loading}
                  className={`${SHARED_SELECT_CLASS} mt-2`}
                  onChange={(event) => assignImageVariant(productId, image.id, event.target.value || null)}
                >
                  <option value="">{t.allVariants}</option>
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>{variant.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{t.imageHelp}</p>
    </div>
  );
}
