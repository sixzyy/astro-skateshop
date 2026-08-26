"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

export function QuickAdd({ product, className }: { product: ProductDTO; className?: string }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.add);
  const variant = product.variants.find((v) => v.stock > 0);

  if (!variant) return null;

  function onAdd() {
    addItem(
      {
        variantId: variant!.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantTitle: variant!.title,
        price: product.price,
        image: product.images[0] ?? null,
        maxStock: variant!.stock,
      },
      1
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Añadir ${product.name} al carrito`}
      className={cn(
        "btn-glow-cyan inline-flex items-center gap-1.5 rounded-md border border-accent/70 bg-background/90 px-3 py-2 font-display text-[11px] font-bold uppercase tracking-wider text-accent backdrop-blur transition-all hover:bg-accent hover:text-zinc-950 active:scale-95 cursor-pointer",
        added && "border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-zinc-950",
        className
      )}
    >
      {added ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5" strokeWidth={3} />}
      {added ? "Añadido" : "Añadir"}
    </button>
  );
}
