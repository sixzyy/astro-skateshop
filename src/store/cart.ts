"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantTitle: string;
  price: number;
  image: string | null;
  maxStock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          };
        }),

      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),

      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "astro-cart", partialize: (s) => ({ items: s.items }) }
  )
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}
