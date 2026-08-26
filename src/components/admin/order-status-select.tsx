"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

const CARRIERS = [
  { value: "", label: "Paquetería…" },
  { value: "estafeta", label: "Estafeta" },
  { value: "dhl", label: "DHL" },
  { value: "fedex", label: "FedEx" },
  { value: "otros", label: "Otra" },
];

export function OrderStatusSelect({
  orderId,
  current,
  initialTracking,
  initialCarrier,
}: {
  orderId: string;
  current: string;
  initialTracking?: string | null;
  initialCarrier?: string | null;
}) {
  const router = useRouter();
  const [tracking, setTracking] = useState(initialTracking ?? "");
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState("");

  async function onChange(status: string) {
    setError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Error");
      return;
    }
    router.refresh();
  }

  async function saveGuia() {
    setError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingNumber: tracking.trim() || null,
        carrier: carrier || null,
        status: current,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Error al guardar la guía");
      return;
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        defaultValue={current}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-accent"
      >
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Nº de guía"
        className="h-9 w-32 rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-accent"
      />
      <select
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        className="h-9 cursor-pointer rounded-md border border-border bg-background px-1.5 text-xs outline-none focus:border-accent"
      >
        {CARRIERS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <button
        onClick={saveGuia}
        title="Guardar guía y notificar al cliente"
        className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-md border px-2 text-xs font-bold uppercase transition-colors ${
          savedFlash
            ? "border-emerald-500 text-emerald-400"
            : "border-accent text-accent hover:bg-accent hover:text-zinc-950"
        }`}
      >
        <PackageCheck className="h-3.5 w-3.5" />
        {savedFlash ? "Enviado" : "Enviar"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
