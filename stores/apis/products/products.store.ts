import { create } from "zustand";
import api from "@/lib/axios";
import { PRODUCTS_API } from "@/utils/constants/apis/products.api.constant";
import {
  IProductFilters,
  IProduct,
  IProductCreate,
  IProductUpdate,
} from "@/utils/interfaces/product/product.interface";
import { IPage } from "@/utils/interfaces/common/page.interface";
import { extractErrorMessage } from "@/utils/functions/error";

export const PRODUCTS_PAGE_SIZE = 20;

/** Must not exceed the API's MAX_PAGE_SIZE, which rejects anything larger. */
const FETCH_ALL_PAGE_SIZE = 200;

interface IProductsStore {
  /** The current page only — not the whole catalogue. See `fetchAllProducts`. */
  products: IProduct[];
  /** How many products the seller has in total, across all pages. */
  total: number;
  /** 1-based. */
  page: number;
  selected: IProduct | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (page?: number, filters?: IProductFilters) => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: IProductCreate) => Promise<boolean>;
  updateProduct: (id: string, data: IProductUpdate) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProductsStore = create<IProductsStore>((set) => ({
  products: [],
  total: 0,
  page: 1,
  selected: null,
  loading: false,
  error: null,

  // `active_only` defaults to true server-side, so a deactivated product drops
  // out of the list unless the seller asks to see it — which is why the list
  // page needs the toggle: without it a deactivated product is unreachable.
  fetchProducts: async (page = 1, filters) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IPage<IProduct>>(PRODUCTS_API.LIST, {
        params: {
          skip: (page - 1) * PRODUCTS_PAGE_SIZE,
          limit: PRODUCTS_PAGE_SIZE,
          active_only: !filters?.includeInactive,
          ...(filters?.search ? { search: filters.search } : {}),
        },
      });
      set({
        products: data.items,
        total: data.total,
        page,
        loading: false,
      });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  // Pickers (the order form's product select, the order detail's id→name lookup)
  // need every product, not a page. Paging through beats requesting one huge
  // limit: no magic number to outgrow, and it can't silently truncate the way
  // the un-paginated fetch used to.
  fetchAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const collected: IProduct[] = [];
      let skip = 0;
      let total = 0;
      do {
        const { data } = await api.get<IPage<IProduct>>(PRODUCTS_API.LIST, {
          params: { skip, limit: FETCH_ALL_PAGE_SIZE },
        });
        collected.push(...data.items);
        total = data.total;
        skip += FETCH_ALL_PAGE_SIZE;
        // Guard against a short page (a concurrent delete would otherwise leave
        // `collected.length` short of `total` forever and spin this loop).
        if (data.items.length === 0) break;
      } while (collected.length < total);

      set({ products: collected, total, page: 1, loading: false });
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
      set((s) => ({
        products: [data, ...s.products],
        total: s.total + 1,
        loading: false,
      }));
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
        total: Math.max(0, s.total - 1),
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
