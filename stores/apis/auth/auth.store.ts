import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { IUser, IAuthResponse } from "@/utils/interfaces/auth/auth.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IAuthStore {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post<IAuthResponse>(AUTH_API.LOGIN, {
            email,
            password,
          });
          localStorage.setItem("access_token", data.access_token);
          set({ user: data.user, loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await api.post(AUTH_API.LOGOUT);
        } finally {
          localStorage.removeItem("access_token");
          set({ user: null });
        }
      },

      fetchMe: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get<IUser>(AUTH_API.ME);
          set({ user: data, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "apsara-auth", partialize: (s) => ({ user: s.user }) }
  )
);
