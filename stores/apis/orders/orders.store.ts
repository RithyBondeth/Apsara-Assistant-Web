import { create } from "zustand";
import api from "@/lib/axios";
import { ORDERS_API } from "@/utils/constants/apis/orders.api.constant";
import {
  IOrder,
  IOrderCreate,
  IOrderFilters,
  IOrderUpdate,
} from "@/utils/interfaces/order/order.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IOrdersStore {
  orders: IOrder[];
  selected: IOrder | null;
  loading: boolean;
  error: string | null;
  fetchOrders: (filters?: IOrderFilters) => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (data: IOrderCreate) => Promise<IOrder | null>;
  updateOrder: (id: string, data: IOrderUpdate) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useOrdersStore = create<IOrdersStore>((set) => ({
  orders: [],
  selected: null,
  loading: false,
  error: null,

  fetchOrders: async (filters) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IOrder[]>(ORDERS_API.LIST, { params: filters });
      set({ orders: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  fetchOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IOrder>(ORDERS_API.GET(id));
      set({ selected: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  createOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<IOrder>(ORDERS_API.CREATE, payload);
      set((s) => ({ orders: [data, ...s.orders], loading: false }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return null;
    }
  },

  updateOrder: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.patch<IOrder>(ORDERS_API.UPDATE(id), payload);
      set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? data : o)),
        selected: s.selected?.id === id ? data : s.selected,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(ORDERS_API.DELETE(id));
      set((s) => ({
        orders: s.orders.filter((o) => o.id !== id),
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
