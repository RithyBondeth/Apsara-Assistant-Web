import { create } from "zustand";
import api from "@/lib/axios";
import { CUSTOMERS_API } from "@/utils/constants/apis/customers.api.constant";
import {
  ICustomer,
  ICustomerCreate,
  ICustomerUpdate,
} from "@/utils/interfaces/customer/customer.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface ICustomersStore {
  customers: ICustomer[];
  selected: ICustomer | null;
  loading: boolean;
  error: string | null;
  fetchCustomers: (platform?: string) => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  createCustomer: (data: ICustomerCreate) => Promise<ICustomer | null>;
  updateCustomer: (id: string, data: ICustomerUpdate) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useCustomersStore = create<ICustomersStore>((set) => ({
  customers: [],
  selected: null,
  loading: false,
  error: null,

  fetchCustomers: async (platform) => {
    set({ loading: true, error: null });
    try {
      const params = platform ? { platform } : {};
      const { data } = await api.get<ICustomer[]>(CUSTOMERS_API.LIST, { params });
      set({ customers: data, loading: false });
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
      set((s) => ({ customers: [data, ...s.customers], loading: false }));
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
