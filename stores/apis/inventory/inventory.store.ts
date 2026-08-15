import { create } from "zustand";
import api from "@/lib/axios";
import { INVENTORY_API } from "@/utils/constants/apis/inventory.api.constant";
import {
  IExpiredReservationsResult,
  IInventoryAdjustment,
  IInventoryMovement,
} from "@/utils/interfaces/inventory/inventory.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IInventoryStore {
  movements: IInventoryMovement[];
  loading: boolean;
  error: string | null;
  fetchMovements: () => Promise<void>;
  adjustStock: (productId: string, data: IInventoryAdjustment) => Promise<boolean>;
  releaseExpired: () => Promise<IExpiredReservationsResult | null>;
  clearError: () => void;
}

export const useInventoryStore = create<IInventoryStore>((set) => ({
  movements: [],
  loading: false,
  error: null,

  fetchMovements: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IInventoryMovement[]>(INVENTORY_API.MOVEMENTS, {
        params: { limit: 50 },
      });
      set({ movements: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  adjustStock: async (productId, payload) => {
    set({ loading: true, error: null });
    try {
      await api.post(INVENTORY_API.ADJUST(productId), payload);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  releaseExpired: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<IExpiredReservationsResult>(
        INVENTORY_API.RELEASE_EXPIRED,
      );
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
