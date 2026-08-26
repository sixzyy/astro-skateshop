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
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide">Datos personales</h3>
      <label className="mb-1 block text-xs text-muted-foreground">Nombre</label>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={saveName}
          disabled={busy || name.trim().length < 2}
          className={cn(
            "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 font-display text-xs font-bold uppercase tracking-wide text-zinc-950 hover:bg-accent-strong disabled:opacity-50",
            saved && "bg-emerald-500 text-zinc-950",
          )}
        >
          <Save className="h-3.5 w-3.5" /> {saved ? "Guardado" : "Guardar"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
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
      setMsg({ ok: true, text: "Contraseña actualizada ✓" });
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
        <KeyRound className="h-4 w-4 text-accent" /> Cambiar contraseña
      </h3>
      <input
        type="password"
        placeholder="Contraseña actual"
        value={currentPassword}
        onChange={(e) => setCurrent(e.target.value)}
        className="mb-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-accent"
      />
      <input
        type="password"
        placeholder="Nueva contraseña (8+ caracteres, con número)"
        value={newPassword}
        onChange={(e) => setNext(e.target.value)}
        className="mb-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-accent"
      />
      <button
        onClick={submit}
        disabled={!valid || busy}
        className="inline-flex h-9 cursor-pointer items-center rounded-md border border-accent px-4 font-display text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-zinc-950 disabled:opacity-50"
      >
        Actualizar contraseña
      </button>
      {msg && <p className={cn("mt-2 text-xs", msg.ok ? "text-emerald-400" : "text-red-400")}>{msg.text}</p>}
    </div>
  );
}
