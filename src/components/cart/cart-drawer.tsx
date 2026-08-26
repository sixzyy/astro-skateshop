"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { useSettings } from "@/hooks/use-settings";
import { formatMoney } from "@/lib/currency";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const remove = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const currencyCode = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);
  const settings = useSettings();

  if (!isOpen) return null;

  const subtotal = cartSubtotal(items);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={close} />
      <aside className="animate-slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide">
            Tu carrito ({items.length})
          </h2>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="inline-flex h-8 w-8 items-center justify-center text-foreground-secondary transition-colors hover:bg-background-secondary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-foreground-disabled" strokeWidth={1.2} />
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-foreground-disabled">
              Tu carrito esta vacio
            </p>
            <Link
              href="/products"
              onClick={close}
              className="bg-cta px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-cta-hover"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <Link href={`/products/${item.slug}`} onClick={close} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image ?? "/products/generic.svg"} alt={item.name} className="h-20 w-20 border border-border object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={close}
                        className="line-clamp-1 font-display text-sm font-bold uppercase tracking-tight transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-foreground-secondary">{item.variantTitle}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-border">
                        <button
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40 cursor-pointer"
                          aria-label="Disminuir"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40 cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-bold">
                        {formatMoney(item.price * item.quantity, currencyCode, rates)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(item.variantId)}
                    className="self-start p-1 text-foreground-disabled transition-colors hover:text-error cursor-pointer"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-foreground-secondary">Subtotal</span>
                <span className="font-display font-bold">{formatMoney(subtotal, currencyCode, rates)}</span>
              </div>
              <p className="mb-3 text-xs text-foreground-disabled">
                {subtotal >= settings.freeShippingThreshold
                  ? "Envio gratis incluido."
                  : `Envio gratis a partir de ${formatMoney(settings.freeShippingThreshold, currencyCode, rates)}`}
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full bg-cta py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-cta-hover active:scale-[0.99]"
              >
                Ir a pagar
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
