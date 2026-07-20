import { create } from "zustand";
import api from "@/lib/axios";
import { CUSTOMERS_API } from "@/utils/constants/apis/customers.api.constant";
import {
  ICustomerFilters,
  ICustomer,
  ICustomerCreate,
  ICustomerUpdate,
} from "@/utils/interfaces/customer/customer.interface";
import { IPage } from "@/utils/interfaces/common/page.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { fetchEveryPage } from "@/utils/functions/fetch-all";

export const CUSTOMERS_PAGE_SIZE = 20;

interface ICustomersStore {
  /** The current page only — see `fetchAllCustomers` for lookups. */
  customers: ICustomer[];
  total: number;
  /** 1-based. */
  page: number;
  selected: ICustomer | null;
  loading: boolean;
  error: string | null;
  fetchCustomers: (page?: number, filters?: ICustomerFilters) => Promise<void>;
  fetchAllCustomers: (platform?: string) => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  createCustomer: (data: ICustomerCreate) => Promise<ICustomer | null>;
  updateCustomer: (id: string, data: ICustomerUpdate) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useCustomersStore = create<ICustomersStore>((set) => ({
  customers: [],
  total: 0,
  page: 1,
  selected: null,
  loading: false,
  error: null,

  fetchCustomers: async (page = 1, filters) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IPage<ICustomer>>(CUSTOMERS_API.LIST, {
        params: {
          ...(filters?.platform ? { platform: filters.platform } : {}),
          ...(filters?.search ? { search: filters.search } : {}),
          skip: (page - 1) * CUSTOMERS_PAGE_SIZE,
          limit: CUSTOMERS_PAGE_SIZE,
        },
      });
      set({ customers: data.items, total: data.total, page, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  // Used wherever a customer is looked up by id rather than browsed: the orders
  // table's name column, the new-order and new-conversation pickers, the
  // dashboard's recent-thread list.
  fetchAllCustomers: async (platform) => {
    set({ loading: true, error: null });
    try {
      const { items, total } = await fetchEveryPage<ICustomer>(
        CUSTOMERS_API.LIST,
        platform ? { platform } : {},
      );
      set({ customers: items, total, page: 1, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  fetchCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<ICustomer>(CUSTOMERS_API.GET(id));
      set({ selected: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  createCustomer: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<ICustomer>(CUSTOMERS_API.CREATE, payload);
      set((s) => ({
        customers: [data, ...s.customers],
        total: s.total + 1,
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return null;
    }
  },

  updateCustomer: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.patch<ICustomer>(CUSTOMERS_API.UPDATE(id), payload);
      set((s) => ({
        customers: s.customers.map((c) => (c.id === id ? data : c)),
        selected: data,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(CUSTOMERS_API.DELETE(id));
      set((s) => ({
        customers: s.customers.filter((c) => c.id !== id),
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
