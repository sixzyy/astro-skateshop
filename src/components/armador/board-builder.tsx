"use client";

import { ProductImage } from "@/components/ui/product-image";
import { useMemo, useState } from "react";
import { Layers, Rotate3d, ShoppingCart, Expand, Check } from "lucide-react";
import { BoardScene, wheelColorForId, type BoardConfig } from "@/components/armador/board-scene";
import { useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

interface Props {
  decks: ProductDTO[];
  trucks: ProductDTO[];
  wheels: ProductDTO[];
  grips: ProductDTO[];
}

function firstInStock(p: ProductDTO) {
  return p.variants.find((v) => v.stock > 0) ?? null;
}

function parseInches(title: string): number | null {
  const m = title.match(/([\d.]+)\s*(?:in|"|″|pulgadas?)/i);
  if (m) return parseFloat(m[1]);
  const mm = title.match(/(\d+)\s*mm/i);
  if (mm) return parseInt(mm[1]) / 25.4;
  return null;
}

export function BoardBuilder({ decks, trucks, wheels, grips }: Props) {
  const [deckId, setDeckId] = useState(decks[0]?.id ?? "");
  const [trucksId, setTrucksId] = useState(trucks[0]?.id ?? "");
  const [wheelsId, setWheelsId] = useState(wheels[0]?.id ?? "");
  const [gripId, setGripId] = useState(grips[0]?.id ?? "");
  const [exploded, setExploded] = useState(false);
  const [spin, setSpin] = useState(true);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const currencyCode = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);

  const deck = decks.find((d) => d.id === deckId);
  const truckPair = trucks.find((t) => t.id === trucksId);
  const wheelSet = wheels.find((w) => w.id === wheelsId);
  const grip = grips.find((g) => g.id === gripId);

  const config: BoardConfig = useMemo(() => {
    const deckWidthIn = deck ? (parseInches(deck.variants[0]?.title ?? "") ?? 8.0) : 8.0;
    const hangerIn = truckPair ? (parseInches(truckPair.variants[0]?.title ?? "") ?? 5.5) : 5.5;
    const wheelMm = wheelSet ? (parseInt(wheelSet.variants[0]?.title ?? "") || 53) : 53;
    return {
      deckWidth: Math.min(0.95, Math.max(0.7, deckWidthIn / 10)),
      deckImage: deck?.images[0] ?? null,
      axleLen: Math.min(1.05, Math.max(0.6, (hangerIn + 1.8) / 10)),
      wheelRadius: Math.min(0.14, Math.max(0.075, wheelMm / 254 / 2 * 1.15)),
      wheelColor: wheelSet ? wheelColorForId(wheelSet.id) : "#00f0ff",
      hasGrip: Boolean(grip),
      exploded,
      autoRotate: spin,
    };
  }, [deck, truckPair, wheelSet, grip, exploded, spin]);

  const parts = [
    { product: deck, label: "Tabla" },
    { product: truckPair, label: "Trucks" },
    { product: wheelSet, label: "Ruedas" },
    { product: grip, label: "Grip" },
  ];
  const missing = parts.filter((p) => !p.product);
  const total = parts.reduce((acc, p) => acc + (p.product?.price ?? 0), 0);
  const allAvailable = parts.every((p) => p.product && firstInStock(p.product));

  function addSetup() {
    for (const { product } of parts) {
      if (!product) continue;
      const variant = firstInStock(product);
      if (!variant) continue;
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
        1
      );
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 650);
  }

  const sections = [
    { title: "Tabla", items: decks, selected: deckId, onSelect: setDeckId },
    { title: "Trucks", items: trucks, selected: trucksId, onSelect: setTrucksId },
    { title: "Ruedas", items: wheels, selected: wheelsId, onSelect: setWheelsId },
    { title: "Grip", items: grips, selected: gripId, onSelect: setGripId },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-secondary/50">Configurador</span>
        <h1 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Arma tu tabla
        </h1>
        <p className="mt-2 max-w-lg text-sm text-foreground-secondary">
          Elige cada componente y mimalo montado en tiempo real. Giralo, explotalo y despega.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="order-2 space-y-5 lg:order-1">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-foreground-secondary">
                <Layers className="h-3.5 w-3.5 text-foreground-secondary/50" /> {section.title}
              </h2>
              {section.items.length === 0 ? (
                <p className="border border-dashed border-border px-3 py-2 text-xs text-foreground-secondary/50">
                  Sin productos disponibles aun.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {section.items.map((item) => {
                    const active = item.id === section.selected;
                    const out = !firstInStock(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => !out && section.onSelect(item.id)}
                        disabled={out}
                        title={out ? "Sin stock" : item.name}
                        className={cn(
                          "group relative overflow-hidden rounded-lg border p-1.5 text-left transition-all cursor-pointer",
                          active
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/20",
                          out && "cursor-not-allowed opacity-40 grayscale"
                        )}
                      >
                        <div className="relative mb-1 aspect-square overflow-hidden rounded-md">
                          <ProductImage src={item.images[0]} alt={item.name} fill sizes="120px" className="object-cover" />
                        </div>
                        <p className="truncate text-[10px] font-semibold leading-tight">{item.name}</p>
                        <p className={cn("font-mono text-[10px]", active ? "text-foreground" : "text-foreground-secondary/60")}>
                          {formatMoney(item.price, currencyCode, rates)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </aside>

        <div className="order-1 lg:order-2">
          <div className="relative h-[52vh] overflow-hidden rounded-lg border border-border bg-background-secondary sm:h-[60vh] lg:h-[68vh]">
            <BoardScene config={config} />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3">
              <span className="rounded-md border border-border bg-background-secondary/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground-secondary/60 backdrop-blur">
                Setup en vivo
              </span>
              <div className="pointer-events-auto flex gap-2">
                <button
                  onClick={() => setExploded((v) => !v)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur transition-colors",
                    exploded
                      ? "border-cta bg-cta/10 text-cta"
                      : "border-border bg-background-secondary/80 text-foreground-secondary hover:text-foreground"
                  )}
                >
                  <Expand className="h-3 w-3" /> Explotada
                </button>
                <button
                  onClick={() => setSpin((v) => !v)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur transition-colors",
                    spin
                      ? "border-foreground/30 bg-foreground/10 text-foreground"
                      : "border-border bg-background-secondary/80 text-foreground-secondary"
                  )}
                >
                  <Rotate3d className="h-3 w-3" /> Girar
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border border-border-subtle bg-background-secondary/50 p-4">
            <div className="flex-1">
              {missing.length > 0 ? (
                <p className="text-sm text-foreground-secondary">
                  Falta por elegir: <strong className="text-cta">{missing.map((m) => m.label).join(", ")}</strong>
                </p>
              ) : (
                <p className="text-sm text-foreground-secondary">
                  Setup completo ·{" "}
                  <span className="font-mono font-bold text-foreground">{formatMoney(total, currencyCode, rates)}</span>{" "}
                  {shippingNote(total)}
                </p>
              )}
            </div>
            <button
              onClick={addSetup}
              disabled={!allAvailable || added}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-6 font-display text-sm font-bold uppercase tracking-wide text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60",
                added && "animate-pop"
              )}
            >
              {added ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {added ? "Agregado!" : "Agregar setup completo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function shippingNote(total: number) {
  return total >= 999 ? "· envio gratis" : "· te falta para envio gratis";
}
