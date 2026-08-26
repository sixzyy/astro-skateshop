"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string };
}

const TABS = [
  { key: "PENDING", label: "Por moderar" },
  { key: "APPROVED", label: "Aprobadas" },
  { key: "ALL", label: "Todas" },
] as const;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm tracking-wide text-cta" aria-label={`${rating} de 5 estrellas`}>
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewsManager() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("PENDING");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(status: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?status=${status}`);
    if (res.ok) {
      const json = await res.json();
      setReviews(json.reviews);
    }
    setLoading(false);
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load(tab);
  }, [tab]);

  async function moderate(review: Review, approved: boolean) {
    setBusyId(review.id);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md border px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-colors",
              tab === t.key
                ? "border-accent bg-accent text-zinc-950"
                : "border-border text-muted-foreground hover:border-accent hover:text-accent"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando reseñas…
        </p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
          Nada por aquí en “{TABS.find((t) => t.key === tab)?.label}”.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="font-display text-sm font-bold">{r.name}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <a
                      href={`/products/${r.product.slug}`}
                      className="max-w-[220px] truncate text-xs text-accent hover:underline"
                    >
                      {r.product.name}
                    </a>
                  </div>
                  <p className="mt-2 break-words text-sm text-foreground/90">{r.comment}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {!r.approved && (
                    <>
                      <button
                        onClick={() => moderate(r, true)}
                        disabled={busyId === r.id}
                        aria-label="Aprobar reseña"
                        title="Aprobar"
                        className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2.5 py-1.5 text-xs font-bold uppercase text-green-500 transition-colors hover:bg-green-500/25 disabled:opacity-50"
                      >
                        {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Aprobar
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        disabled={busyId === r.id}
                        aria-label="Rechazar reseña"
                        title="Eliminar"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {r.approved && (
                    <button
                      onClick={() => remove(r.id)}
                      disabled={busyId === r.id}
                      aria-label="Eliminar reseña"
                      title="Eliminar"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
