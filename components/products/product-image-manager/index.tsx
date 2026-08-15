"use client";

import { ChangeEvent } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductsStore } from "@/stores/apis/products/products.store";
import { IProductImage } from "@/utils/interfaces/product/product.interface";

interface ProductImageManagerProps {
  productId: string;
  images: IProductImage[];
  legacyImageUrl?: string | null;
}

export default function ProductImageManager({
  productId,
  images,
  legacyImageUrl,
}: ProductImageManagerProps) {
  const { loading, error, uploadImages, orderImages, deleteImage, clearError } = useProductsStore();

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
    if (!confirm(`Remove ${image.file_name}?`)) return;
    await deleteImage(productId, image.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="gallery-upload">Product gallery</Label>
          <p className="text-xs text-muted-foreground">{images.length}/8 uploaded</p>
        </div>
        <label htmlFor="gallery-upload">
          <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium hover:bg-muted">
            <ImagePlus className="h-4 w-4" /> Add images
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
          No uploaded images yet.
          {legacyImageUrl && " The existing URL image remains visible until you upload a replacement."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image, index) => (
            <div key={image.id} className="flex gap-3 rounded-lg border p-2">
              {/* Dynamic API media URL. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`${image.file_name} preview`} className="h-24 w-24 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{image.file_name}</p>
                <p className="text-xs text-muted-foreground">{Math.ceil(image.file_size / 1024)} KB</p>
                {image.is_primary && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary"><Star className="h-3 w-3 fill-current" /> Cover</span>
                )}
                <div className="mt-2 flex gap-1">
                  <Button type="button" size="icon-xs" variant="outline" aria-label="Move image left" disabled={loading || index === 0} onClick={() => move(index, -1)}><ArrowLeft /></Button>
                  <Button type="button" size="icon-xs" variant="outline" aria-label="Move image right" disabled={loading || index === images.length - 1} onClick={() => move(index, 1)}><ArrowRight /></Button>
                  {!image.is_primary && <Button type="button" size="xs" variant="outline" disabled={loading} onClick={() => makePrimary(image.id)}>Set cover</Button>}
                  <Button type="button" size="icon-xs" variant="destructive" aria-label={`Remove ${image.file_name}`} disabled={loading} onClick={() => remove(image)}><Trash2 /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP. Maximum 5 MB each.</p>
    </div>
  );
}
