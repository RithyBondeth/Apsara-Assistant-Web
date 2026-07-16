import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import {
  IUser,
  IToken,
  IUserUpdate,
} from "@/utils/interfaces/auth/auth.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IAuthStore {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (data: IUserUpdate) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      /* ---------------------------------- States --------------------------------- */
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // FastAPI OAuth2 expects form data for token endpoint
          const form = new URLSearchParams();
          form.append("username", email);
          form.append("password", password);

          const { data: token } = await api.post<IToken>(AUTH_API.LOGIN, form, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          localStorage.setItem("access_token", token.access_token);

          // Fetch user profile after getting the token
          const { data: user } = await api.get<IUser>(AUTH_API.ME);
          set({ user, loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      /* ---------------------------------- Store --------------------------------- */
      loginWithOtp: async (email, code) => {
        set({ loading: true, error: null });
        try {
          const { data: token } = await api.post<IToken>(AUTH_API.OTP_VERIFY, {
            email,
            code,
          });

          localStorage.setItem("access_token", token.access_token);

          const { data: user } = await api.get<IUser>(AUTH_API.ME);
          set({ user, loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await api.post(AUTH_API.LOGOUT);
        } catch {
          // Best-effort. The API has no /auth/logout route, and a stateless JWT
          // can't be revoked server-side anyway — dropping the token locally is
          // what actually ends the session. Without this catch the rejection
          // escaped and callers never reached their post-logout redirect.
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
          localStorage.removeItem("access_token");
          set({ user: null, loading: false });
        }
      },

      updateProfile: async (payload) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.patch<IUser>(AUTH_API.ME, payload);
          set({ user: data, loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
          // Returns 204 with no body — success is the absence of a throw.
          await api.post(AUTH_API.CHANGE_PASSWORD, {
            current_password: currentPassword,
            new_password: newPassword,
          });
          set({ loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "apsara-auth", partialize: (s) => ({ user: s.user }) },
  ),
);
