"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, MailCheck } from "lucide-react";

interface AlertGroup {
  variant: {
    id: string;
    title: string;
    sku: string;
    product: { id: string; name: string; slug: string };
  };
  emails: string[];
  since: string;
}

export function StockAlertsList() {
  const [groups, setGroups] = useState<AlertGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/stock-alerts");
    if (res.ok) {
      const json = await res.json();
      setGroups(json.groups);
    }
    setLoading(false);
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load();
  }, []);

  async function copyEmails(group: AlertGroup) {
    await navigator.clipboard.writeText(group.emails.join(", ")).catch(() => null);
    setCopiedId(group.variant.id);
    setTimeout(() => setCopiedId((id) => (id === group.variant.id ? null : id)), 1600);
  }

  async function markDone(group: AlertGroup) {
    setDoneId(group.variant.id);
    try {
      const res = await fetch(`/api/admin/stock-alerts?variantId=${group.variant.id}`, { method: "DELETE" });
      if (res.ok) setGroups((prev) => prev.filter((g) => g.variant.id !== group.variant.id));
    } finally {
      setDoneId(null);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando alertas…
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
        No hay clientes esperando restock. Cuando alguien deje su correo en una talla agotada, aparecerá aquí.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {groups.map((g) => (
        <li key={g.variant.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">
                <Link href={`/products/${g.variant.product.slug}`} className="hover:text-accent">
                  {g.variant.product.name}
                </Link>{" "}
                — {g.variant.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {g.emails.length} cliente{g.emails.length === 1 ? "" : "s"} esperando desde{" "}
                {new Date(g.since).toLocaleDateString("es-MX")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => copyEmails(g)}
                title="Copiar correos"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-colors hover:border-accent hover:text-accent"
              >
                {copiedId === g.variant.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                Correos
              </button>
              <button
                onClick={() => markDone(g)}
                disabled={doneId === g.variant.id}
                title="Marcar como notificado (tras reponer stock)"
                className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
              >
                {doneId === g.variant.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MailCheck className="h-3.5 w-3.5" />}
                Listo
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
