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
      aria-label={`Anadir ${product.name} al carrito`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground backdrop-blur transition-all duration-300 hover:border-border-active hover:text-foreground active:scale-95 cursor-pointer",
        added && "border-success/50 text-success",
        className
      )}
    >
      {added ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Plus className="h-3.5 w-3.5" strokeWidth={3} />}
      {added ? "Anadido" : "Anadir"}
    </button>
  );
}
