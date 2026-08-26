"use client";

import { useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveName() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide">Datos personales</h3>
      <label className="mb-1 block text-xs text-foreground-secondary">Nombre</label>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-background-secondary px-3 text-sm outline-none transition-all duration-300 focus:border-border-active"
        />
        <button
          onClick={saveName}
          disabled={busy || name.trim().length < 2}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-cta px-4 font-display text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-lg active:scale-[0.98] disabled:opacity-50",
            saved && "bg-success",
          )}
        >
          <Save className="h-3.5 w-3.5" /> {saved ? "Guardado" : "Guardar"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
      <PasswordForm />
    </div>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cambiar");
      setMsg({ ok: true, text: "Contrasena actualizada" });
      setCurrent("");
      setNext("");
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBusy(false);
    }
  }

  const valid = currentPassword.length >= 8 && newPassword.length >= 8 && /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword);

  return (
    <div className="mt-6 border-t border-border pt-5">
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
        <KeyRound className="h-4 w-4 text-foreground-muted" /> Cambiar contrasena
      </h3>
      <input
        type="password"
        placeholder="Contrasena actual"
        value={currentPassword}
        onChange={(e) => setCurrent(e.target.value)}
        className="mb-2 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm outline-none transition-all duration-300 focus:border-border-active"
      />
      <input
        type="password"
        placeholder="Nueva contrasena (8+ caracteres, con numero)"
        value={newPassword}
        onChange={(e) => setNext(e.target.value)}
        className="mb-2 h-10 w-full rounded-xl border border-border bg-background-secondary px-3 text-sm outline-none transition-all duration-300 focus:border-border-active"
      />
      <button
        onClick={submit}
        disabled={!valid || busy}
        className="inline-flex h-9 cursor-pointer items-center rounded-full border border-border px-4 font-display text-xs font-bold uppercase tracking-wide text-foreground-secondary transition-all duration-300 hover:border-border-active hover:text-foreground hover:shadow-sm disabled:opacity-50"
      >
        Actualizar contrasena
      </button>
      {msg && <p className={cn("mt-2 text-xs", msg.ok ? "text-success" : "text-error")}>{msg.text}</p>}
    </div>
  );
}
