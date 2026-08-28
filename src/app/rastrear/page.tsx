"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { Check, Loader2, PackageSearch, XCircle } from "lucide-react";
import { formatPrice, trackUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TrackResult {
  number: string;
  status: string;
  statusLabel: string;
  total: number;
  currency: string;
  createdAt: string;
  city: string;
  trackingNumber: string | null;
  carrier: string | null;
  items: { productName: string; variantTitle: string; quantity: number; image: string | null }[];
  steps: readonly string[];
}

const STEP_LABELS: Record<string, string> = {
  PENDING: "Pedido recibido",
  PAID: "Pago confirmado",
  SHIPPED: "En camino",
  DELIVERED: "Entregado",
};

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const value = number.trim().toUpperCase();
    if (!value) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(value)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "No se pudo consultar la orden.");
      setResult(json.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  const currentIndex = result ? result.steps.indexOf(result.status) : -1;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <header className="text-center">
        <PackageSearch className="mx-auto h-12 w-12 text-accent" strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight">Rastrea tu pedido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escribe el número que te dimos al confirmar la compra (ej. AST-MT7NSJF4IPX5).
        </p>
      </header>

      <form onSubmit={search} className="mt-8 flex gap-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value.toUpperCase())}
          placeholder="AST-XXXXXXXX"
          aria-label="Número de orden"
          className="h-12 flex-1 rounded-md border border-border bg-card px-4 font-mono text-sm uppercase tracking-wider outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !number.trim()}
          className="btn-glow-cyan inline-flex h-12 items-center gap-2 rounded-md px-6 font-display text-sm font-bold uppercase tracking-wide disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Buscar
        </button>
      </form>

      {error && (
        <p className="mt-5 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          <XCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {result && (
        <section className="animate-fade-up mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-bold tracking-widest">{result.number}</h2>
            <span className="rounded-sm bg-accent/15 px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider text-accent">
              {result.statusLabel}
            </span>
          </div>

          <ol className="mt-6 flex items-start">
            {result.steps.map((step, i) => (
              <li key={step} className="relative flex flex-1 flex-col items-center">
                {i > 0 && (
                  <span
                    className={cn("absolute right-1/2 top-[13px] h-0.5 w-full", i <= currentIndex ? "bg-accent" : "bg-border")}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-xs",
                    i < currentIndex
                      ? "border-accent bg-accent text-zinc-950"
                      : i === currentIndex
                        ? "border-accent bg-background text-accent shadow-[0_0_12px_rgba(111,200,233,0.5)]"
                        : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {i < currentIndex ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "mt-2 px-1 text-center font-mono text-[9px] uppercase leading-tight tracking-widest sm:text-[10px]",
                    i <= currentIndex ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[step] ?? step}
                </span>
              </li>
            ))}
          </ol>

          {result.trackingNumber && result.status === "SHIPPED" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Guía de rastreo</p>
                <p className="font-mono text-sm font-bold tracking-wider text-accent">{result.trackingNumber}</p>
              </div>
              <a
                href={trackUrl(result.trackingNumber, result.carrier)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-md border border-accent px-4 font-display text-xs font-bold uppercase tracking-wide text-accent hover:bg-accent hover:text-zinc-950"
              >
                Rastrear paquete →
              </a>
            </div>
          )}

          <ul className="mt-6 space-y-3 border-t border-border pt-4">
            {result.items.map((item, i) => (
              <li key={`${item.productName}-${i}`} className="flex items-center gap-3">
                <ProductImage
                  src={item.image ?? "/products/generic.svg"}
                  alt=""
                  className="h-11 w-11 rounded-md border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantTitle} × {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Destino: {result.city}</span>
            <span className="font-display text-base font-bold text-accent">{formatPrice(result.total)}</span>
          </div>
        </section>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        ¿Problemas con tu pedido?{" "}
        <Link href="/#contacto" className="text-accent underline hover:text-white">
          Escríbenos por WhatsApp
        </Link>{" "}
        y te ayudamos.
      </p>
    </div>
  );
}
