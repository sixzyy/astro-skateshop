"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Address = {
  id: string;
  label: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string | null;
  isDefault: boolean;
};

const EMPTY = { label: "Casa", name: "", address: "", city: "", state: "", postalCode: "", phone: "", isDefault: false };

export function AddressesManager({ initial }: { initial: Address[] }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const valid =
    form.name.trim().length >= 2 &&
    form.address.trim().length >= 5 &&
    form.city.trim().length >= 2 &&
    form.state.trim().length >= 2 &&
    form.postalCode.trim().length >= 3;

  function openNew() {
    setForm({ ...EMPTY });
    setError("");
    setEditing("new");
  }

  function openEdit(a: Address) {
    setForm({
      label: a.label,
      name: a.name,
      address: a.address,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      phone: a.phone ?? "",
      isDefault: a.isDefault,
    });
    setError("");
    setEditing(a.id);
  }

  async function save() {
    if (!valid) return;
    setBusy(true);
    setError("");
    try {
      const url = editing === "new" ? "/api/account/addresses" : `/api/account/addresses/${editing}`;
      const res = await fetch(url, {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      const refreshed = await fetch("/api/account/addresses").then((r) => r.json());
      setList(refreshed.addresses);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Eliminar esta direccion?")) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (res.ok) setList((l) => l.filter((a) => a.id !== id));
  }

  async function makeDefault(id: string) {
    const res = await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      setList((l) => l.map((a) => ({ ...a, isDefault: a.id === id })));
    }
  }

  return (
    <div className="border border-border bg-background-secondary/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <MapPin className="h-4 w-4 text-foreground-disabled" /> Mis direcciones
        </h3>
        {editing === null && list.length < 10 && (
          <button
            onClick={openNew}
            className="inline-flex h-8 cursor-pointer items-center gap-1 border border-border px-3 text-xs font-bold text-foreground-secondary hover:border-border-active hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        )}
      </div>

      {editing !== null ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input value={form.label} onChange={set("label")} placeholder="Etiqueta (Casa, Oficina...)" className="address-field" />
            <input value={form.name} onChange={set("name")} placeholder="Nombre de quien recibe *" className="address-field" />
          </div>
          <input value={form.address} onChange={set("address")} placeholder="Calle y numero *" className="address-field" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input value={form.city} onChange={set("city")} placeholder="Ciudad *" className="address-field" />
            <input value={form.state} onChange={set("state")} placeholder="Estado *" className="address-field" />
            <input value={form.postalCode} onChange={set("postalCode")} placeholder="C.P. *" className="address-field" />
          </div>
          <div className="flex items-center gap-3">
            <input value={form.phone} onChange={set("phone")} placeholder="Telefono (opcional)" className="address-field flex-1" />
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground-secondary">
              <input type="checkbox" checked={form.isDefault} onChange={set("isDefault")} className="accent-foreground" />
              Predeterminada
            </label>
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={!valid || busy}
              className="inline-flex h-9 items-center bg-cta px-5 font-display text-xs font-bold uppercase tracking-wide text-white hover:bg-cta-hover disabled:opacity-50"
            >
              Guardar direccion
            </button>
            <button
              onClick={() => setEditing(null)}
              className="inline-flex h-9 cursor-pointer items-center gap-1 border border-border px-4 text-xs text-foreground-secondary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground-disabled">
          Sin direcciones guardadas.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((a) => (
            <li key={a.id} className={cn("flex items-start justify-between gap-3 border p-3", a.isDefault ? "border-border-active bg-foreground/5" : "border-border")}>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {a.label}
                  {a.isDefault && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground-disabled">
                      <Star className="h-3 w-3" /> Predeterminada
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-foreground-secondary">
                  {a.name} . {a.address}, {a.city}, {a.state}, C.P. {a.postalCode}
                  {a.phone ? ` . ${a.phone}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!a.isDefault && (
                  <button onClick={() => makeDefault(a.id)} title="Predeterminar" className="cursor-pointer p-1.5 text-foreground-disabled hover:text-foreground">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => openEdit(a)} title="Editar" className="cursor-pointer p-1.5 text-foreground-disabled hover:text-foreground">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(a.id)} title="Eliminar" className="cursor-pointer p-1.5 text-foreground-disabled hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{`.address-field{height:2.5rem;width:100%;border:1px solid var(--border,#1a1d26);background:var(--background-secondary,#0b0d12);padding:0 .75rem;font-size:.875rem;outline:none;transition:border-color .2s}.address-field:focus{border-color:var(--border-active,#40465d)}`}</style>
    </div>
  );
}
