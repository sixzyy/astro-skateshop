"use client";

import { ProductImage } from "@/components/ui/product-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers, Rotate3d, ShoppingCart, Expand, Check, Camera, Fullscreen, Image as ImageIcon, Link2 } from "lucide-react";
import { BoardScene } from "@/components/armador/board-scene";
import { wheelColorForId } from "@/components/armador/wheel";
import type { BoardConfig, PartKey } from "@/components/armador/config";
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
  initial?: Partial<Record<PartKey, string>>;
}

interface SetupState {
  deckId: string;
  trucksId: string;
  wheelsId: string;
  gripId: string;
}

const STORAGE_KEY = "astro-skateshop-armador/v1";

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

function loadInitial(list: ProductDTO[], urlId: string | undefined, storageId: string | undefined, fallback: string) {
  if (urlId && list.some((p) => p.id === urlId)) return urlId;
  if (storageId && list.some((p) => p.id === storageId)) return storageId;
  return fallback;
}

export function BoardBuilder({ decks, trucks, wheels, grips, initial }: Props) {
  const persisted = useMemo<SetupState | null>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SetupState) : null;
    } catch {
      return null;
    }
  }, []);

  const [deckId, setDeckId] = useState(() =>
    loadInitial(decks, initial?.decks, persisted?.deckId, decks[0]?.id ?? "")
  );
  const [trucksId, setTrucksId] = useState(() =>
    loadInitial(trucks, initial?.trucks, persisted?.trucksId, trucks[0]?.id ?? "")
  );
  const [wheelsId, setWheelsId] = useState(() =>
    loadInitial(wheels, initial?.wheels, persisted?.wheelsId, wheels[0]?.id ?? "")
  );
  const [gripId, setGripId] = useState(() =>
    loadInitial(grips, initial?.grips, persisted?.gripId, grips[0]?.id ?? "")
  );
  const [exploded, setExploded] = useState(false);
  const [spin, setSpin] = useState(true);
  const [showGraphic, setShowGraphic] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [flash, setFlash] = useState<PartKey | null>(null);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<PartKey, HTMLElement | null>>>({});
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addItem = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const currencyCode = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);

  const deck = decks.find((d) => d.id === deckId);
  const truckPair = trucks.find((t) => t.id === trucksId);
  const wheelSet = wheels.find((w) => w.id === wheelsId);
  const grip = grips.find((g) => g.id === gripId);

  useEffect(() => {
    const data: SetupState = { deckId, trucksId, wheelsId, gripId };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const url = new URL(window.location.href);
    url.searchParams.set("tabla", deckId);
    url.searchParams.set("trucks", trucksId);
    url.searchParams.set("ruedas", wheelsId);
    url.searchParams.set("grip", gripId);
    window.history.replaceState(null, "", url);
  }, [deckId, trucksId, wheelsId, gripId]);

  const config: BoardConfig = useMemo(() => {
    const deckWidthIn = deck ? (parseInches(deck.variants[0]?.title ?? "") ?? 8.0) : 8.0;
    const hangerIn = truckPair ? (parseInches(truckPair.variants[0]?.title ?? "") ?? 5.5) : 5.5;
    const wheelMm = wheelSet ? (parseInt(wheelSet.variants[0]?.title ?? "") || 53) : 53;
    const partLabels: { key: PartKey; name: string; price: number }[] = [];
    const push = (key: PartKey, product: ProductDTO | undefined) => {
      if (product) partLabels.push({ key, name: product.name, price: product.price });
    };
    push("decks", deck);
    push("trucks", truckPair);
    push("wheels", wheelSet);
    push("grips", grip);
    return {
      deckWidth: Math.min(0.95, Math.max(0.7, deckWidthIn / 10)),
      deckImage: deck?.images[0] ?? null,
      axleLen: Math.min(1.05, Math.max(0.6, (hangerIn + 1.8) / 10)),
      wheelRadius: Math.min(0.14, Math.max(0.075, (wheelMm / 254 / 2) * 1.15)),
      wheelColor: wheelSet ? wheelColorForId(wheelSet.id) : "#6fc8e9",
      hasGrip: Boolean(grip),
      exploded,
      autoRotate: spin,
      showGraphic,
      resetKey,
      labels: partLabels,
    };
  }, [deck, truckPair, wheelSet, grip, exploded, spin, showGraphic, resetKey]);

  const handleSelectPart = useCallback((part: PartKey) => {
    const el = sectionRefs.current[part];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setFlash(part);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1200);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      panelRef.current?.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      const map: Record<string, () => void> = {
        "1": () => handleSelectPart("decks"),
        "2": () => handleSelectPart("trucks"),
        "3": () => handleSelectPart("wheels"),
        "4": () => handleSelectPart("grips"),
        e: () => setExploded((v) => !v),
        r: () => setSpin((v) => !v),
        g: () => setShowGraphic((v) => !v),
        c: () => setResetKey((k) => k + 1),
        f: () => toggleFullscreen(),
      };
      map[k]?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSelectPart, toggleFullscreen]);

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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  const sections: { title: string; key: PartKey; items: ProductDTO[]; selected: string; onSelect: (id: string) => void }[] = [
    { title: "Tabla", key: "decks", items: decks, selected: deckId, onSelect: setDeckId },
    { title: "Trucks", key: "trucks", items: trucks, selected: trucksId, onSelect: setTrucksId },
    { title: "Ruedas", key: "wheels", items: wheels, selected: wheelsId, onSelect: setWheelsId },
    { title: "Grip", key: "grips", items: grips, selected: gripId, onSelect: setGripId },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// configurador orbital"}</span>
        <h1 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          Arma tu tabla <span className="text-stroke">en 3D</span>
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Elige cada componente y míralo montado en tiempo real. Haz clic sobre una pieza para seleccionarla.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="order-2 space-y-5 lg:order-1">
          {sections.map((section) => (
            <section
              key={section.key}
              ref={(el) => {
                sectionRefs.current[section.key] = el;
              }}
              className={cn(
                "rounded-lg border p-3 transition-all duration-300",
                flash === section.key ? "border-accent bg-accent/5 shadow-[0_0_18px_rgba(111,200,233,0.35)]" : "border-transparent"
              )}
            >
              <h2 className="mb-2 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Layers className="h-3.5 w-3.5 text-accent" /> {section.title}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">[{section.key === "decks" ? "1" : section.key === "trucks" ? "2" : section.key === "wheels" ? "3" : "4"}]</span>
              </h2>
              {section.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                  Sin productos disponibles aún.
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
                          "group relative overflow-hidden rounded-md border p-1.5 text-left transition-all cursor-pointer",
                          active
                            ? "border-accent bg-accent/10 shadow-[0_0_14px_rgba(111,200,233,0.25)]"
                            : "border-border hover:border-accent/50",
                          out && "cursor-not-allowed opacity-40 grayscale"
                        )}
                      >
                        <div className="img-cosmic relative mb-1 aspect-square overflow-hidden rounded-sm">
                          <ProductImage src={item.images[0]} alt={item.name} fill sizes="120px" className="object-cover" />
                        </div>
                        <p className="truncate text-[10px] font-semibold leading-tight">{item.name}</p>
                        <p className={cn("font-mono text-[10px]", active ? "text-accent" : "text-muted-foreground")}>
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
          <div
            ref={panelRef}
            className="panel-corners relative h-[52vh] overflow-hidden rounded-lg border border-accent/20 bg-[radial-gradient(ellipse_at_50%_120%,rgba(39,64,111,0.55),transparent_65%)] sm:h-[60vh] lg:h-[68vh]"
          >
            <BoardScene config={config} onSelectPart={handleSelectPart} />

            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3">
              <span className="rounded-sm border border-accent/40 bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-accent backdrop-blur">
                [ setup en vivo ]
              </span>
              <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setExploded((v) => !v)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur transition-colors",
                    exploded
                      ? "border-cta bg-cta/20 text-cta"
                      : "border-border bg-background/70 text-muted-foreground hover:text-accent"
                  )}
                >
                  <Expand className="h-3 w-3" /> Explotada
                </button>
                <button
                  onClick={() => setSpin((v) => !v)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur transition-colors",
                    spin
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-background/70 text-muted-foreground hover:text-accent"
                  )}
                >
                  <Rotate3d className="h-3 w-3" /> Girar
                </button>
                {deck?.images[0] && (
                  <button
                    onClick={() => setShowGraphic((v) => !v)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur transition-colors",
                      showGraphic
                        ? "border-accent/60 bg-background/70 text-accent"
                        : "border-border bg-background/70 text-muted-foreground hover:text-accent"
                    )}
                    title="Alternar logo/madera del deck"
                  >
                    <ImageIcon className="h-3 w-3" /> {showGraphic ? "Logo" : "Madera"}
                  </button>
                )}
                <button
                  onClick={() => setResetKey((k) => k + 1)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur transition-colors hover:text-accent"
                  title="Reiniciar cámara"
                >
                  <Camera className="h-3 w-3" /> Cámara
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur transition-colors hover:text-accent"
                  title="Pantalla completa"
                >
                  <Fullscreen className="h-3 w-3" /> Full
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2">
              <span className="rounded-sm border border-border/60 bg-background/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 backdrop-blur">
                1-4 · sec. · E explotar · R girar · G logo · C cámara · F full
              </span>
            </div>

            <span className="scanlines pointer-events-none absolute inset-0 opacity-30" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex-1">
              {missing.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Falta por elegir: <strong className="text-cta">{missing.map((m) => m.label).join(", ")}</strong>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Setup completo ·{" "}
                  <span className="font-mono font-bold text-white">{formatMoney(total, currencyCode, rates)}</span>{" "}
                  {shippingNote(total)}
                </p>
              )}
            </div>
            <button
              onClick={() => void copyLink()}
              disabled={missing.length > 0}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              title="Copiar enlace con tu setup"
            >
              {copied ? <Check className="h-4 w-4 text-cta" strokeWidth={3} /> : <Link2 className="h-4 w-4" />}
              {copied ? "¡Enlace copiado!" : "Compartir"}
            </button>
            <button
              onClick={addSetup}
              disabled={!allAvailable || added}
              className={cn(
                "btn-glow-cta inline-flex h-11 items-center gap-2 rounded-md bg-cta px-6 font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-cta-strong active:scale-[0.98] disabled:opacity-60",
                added && "animate-pop"
              )}
            >
              {added ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {added ? "¡Agregado!" : "Agregar setup completo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function shippingNote(total: number) {
  return total >= 999 ? "· ¡envío gratis!" : "· te falta para envío gratis";
}