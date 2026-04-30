import { create } from "zustand";
import api from "@/lib/axios";
import { PRODUCTS_API } from "@/utils/constants/apis/products.api.constant";
import {
  IProduct,
  IProductCreate,
  IProductUpdate,
} from "@/utils/interfaces/product/product.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IProductsStore {
  products: IProduct[];
  selected: IProduct | null;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (data: IProductCreate) => Promise<boolean>;
  updateProduct: (id: number, data: IProductUpdate) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  clearError: () => void;
}

export const useProductsStore = create<IProductsStore>((set, get) => ({
  products: [],
  selected: null,
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IProduct[]>(PRODUCTS_API.LIST);
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
      set((s) => ({ products: [...s.products, data], loading: false }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
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

  clearError: () => set({ error: null }),
}));
