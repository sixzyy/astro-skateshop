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
        <PackageSearch className="mx-auto h-10 w-10 text-foreground-muted" strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight">Rastrea tu pedido</h1>
        <p className="mt-2 text-sm text-foreground-secondary">
          Escribe el numero que te dimos al confirmar la compra (ej. AST-MT7NSJF4IPX5).
        </p>
      </header>

      <form onSubmit={search} className="mt-8 flex gap-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value.toUpperCase())}
          placeholder="AST-XXXXXXXX"
          aria-label="Numero de orden"
          className="h-12 flex-1 border border-border rounded-xl bg-background-secondary px-4 font-mono text-sm uppercase tracking-wider outline-none transition-all duration-300 placeholder:text-foreground-muted focus:border-border-active"
        />
        <button
          type="submit"
          disabled={loading || !number.trim()}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-cta px-6 font-display text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-cta-hover hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Buscar
        </button>
      </form>

      {error && (
        <p className="mt-5 flex items-start gap-2 border border-error/20 rounded-xl bg-error/5 px-3 py-2.5 text-sm text-error">
          <XCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {result && (
        <section className="mt-8 border border-border rounded-xl bg-background-secondary/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-bold tracking-widest">{result.number}</h2>
            <span className="border border-border rounded-xl px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wider text-foreground-secondary">
              {result.statusLabel}
            </span>
          </div>

          <ol className="mt-6 flex items-start">
            {result.steps.map((step, i) => (
              <li key={step} className="relative flex flex-1 flex-col items-center">
                {i > 0 && (
                  <span
                    className={cn("absolute right-1/2 top-[13px] h-0.5 w-full", i <= currentIndex ? "bg-foreground" : "bg-border")}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center border-2 rounded-full font-mono text-xs",
                    i < currentIndex
                      ? "border-foreground bg-foreground text-background"
                      : i === currentIndex
                        ? "border-foreground bg-background text-foreground"
                        : "border-border bg-background text-foreground-muted"
                  )}
                >
                  {i < currentIndex ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "mt-2 px-1 text-center font-mono text-[9px] uppercase leading-tight tracking-widest sm:text-[10px]",
                    i <= currentIndex ? "text-foreground" : "text-foreground-muted"
                  )}
                >
                  {STEP_LABELS[step] ?? step}
                </span>
              </li>
            ))}
          </ol>

          {result.trackingNumber && result.status === "SHIPPED" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border border-border rounded-xl bg-background-secondary px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">Guia de rastreo</p>
                <p className="font-mono text-sm font-bold tracking-wider">{result.trackingNumber}</p>
              </div>
              <a
                href={trackUrl(result.trackingNumber, result.carrier)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center border border-border rounded-full px-4 font-display text-xs font-bold uppercase tracking-wide text-foreground-secondary transition-all duration-300 hover:border-border-active hover:text-foreground hover:shadow-sm"
              >
                Rastrear paquete &rarr;
              </a>
            </div>
          )}

          <ul className="mt-6 space-y-3 border-t border-border pt-4">
            {result.items.map((item, i) => (
              <li key={`${item.productName}-${i}`} className="flex items-center gap-3">
                <ProductImage
                  src={item.image ?? "/products/generic.svg"}
                  alt=""
                  className="h-11 w-11 border border-border rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{item.productName}</p>
                  <p className="text-xs text-foreground-secondary">
                    {item.variantTitle} x {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm">
            <span className="text-foreground-secondary">Destino: {result.city}</span>
            <span className="font-display text-base font-bold">{formatPrice(result.total)}</span>
          </div>
        </section>
      )}

      <p className="mt-8 text-center text-xs text-foreground-muted">
        Problemas con tu pedido?{" "}
        <Link href="/#contacto" className="underline underline-offset-4 hover:text-foreground">
          Escribenos por WhatsApp
        </Link>
      </p>
    </div>
  );
}
