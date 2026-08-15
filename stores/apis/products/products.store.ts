import { create } from "zustand";
import api from "@/lib/axios";
import { PRODUCTS_API } from "@/utils/constants/apis/products.api.constant";
import {
  IProduct,
  IProductCreate,
  IProductImage,
  IProductVariant,
  IProductVariantCreate,
  IProductVariantUpdate,
  IProductUpdate,
} from "@/utils/interfaces/product/product.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { fetchAllPages } from "@/utils/functions/pagination";

interface IProductsStore {
  products: IProduct[];
  selected: IProduct | null;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: IProductCreate) => Promise<IProduct | null>;
  updateProduct: (id: string, data: IProductUpdate) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  uploadImages: (id: string, files: File[]) => Promise<boolean>;
  orderImages: (id: string, imageIds: string[], primaryImageId: string) => Promise<boolean>;
  deleteImage: (id: string, imageId: string) => Promise<boolean>;
  assignImageVariant: (id: string, imageId: string, variantId: string | null) => Promise<boolean>;
  createVariant: (id: string, data: IProductVariantCreate) => Promise<boolean>;
  updateVariant: (id: string, variantId: string, data: IProductVariantUpdate) => Promise<boolean>;
  deleteVariant: (id: string, variantId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProductsStore = create<IProductsStore>((set) => ({
  products: [],
  selected: null,
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAllPages<IProduct>(PRODUCTS_API.LIST);
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  fetchProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IProduct>(PRODUCTS_API.GET(id));
      set({ selected: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  createProduct: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<IProduct>(PRODUCTS_API.CREATE, payload);
      set((s) => ({ products: [data, ...s.products], loading: false }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return null;
    }
  },

  updateProduct: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.patch<IProduct>(PRODUCTS_API.UPDATE(id), payload);
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? data : p)),
        selected: data,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(PRODUCTS_API.DELETE(id));
      set((s) => ({
        products: s.products.filter((p) => p.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  uploadImages: async (id, files) => {
    set({ loading: true, error: null });
    try {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      const { data: images } = await api.post<IProductImage[]>(PRODUCTS_API.IMAGES(id), form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, images } : product,
        ),
        selected: state.selected?.id === id ? { ...state.selected, images } : state.selected,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  orderImages: async (id, imageIds, primaryImageId) => {
    set({ loading: true, error: null });
    try {
      const { data: images } = await api.put<IProductImage[]>(PRODUCTS_API.IMAGE_ORDER(id), {
        image_ids: imageIds,
        primary_image_id: primaryImageId,
      });
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, images } : product,
        ),
        selected: state.selected?.id === id ? { ...state.selected, images } : state.selected,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteImage: async (id, imageId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(PRODUCTS_API.DELETE_IMAGE(id, imageId));
      const remove = (images: IProductImage[]) => {
        const removed = images.find((image) => image.id === imageId);
        const remaining = images
          .filter((image) => image.id !== imageId)
          .map((image, position) => ({ ...image, position }));
        if (removed?.is_primary && remaining.length > 0) {
          remaining[0] = { ...remaining[0], is_primary: true };
        }
        return remaining;
      };
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, images: remove(product.images) } : product,
        ),
        selected: state.selected?.id === id
          ? { ...state.selected, images: remove(state.selected.images) }
          : state.selected,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  assignImageVariant: async (id, imageId, variantId) => {
    set({ loading: true, error: null });
    try {
      const { data: image } = await api.patch<IProductImage>(
        PRODUCTS_API.IMAGE_VARIANT(id, imageId),
        { variant_id: variantId },
      );
      const replace = (images: IProductImage[]) =>
        images.map((item) => (item.id === image.id ? image : item));
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, images: replace(product.images) } : product,
        ),
        selected: state.selected?.id === id
          ? { ...state.selected, images: replace(state.selected.images) }
          : state.selected,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  createVariant: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await api.post<IProductVariant>(PRODUCTS_API.VARIANTS(id), payload);
      const { data } = await api.get<IProduct>(PRODUCTS_API.GET(id));
      set((state) => ({
        products: state.products.map((product) => (product.id === id ? data : product)),
        selected: data,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  updateVariant: async (id, variantId, payload) => {
    set({ loading: true, error: null });
    try {
      await api.patch<IProductVariant>(PRODUCTS_API.VARIANT(id, variantId), payload);
      const { data } = await api.get<IProduct>(PRODUCTS_API.GET(id));
      set((state) => ({
        products: state.products.map((product) => (product.id === id ? data : product)),
        selected: data,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteVariant: async (id, variantId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(PRODUCTS_API.VARIANT(id, variantId));
      const { data } = await api.get<IProduct>(PRODUCTS_API.GET(id));
      set((state) => ({
        products: state.products.map((product) => (product.id === id ? data : product)),
        selected: data,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
