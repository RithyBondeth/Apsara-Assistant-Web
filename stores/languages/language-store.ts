import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie } from "cookies-next/client";

export type TLanguage = "en" | "km";

type TLanguageState = {
  language: TLanguage;
  isHydrated: boolean;
  setLanguage: (language: TLanguage) => void;
  setHydrated: (v: boolean) => void;
};

export const useLanguageStore = create<TLanguageState>()(
  persist(
    (set) => ({
      language: "en",
      isHydrated: false,
      setLanguage: (language) => {
        set({ language });
        // Mirror to cookie so the server provider can read it on next request
        setCookie("language", language, { maxAge: 60 * 60 * 24 * 365 });
      },
      setHydrated: (v) => set({ isHydrated: v }),
    }),
    {
      name: "apsara-language",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
