import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import { AUTH_API } from "@/utils/constants/apis/auth.api.constant";
import { IUser, IToken, IUserUpdate, ITelegramLink, TUserLanguage } from "@/utils/interfaces/auth/auth.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IAuthStore {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<boolean>;
  updateProfile: (data: IUserUpdate) => Promise<boolean>;
  startTelegramLink: () => Promise<{ link: ITelegramLink } | { error: string }>;
  unlinkTelegram: () => Promise<boolean>;
  syncLanguage: (language: TUserLanguage) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      // ── Login: get token then fetch user profile
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // FastAPI OAuth2 expects form data for token endpoint
          const form = new URLSearchParams();
          form.append("username", email);
          form.append("password", password);

          await api.post<IToken>(AUTH_API.LOGIN, form, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          // Fetch user profile after getting the token
          const { data: user } = await api.get<IUser>(AUTH_API.ME);
          set({ user, loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      // ── OTP login: exchange a verified email code for a token
      loginWithOtp: async (email, code) => {
        set({ loading: true, error: null });
        try {
          await api.post<IToken>(AUTH_API.OTP_VERIFY, {
            email,
            code,
          });

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
        } finally {
          set({ user: null });
        }
      },

      fetchMe: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get<IUser>(AUTH_API.ME);
          set({ user: data, loading: false });
          return true;
        } catch {
          set({ user: null, loading: false });
          return false;
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

      // ── Telegram alerts: a link the seller opens, and the bot does the rest
      // The failure is returned rather than stored: `error` is shared by every
      // card on the settings page, and "connect a bot first" belongs next to
      // the button that was pressed, not under the profile form too.
      startTelegramLink: async () => {
        try {
          const { data } = await api.post<ITelegramLink>(AUTH_API.TELEGRAM_LINK);
          return { link: data };
        } catch (error) {
          return { error: extractErrorMessage(error) };
        }
      },

      unlinkTelegram: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.delete<IUser>(AUTH_API.TELEGRAM_LINK);
          set({ user: data, loading: false });
          return true;
        } catch (error) {
          set({ error: extractErrorMessage(error), loading: false });
          return false;
        }
      },

      // ── Keep the server's idea of the seller's language in step with the
      // UI, so Telegram alerts arrive in the language they read. Quiet on
      // purpose: no loading flag, no error banner — a failure here changes
      // nothing the seller can see, and the next switch tries again.
      syncLanguage: async (language) => {
        const { user } = get();
        if (!user || user.language === language) return;
        try {
          const { data } = await api.patch<IUser>(AUTH_API.ME, { language });
          set({ user: data });
        } catch {
          // Deliberately swallowed; see above.
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "apsara-auth", partialize: (s) => ({ user: s.user }) }
  )
);
