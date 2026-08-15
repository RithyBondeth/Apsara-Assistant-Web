import { create } from "zustand";
import api from "@/lib/axios";
import { PAYMENT_QRS_API } from "@/utils/constants/apis/payment-qrs.api.constant";
import {
  IPaymentQr,
  IPaymentQrCreate,
  IPaymentQrUpdate,
} from "@/utils/interfaces/payment-qr/payment-qr.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IPaymentQrsStore {
  qrs: IPaymentQr[];
  loading: boolean;
  error: string | null;
  fetchQrs: () => Promise<void>;
  createQr: (payload: IPaymentQrCreate) => Promise<boolean>;
  updateQr: (id: string, payload: IPaymentQrUpdate) => Promise<boolean>;
  deleteQr: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const usePaymentQrsStore = create<IPaymentQrsStore>((set) => ({
  qrs: [],
  loading: false,
  error: null,

  fetchQrs: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IPaymentQr[]>(PAYMENT_QRS_API.LIST);
      set({ qrs: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  createQr: async (payload) => {
    set({ loading: true, error: null });
    try {
      const form = new FormData();
      form.append("name", payload.name);
      if (payload.bank_name) form.append("bank_name", payload.bank_name);
      if (payload.account_name) form.append("account_name", payload.account_name);
      if (payload.currency) form.append("currency", payload.currency);
      if (payload.is_default) form.append("is_default", "true");
      form.append("file", payload.file);
      await api.post(PAYMENT_QRS_API.CREATE, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await api.get<IPaymentQr[]>(PAYMENT_QRS_API.LIST);
      set({ qrs: data, loading: false });
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  updateQr: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await api.patch(PAYMENT_QRS_API.UPDATE(id), payload);
      const { data } = await api.get<IPaymentQr[]>(PAYMENT_QRS_API.LIST);
      set({ qrs: data, loading: false });
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteQr: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(PAYMENT_QRS_API.DELETE(id));
      const { data } = await api.get<IPaymentQr[]>(PAYMENT_QRS_API.LIST);
      set({ qrs: data, loading: false });
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
