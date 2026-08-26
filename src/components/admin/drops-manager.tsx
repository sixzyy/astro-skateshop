"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { CalendarClock, ExternalLink, Loader2, PackageX, Rocket, Undo2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export interface DropProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  publishedAt: string;
  totalStock: number;
}

function useCountdown(iso: string) {
  const [left, setLeft] = useState<string>("");
  useEffect(() => {
    const target = new Date(iso).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setLeft("¡Ya se lanzó!");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLeft(d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [iso]);
  return left;
}

function DropCard({ drop, onSaved }: { drop: DropProduct; onSaved: () => void }) {
  const upcoming = new Date(drop.publishedAt) > new Date();
  const countdown = useCountdown(drop.publishedAt);
  const [dateValue, setDateValue] = useState(
    drop.publishedAt ? new Date(drop.publishedAt).toISOString().slice(0, 16) : ""
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function patchPublishedAt(value: string | null, successText: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/products/${drop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishedAt: value }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "No se pudo guardar.");
      setMessage({ ok: true, text: successText });
      onSaved();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setBusy(false);
    }
  }

  async function saveDate() {
    if (!dateValue) return;
    await patchPublishedAt(new Date(dateValue).toISOString(), "Fecha del drop actualizada.");
  }

  async function cancelDrop() {
    if (!confirm(`¿Quitar el drop de "${drop.name}"? Se publicará en la tienda de inmediato.`)) return;
    await patchPublishedAt(null, "Drop quitado. El producto ya está publicado en la tienda.");
  }

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex gap-3">
        <Link
          href={`/products/${drop.slug}`}
          className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background"
        >
          {drop.image && (
            <ProductImage src={drop.image} alt="" fill sizes="64px" className="object-cover" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-display text-sm font-bold">{drop.name}</p>
          <p className="font-display text-sm font-bold text-accent">{formatPrice(drop.price)}</p>
          <p className="mt-0.5 text-xs">
            {upcoming ? (
              <>
                <span className="text-cta">Lanza en {countdown}</span>
                <span className="text-muted-foreground"> · {new Date(drop.publishedAt).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Lanzado el {new Date(drop.publishedAt).toLocaleDateString("es-MX")}</span>
            )}
          </p>
        </div>
        {upcoming && drop.totalStock === 0 && (
          <span
            title="Sin stock: al lanzarse no se podrá comprar"
            className="flex shrink-0 items-center gap-1 self-start rounded-sm bg-red-500/15 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-red-400"
          >
            <PackageX className="h-3.5 w-3.5" /> Sin stock
          </span>
        )}
      </div>

      {upcoming && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <input
              type="datetime-local"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus:border-accent"
            />
          </label>
          <button
            type="button"
            onClick={() => void saveDate()}
            disabled={busy || !dateValue}
            className="inline-flex items-center gap-1.5 rounded-md border border-accent/50 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/10 disabled:opacity-40 cursor-pointer"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Guardar fecha
          </button>
          <button
            type="button"
            onClick={() => void cancelDrop()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40 cursor-pointer"
          >
            <Undo2 className="h-3.5 w-3.5" /> Quitar drop
          </button>
          <a
            href={`/products/${drop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent"
          >
            Ver página <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {message && (
        <p
          className={`mt-2 rounded-md border px-3 py-1.5 text-xs ${
            message.ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </li>
  );
}

export function DropsManager({ drops }: { drops: DropProduct[] }) {
  const [list, setList] = useState(drops);
  const now = new Date();
  const upcoming = list.filter((d) => new Date(d.publishedAt) > now);
  const past = list.filter((d) => new Date(d.publishedAt) <= now);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest">
          <Rocket className="h-4 w-4 text-cta" /> Próximos drops ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            No hay drops programados.{" "}
            <Link href="/admin/products/new" className="text-accent underline hover:text-white">
              Crea un producto
            </Link>{" "}
            y ponle fecha en el campo “Drop programado”.
          </div>
        ) : (
          <ul className="grid gap-3 xl:grid-cols-2">
            {upcoming.map((d) => (
              <DropCard
                key={d.id}
                drop={d}
                onSaved={() =>
                  setList((prev) => prev.filter((x) => x.id !== d.id))
                }
              />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Lanzados recientemente ({past.length})
          </h2>
          <ul className="grid gap-3 xl:grid-cols-2 opacity-75">
            {past.slice(0, 6).map((d) => (
              <DropCard key={d.id} drop={d} onSaved={() => setList((prev) => prev.filter((x) => x.id !== d.id))} />
            ))}
          </ul>
        </section>
      )}

      <p className="rounded-md border border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Cómo funciona:</strong> mientras el producto tiene fecha de drop,
        está oculto del catálogo pero su página muestra cuenta regresiva y el home un banner con contador.
        Al llegar la hora se publica solo — sin volver a guardar nada. “Quitar drop” lo publica de inmediato.
      </p>
    </div>
  );
}
