import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CurrencyState {
  code: string;
  rates: Record<string, number> | null;
  updated: number;
  setCode: (code: string) => void;
  setRates: (rates: Record<string, number>) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      code: "COP",
      rates: null,
      updated: 0,
      setCode: (code) => set({ code }),
      setRates: (rates) => set({ rates, updated: Date.now() }),
    }),
    {
      name: "astro-currency",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
