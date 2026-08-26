"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InventoryVariant {
  id: string;
  title: string;
  sku: string;
  stock: number;
  product: { id: string; name: string; slug: string };
}

export function InventoryTable({ variants }: { variants: InventoryVariant[] }) {
  const [rows, setRows] = useState(variants);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (v) =>
        v.product.name.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function saveStock(variant: InventoryVariant, value: number) {
    if (value === variant.stock) return;
    if (!Number.isInteger(value) || value < 0) return;

    setSavingId(variant.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al guardar");
      setRows((prev) => prev.map((r) => (r.id === variant.id ? { ...r, stock: value } : r)));
      setSavedId(variant.id);
      setTimeout(() => setSavedId((id) => (id === variant.id ? null : id)), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por producto, talla o SKU…"
          className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
      </div>

      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Talla</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((v) => (
              <tr key={v.id} className={cn(v.stock <= 2 && "bg-red-500/5")}>
                <td className="max-w-[260px] px-4 py-2.5">
                  <Link href={`/products/${v.product.slug}`} className="line-clamp-1 hover:text-accent">
                    {v.product.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-display font-semibold">{v.title}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{v.sku}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {savedId === v.id && (
                      <Check className="h-4 w-4 text-green-500" aria-label="Guardado" />
                    )}
                    {savingId === v.id && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                    <input
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      key={`${v.id}:${v.stock}`}
                      onBlur={(e) => saveStock(v, Number(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      disabled={savingId === v.id}
                      className={cn(
                        "w-20 rounded-md border bg-background px-2 py-1.5 text-right font-display font-bold outline-none transition-colors focus:border-accent",
                        v.stock <= 2 ? "border-red-500/60 text-red-400" : "border-border"
                      )}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin resultados para “{query}”.</p>
      )}
    </div>
  );
}
