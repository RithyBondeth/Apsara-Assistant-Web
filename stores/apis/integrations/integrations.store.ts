import { create } from "zustand";
import api from "@/lib/axios";
import { INTEGRATIONS_API } from "@/utils/constants/apis/integrations.api.constant";
import {
  IIntegration,
  IIntegrationCreate,
  IIntegrationUpdate,
  IWebhookRegisterResult,
} from "@/utils/interfaces/integration/integration.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IIntegrationsStore {
  integrations: IIntegration[];
  /** Webhook registration results, keyed by integration id. */
  webhooks: Record<string, IWebhookRegisterResult>;
  loading: boolean;
  registering: string | null;
  error: string | null;
  fetchIntegrations: () => Promise<void>;
  createIntegration: (data: IIntegrationCreate) => Promise<IIntegration | null>;
  updateIntegration: (id: string, data: IIntegrationUpdate) => Promise<boolean>;
  deleteIntegration: (id: string) => Promise<boolean>;
  registerWebhook: (id: string) => Promise<IWebhookRegisterResult | null>;
  clearError: () => void;
}

export const useIntegrationsStore = create<IIntegrationsStore>((set) => ({
  integrations: [],
  webhooks: {},
  loading: false,
  registering: null,
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
      const { data } = await api.patch<IIntegration>(INTEGRATIONS_API.UPDATE(id), payload);
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
      set((s) => {
        // Drop the cached webhook result too — it is keyed by an id that no
        // longer exists.
        const webhooks = { ...s.webhooks };
        delete webhooks[id];
        return {
          integrations: s.integrations.filter((i) => i.id !== id),
          webhooks,
          loading: false,
        };
      });
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  registerWebhook: async (id) => {
    set({ registering: id, error: null });
    try {
      const { data } = await api.post<IWebhookRegisterResult>(
        INTEGRATIONS_API.REGISTER_WEBHOOK(id)
      );
      set((s) => ({
        webhooks: { ...s.webhooks, [id]: data },
        registering: null,
      }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), registering: null });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
