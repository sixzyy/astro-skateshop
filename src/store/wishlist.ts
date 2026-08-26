"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) =>
          state.items.some((i) => i.id === item.id)
            ? { items: state.items.filter((i) => i.id !== item.id) }
            : { items: [item, ...state.items] }
        ),
      has: (id) => get().items.some((i) => i.id === id),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    { name: "astro-wishlist" }
  )
);
