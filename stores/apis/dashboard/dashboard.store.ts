import { create } from "zustand";
import api from "@/lib/axios";
import { DASHBOARD_API } from "@/utils/constants/apis/dashboard.api.constant";
import { IDashboardStats } from "@/utils/interfaces/dashboard/dashboard.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IDashboardStore {
  stats: IDashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<IDashboardStore>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IDashboardStats>(DASHBOARD_API.STATS);
      set({ stats: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },
}));
