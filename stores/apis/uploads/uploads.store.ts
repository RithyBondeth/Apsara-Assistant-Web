import { create } from "zustand";
import { AxiosError } from "axios";
import api from "@/lib/axios";
import { UPLOADS_API } from "@/utils/constants/apis/uploads.api.constant";
import { IUploadResult } from "@/utils/interfaces/upload/upload.interface";
import { extractErrorMessage } from "@/utils/functions/error";

/** Mirrors ALLOWED_TYPES in the backend's endpoints/uploads.py. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** Mirrors MAX_BYTES in the backend's endpoints/uploads.py. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface IUploadsStore {
  uploading: boolean;
  /** True once the server has told us Cloudinary isn't configured (503). */
  unavailable: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<IUploadResult | null>;
  deleteImage: (publicId: string) => Promise<void>;
  clearError: () => void;
}

export const useUploadsStore = create<IUploadsStore>((set) => ({
  uploading: false,
  unavailable: false,
  error: null,

  uploadImage: async (file) => {
    // Check locally first so an oversized file doesn't cost a round trip.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      set({ error: "Please choose a JPEG, PNG, WebP, or GIF image." });
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      set({ error: "That image is larger than 5 MB. Try a smaller one." });
      return null;
    }

    set({ uploading: true, error: null });
    try {
      const form = new FormData();
      form.append("file", file);

      const { data } = await api.post<IUploadResult>(UPLOADS_API.IMAGE, form, {
        // The axios instance defaults to application/json. Clearing it lets the
        // browser set multipart/form-data *with* the boundary, which the server
        // needs to parse the upload.
        headers: { "Content-Type": undefined },
      });

      set({ uploading: false });
      return data;
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      set({
        uploading: false,
        unavailable: status === 503,
        error: extractErrorMessage(error),
      });
      return null;
    }
  },

  deleteImage: async (publicId) => {
    try {
      await api.delete(UPLOADS_API.IMAGE, { params: { public_id: publicId } });
    } catch {
      // Best-effort cleanup — a failure here just leaves an orphaned image on
      // Cloudinary and shouldn't block the seller.
    }
  },

  clearError: () => set({ error: null }),
}));
