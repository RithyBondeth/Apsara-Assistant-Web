import { create } from "zustand";
import api from "@/lib/axios";
import { ORDERS_API } from "@/utils/constants/apis/orders.api.constant";
import {
  ICheckout,
  IOrder,
  IOrderCreate,
  IReceipt,
  IOrderUpdate,
  TOrderStatus,
} from "@/utils/interfaces/order/order.interface";
import { extractErrorMessage } from "@/utils/functions/error";
import { fetchAllPages } from "@/utils/functions/pagination";

interface IOrdersStore {
  orders: IOrder[];
  selected: IOrder | null;
  loading: boolean;
  error: string | null;
  receipts: IReceipt[];
  receiptsLoading: boolean;
  receiptOrderId: string | null;
  fetchOrders: (status?: TOrderStatus | "all") => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (data: IOrderCreate) => Promise<IOrder | null>;
  updateOrder: (id: string, data: IOrderUpdate) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  /** Opens a Stripe payment page for the order and returns its link. */
  createCheckout: (id: string) => Promise<ICheckout | null>;
  fetchReceipts: (id: string) => Promise<void>;
  confirmReceipt: (id: string, receiptId: string) => Promise<boolean>;
  rejectReceipt: (id: string, receiptId: string) => Promise<boolean>;
  selectOrder: (order: IOrder | null) => void;
  clearError: () => void;
}

export const useOrdersStore = create<IOrdersStore>((set, get) => ({
  orders: [],
  selected: null,
  loading: false,
  error: null,
  receipts: [],
  receiptsLoading: false,
  receiptOrderId: null,

  fetchOrders: async (status) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAllPages<IOrder>(
        ORDERS_API.LIST,
        status && status !== "all" ? { status } : {},
      );
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
        selected: s.selected?.id === id ? null : s.selected,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  createCheckout: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<ICheckout>(ORDERS_API.CHECKOUT(id));
      // Reflect the order moving to "pending" without another round trip. The
      // jump to "paid" comes from Stripe's webhook, so it lands on a refetch.
      set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id ? { ...o, payment_status: data.payment_status } : o,
        ),
        selected:
          s.selected?.id === id
            ? { ...s.selected, payment_status: data.payment_status }
            : s.selected,
        loading: false,
      }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return null;
    }
  },

  fetchReceipts: async (id) => {
    set({ receiptsLoading: true, receipts: [], receiptOrderId: id, error: null });
    try {
      const { data } = await api.get<IReceipt[]>(ORDERS_API.RECEIPTS(id));
      if (get().receiptOrderId === id) {
        set({ receipts: data, receiptsLoading: false });
      }
    } catch (error) {
      if (get().receiptOrderId === id) {
        set({ error: extractErrorMessage(error), receiptsLoading: false });
      }
    }
  },

  confirmReceipt: async (id, receiptId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<IOrder>(ORDERS_API.CONFIRM_RECEIPT(id, receiptId));
      set((s) => ({
        orders: s.orders.map((order) => (order.id === id ? data : order)),
        selected: s.selected?.id === id ? data : s.selected,
        receipts: s.receipts.map((receipt) =>
          receipt.id === receiptId ? { ...receipt, review_status: "accepted" } : receipt,
        ),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  rejectReceipt: async (id, receiptId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<IReceipt>(ORDERS_API.REJECT_RECEIPT(id, receiptId));
      set((s) => ({
        receipts: s.receipts.map((receipt) => receipt.id === receiptId ? data : receipt),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  selectOrder: (order) => set({
    selected: order,
    receipts: [],
    receiptOrderId: order?.id ?? null,
  }),

  clearError: () => set({ error: null }),
}));
