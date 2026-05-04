import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TLanguage = "en" | "km";

type TLanguageState = {
  language: TLanguage;
  setLanguage: (language: TLanguage) => void;
};

export const useLanguageStore = create<TLanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "apsara-language" },
  ),
);
