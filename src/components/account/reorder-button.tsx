"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, RefreshCcw } from "lucide-react";
import { useCartStore } from "@/store/cart";

interface ReorderItem {
  variantId: string | null;
  productId: string | null;
  quantity: number;
}

type ProductPayload = {
  product?: {
    id: string;
    slug: string;
    name: string;
    price: number;
    images: string[];
    variants: { id: string; title: string; stock: number }[];
  };
};

export function ReorderButton({ items }: { items: ReorderItem[] }) {
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const unique = useMemo(() => {
    const map = new Map<string, ReorderItem>();
    for (const item of items) {
      if (!item.variantId || !item.productId) continue;
      const prev = map.get(item.variantId);
      map.set(item.variantId, prev ? { ...prev, quantity: prev.quantity + item.quantity } : item);
    }
    return [...map.values()];
  }, [items]);

  async function reorder() {
    if (unique.length === 0) return;
    setBusy(true);
    setDone(false);
    try {
      for (const line of unique) {
        const res = await fetch(`/api/products/${encodeURIComponent(line.productId!)}`).catch(() => null);
        if (!res || !res.ok) continue;
        const json = (await res.json().catch(() => null)) as ProductPayload | null;
        const product = json?.product;
        if (!product) continue;
        const variant =
          product.variants.find((v) => v.id === line.variantId && v.stock > 0) ??
          product.variants.find((v) => v.stock > 0);
        if (!variant) continue;
        add(
          {
            variantId: variant.id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            variantTitle: variant.title,
            price: product.price,
            image: product.images[0] ?? null,
            maxStock: variant.stock,
          },
          Math.min(line.quantity, variant.stock)
        );
      }
      setDone(true);
      window.setTimeout(() => openCart(), 500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={() => void reorder()}
      disabled={busy || done || unique.length === 0}
      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-accent/40 px-4 font-mono text-[11px] uppercase tracking-widest text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : done ? (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <RefreshCcw className="h-3.5 w-3.5" />
      )}
      {busy ? "Agregando..." : done ? "¡Al carrito!" : "Reordenar"}
    </button>
  );
}