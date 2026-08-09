import { create } from "zustand";
import api from "@/lib/axios";
import { INTEGRATIONS_API } from "@/utils/constants/apis/integrations.api.constant";
import {
  IIntegration,
  IIntegrationCreate,
  IIntegrationUpdate,
} from "@/utils/interfaces/integration/integration.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IIntegrationsStore {
  integrations: IIntegration[];
  loading: boolean;
  error: string | null;
  fetchIntegrations: () => Promise<void>;
  createIntegration: (data: IIntegrationCreate) => Promise<IIntegration | null>;
  updateIntegration: (id: string, data: IIntegrationUpdate) => Promise<boolean>;
  deleteIntegration: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useIntegrationsStore = create<IIntegrationsStore>((set) => ({
  integrations: [],
  loading: false,
  error: null,

  fetchIntegrations: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IIntegration[]>(INTEGRATIONS_API.LIST);
      set({ integrations: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  createIntegration: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<IIntegration>(INTEGRATIONS_API.CREATE, payload);
      set((s) => ({ integrations: [data, ...s.integrations], loading: false }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return null;
    }
  },

  updateIntegration: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.patch<IIntegration>(
        INTEGRATIONS_API.UPDATE(id),
        payload
      );
      set((s) => ({
        integrations: s.integrations.map((i) => (i.id === id ? data : i)),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  deleteIntegration: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(INTEGRATIONS_API.DELETE(id));
      set((s) => ({
        integrations: s.integrations.filter((i) => i.id !== id),
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
