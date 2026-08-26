"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

interface SettingsState {
  freeShippingThreshold: string;
  shippingFlat: string;
  announcement: string;
  whatsappNumber: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

const EMPTY: SettingsState = {
  freeShippingThreshold: "999",
  shippingFlat: "149",
  announcement: "",
  whatsappNumber: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
};

export function SettingsForm() {
  const [state, setState] = useState<SettingsState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setState({ ...EMPTY, ...json.settings }))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      setMessage({ ok: true, text: "Ajustes guardados. La tienda ya los usa." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando ajustes…
      </p>
    );
  }

  const field =
    "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
  const label = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <form onSubmit={save} className="space-y-6">
      {message && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            message.ok
              ? "border-green-500/40 bg-green-500/10 text-green-500"
              : "border-red-500/40 bg-red-500/10 text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest">Envíos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Envío gratis a partir de ($ MXN)
            <input
              type="number"
              min={0}
              step={1}
              value={state.freeShippingThreshold}
              onChange={(e) => setState({ ...state, freeShippingThreshold: e.target.value })}
              className={field}
            />
          </label>
          <label className={label}>
            Costo de envío estándar ($ MXN)
            <input
              type="number"
              min={0}
              step={1}
              value={state.shippingFlat}
              onChange={(e) => setState({ ...state, shippingFlat: e.target.value })}
              className={field}
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest">Anuncio global</h2>
        <label className={label}>
          Texto del banner (vacío = oculto)
          <input
            type="text"
            maxLength={140}
            value={state.announcement}
            onChange={(e) => setState({ ...state, announcement: e.target.value })}
            placeholder="Envío gratis este fin de largo 🛹 (sin emojis mejor)"
            className={field}
          />
        </label>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest">Contacto y redes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            WhatsApp (formato internacional, sin +)
            <input
              type="text"
              value={state.whatsappNumber}
              onChange={(e) => setState({ ...state, whatsappNumber: e.target.value })}
              placeholder="5215512345678"
              className={`${field} font-mono`}
            />
          </label>
          <label className={label}>
            Instagram
            <input
              type="url"
              value={state.instagramUrl}
              onChange={(e) => setState({ ...state, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/…"
              className={field}
            />
          </label>
          <label className={label}>
            TikTok
            <input
              type="url"
              value={state.tiktokUrl}
              onChange={(e) => setState({ ...state, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@…"
              className={field}
            />
          </label>
          <label className={label}>
            YouTube
            <input
              type="url"
              value={state.youtubeUrl}
              onChange={(e) => setState({ ...state, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/@…"
              className={field}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn-glow-cyan inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar ajustes
      </button>
    </form>
  );
}
