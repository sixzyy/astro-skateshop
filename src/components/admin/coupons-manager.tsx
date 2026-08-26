"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  startsAt: string | null;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
  active: boolean;
}

const EMPTY_FORM = {
  code: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: "",
  minSubtotal: "",
  expiresAt: "",
  maxUses: "",
};

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) {
      const json = await res.json();
      setCoupons(json.coupons);
    }
    setLoading(false);
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load();
  }, []);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        active: true,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No se pudo crear el cupón");
      setForm({ ...EMPTY_FORM });
      setCoupons((prev) => [json.coupon, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (!res.ok) setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? coupon : c)));
  }

  async function remove(id: string) {
    const snapshot = coupons;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (!res.ok) setCoupons(snapshot);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createCoupon} className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest">Nuevo cupón</h2>
        {error && (
          <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Código
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="ASTRO10"
              required
              minLength={3}
              maxLength={24}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm uppercase text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tipo
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="PERCENT">Porcentaje (%)</option>
              <option value="FIXED">Monto fijo ($)</option>
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Valor
            <input
              type="number"
              min={0.01}
              step="0.01"
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === "PERCENT" ? "10" : "150"}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Compra mínima ($) — opcional
            <input
              type="number"
              min={0}
              step="1"
              value={form.minSubtotal}
              onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
              placeholder="500"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Expira — opcional
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Usos máximos — opcional
            <input
              type="number"
              min={1}
              step="1"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              placeholder="100"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-glow-cyan mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 font-display text-sm font-bold uppercase tracking-wide disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Crear cupón
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando cupones…</p>
      ) : coupons.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
          Aún no hay cupones. Crea el primero con el formulario de arriba.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Expira</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className={cn(!c.active && "opacity-50")}>
                  <td className="px-4 py-3 font-mono font-bold text-accent">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.minSubtotal > 0 ? formatPrice(c.minSubtotal) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.uses}/{c.maxUses ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("es-MX") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={cn(
                        "rounded-sm px-2 py-1 font-display text-xs font-bold uppercase",
                        c.active ? "bg-green-500/15 text-green-500" : "bg-zinc-500/15 text-zinc-400"
                      )}
                    >
                      {c.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(c.id)}
                      aria-label={`Eliminar ${c.code}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
