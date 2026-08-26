"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserX, UserCheck } from "lucide-react";

export function CustomerActions({ customerId, active, isSelf }: { customerId: string; active: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function toggleActive() {
    if (!confirm(active ? "¿Desactivar esta cuenta? El cliente no podrá iniciar sesión." : "¿Reactivar esta cuenta?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Error");
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    const newPassword = prompt("Nueva contraseña para el cliente (mínimo 8 caracteres, con letras y números):");
    if (!newPassword) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Error");
      setMsg({ ok: true, text: "Contraseña actualizada ✓" });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={resetPassword}
          disabled={busy}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-accent px-3 font-display text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-zinc-950 disabled:opacity-50"
        >
          <KeyRound className="h-3.5 w-3.5" /> Resetear contraseña
        </button>
        {!isSelf && (
          <button
            onClick={toggleActive}
            disabled={busy}
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-3 font-display text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${
              active
                ? "border-red-500/60 text-red-400 hover:bg-red-500 hover:text-zinc-950"
                : "border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950"
            }`}
          >
            {active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {active ? "Desactivar" : "Reactivar"}
          </button>
        )}
      </div>
      {isSelf && <span className="text-[11px] text-muted-foreground">No puedes desactivar tu propia cuenta.</span>}
      {msg && <span className={`text-xs ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</span>}
    </div>
  );
}
