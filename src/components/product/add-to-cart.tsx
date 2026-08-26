"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import type { ProductDTO } from "@/lib/types";

export function AddToCart({ product }: { product: ProductDTO }) {
  const firstAvailable = product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id ?? "";
  const [variantId, setVariantId] = useState(firstAvailable);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const currencyCode = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);

  const variant = product.variants.find((v) => v.id === variantId);
  const outOfStock = !variant || variant.stock <= 0;

  function handleAdd() {
    if (!variant || variant.stock <= 0) return;
    addItem(
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
      quantity
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 650);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-foreground-secondary">
          {product.category.name === "Ropa" ? "Talla" : "Medida"} —{" "}
          <span className="text-foreground">{variant?.title ?? "-"}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVariantId(v.id);
                setQuantity(1);
              }}
              disabled={v.stock <= 0}
              className={cn(
                "min-w-14 rounded-lg border px-3 py-2 font-display text-sm font-semibold transition-all cursor-pointer",
                v.id === variantId
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/30",
                v.stock <= 0 &&
                  "cursor-not-allowed border-border text-foreground-secondary/40 line-through opacity-60 hover:border-border"
              )}
              title={v.stock <= 0 ? "Sin stock" : `${v.stock} disponibles`}
            >
              {v.title}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest">
          {!variant || variant.stock <= 0 ? (
            <span className="text-red-400">Sin unidades</span>
          ) : variant.stock <= 3 ? (
            <span className="text-cta">Solo quedan {variant.stock}</span>
          ) : (
            <span className="text-emerald-400">En stock</span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center rounded-lg border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="inline-flex h-full w-11 items-center justify-center disabled:opacity-40 cursor-pointer"
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-display text-base font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(variant?.stock ?? 1, q + 1))}
            disabled={!variant || quantity >= variant.stock}
            className="inline-flex h-full w-11 items-center justify-center disabled:opacity-40 cursor-pointer"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {outOfStock ? (
          <div className="flex h-12 min-w-52 flex-1 flex-wrap items-center justify-between gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-red-400">Agotado</span>
            <a
              href={`mailto:hola@astroskate.mx?subject=${encodeURIComponent(
                "Notificar disponibilidad: " + product.name
              )}&body=${encodeURIComponent("Hola, quiero que me avisen cuando regrese a orbita este producto.")}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground-secondary transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Notificar
            </a>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={cn(
              "group/btn flex h-12 flex-1 min-w-52 items-center justify-center gap-2 rounded-lg bg-foreground font-display text-sm font-bold uppercase tracking-wide text-background transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer",
              added && "animate-pop"
            )}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" /> Agregado!
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 transition-transform group-hover/btn:-rotate-12" />
                Agregar — {formatMoney(product.price * quantity, currencyCode, rates)}
              </>
            )}
          </button>
        )}
      </div>

      {variant && variant.stock > 0 && variant.stock <= 3 && (
        <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
          Ultimas {variant.stock} piezas!
        </p>
      )}
    </div>
  );
}
