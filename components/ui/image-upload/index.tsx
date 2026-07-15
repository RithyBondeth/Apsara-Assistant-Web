"use client";

import { useRef, useState } from "react";
import { LucideImagePlus, LucideLoader2, LucideX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUploadsStore, ALLOWED_IMAGE_TYPES } from "@/stores/apis/uploads/uploads.store";
import { IImageUploadProps } from "./props";

export default function ImageUpload({ value, onChange, disabled }: IImageUploadProps) {
  // ── API Integration
  const { uploading, unavailable, error, uploadImage, deleteImage, clearError } =
    useUploadsStore();

  // ── All States
  const inputRef = useRef<HTMLInputElement>(null);
  // Remembered so we can clean up the Cloudinary asset if the seller replaces
  // or removes an image they just uploaded.
  const [publicId, setPublicId] = useState<string | null>(null);

  // ── Methods
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    clearError();
    const previous = publicId;
    const result = await uploadImage(file);

    // Let the same file be picked again after a failure.
    event.target.value = "";
    if (!result) return;

    onChange(result.url);
    setPublicId(result.public_id);
    if (previous) deleteImage(previous);
  }

  function handleRemove() {
    if (publicId) deleteImage(publicId);
    setPublicId(null);
    onChange("");
  }

  // ── Render UI
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-fit">
          {/* Cloudinary hosts these, so next/image would need a remotePatterns
              entry. A plain img keeps the component drop-in. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Product"
            className="size-28 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
          >
            <LucideX className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex size-28 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-blue-500 hover:text-blue-600 disabled:opacity-60"
        >
          {uploading ? (
            <LucideLoader2 className="size-5 animate-spin" />
          ) : (
            <LucideImagePlus className="size-5" />
          )}
          <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFile}
        className="hidden"
      />

      {!value && !uploading && (
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF · up to 5 MB</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* If the server has no Cloudinary credentials, uploading can never
          succeed — fall back to pasting a URL rather than dead-ending. */}
      {unavailable && (
        <div className="space-y-1.5 rounded-lg border border-dashed p-2">
          <p className="text-xs text-muted-foreground">
            Uploads aren&apos;t configured on the server. Paste an image URL instead:
          </p>
          <Input
            type="url"
            placeholder="https://…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
