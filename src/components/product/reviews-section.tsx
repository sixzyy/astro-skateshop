"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewDTO {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

function StarsRow({ value }: { value: number }) {
  return (
    <span className="text-sm tracking-wide text-cta" aria-label={`${value} de 5 estrellas`}>
      {"★".repeat(value)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function ReviewsSection({
  productId,
  productSlug,
  initialReviews,
  initialAverage,
}: {
  productId: string;
  productSlug: string;
  initialReviews: ReviewDTO[];
  initialAverage: number | null;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [average, setAverage] = useState(initialAverage);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Prefill the name for logged-in users.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user?.name && setName((prev) => prev || d.user.name))
      .catch(() => null);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!rating) {
      setMessage({ ok: false, text: "Selecciona de 1 a 5 estrellas." });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, rating, comment }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "No se pudo enviar la reseña.");
      setComment("");
      setRating(0);
      setMessage({ ok: true, text: "¡Gracias! Tu reseña se publicará en cuanto la revisemos." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-20" id="resenas">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Reseñas</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1">
            <StarsRow value={Math.round(average ?? 0)} />
            <span className="font-display text-sm font-bold">{average}</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {reviews.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              Aún no hay reseñas de este producto. ¡Sé el primero en despegar!
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 font-display text-xs font-bold text-accent">
                        {r.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="font-display text-sm font-bold">{r.name}</span>
                      <StarsRow value={r.rating} />
                    </div>
                    <time className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  </div>
                  <p className="mt-2 break-words text-sm leading-relaxed text-foreground/90">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="h-fit rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest">Dejar mi reseña</h3>

          <div className="mb-3 flex gap-1" role="radiogroup" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="cursor-pointer p-0.5"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    (hover || rating) >= n ? "fill-cta text-cta" : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            minLength={2}
            maxLength={60}
            className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué te pareció el producto?"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />

          {message && (
            <p
              className={cn(
                "mt-2 rounded-md border px-3 py-2 text-xs",
                message.ok
                  ? "border-green-500/40 bg-green-500/10 text-green-500"
                  : "border-red-500/40 bg-red-500/10 text-red-500"
              )}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="btn-glow-cyan mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar reseña
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            Las reseñas pasan por moderación antes de publicarse.{" "}
            <Link href={`/products/${productSlug}`} className="underline hover:text-accent">
              Ver producto
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
