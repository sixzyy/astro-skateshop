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
      <span className="text-foreground-secondary/20">{"★".repeat(5 - value)}</span>
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
  const [reviews] = useState(initialReviews);
  const [average] = useState(initialAverage);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

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
      if (!res.ok) throw new Error(json?.error ?? "No se pudo enviar la resena.");
      setComment("");
      setRating(0);
      setMessage({ ok: true, text: "Gracias! Tu resena se publicara en cuanto la revisemos." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-20" id="resenas">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Resenas</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 border border-border-subtle bg-background-secondary/50 px-3 py-1">
            <StarsRow value={Math.round(average ?? 0)} />
            <span className="font-display text-sm font-bold">{average}</span>
            <span className="text-xs text-foreground-secondary">({reviews.length})</span>
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {reviews.length === 0 ? (
            <p className="border border-dashed border-border px-5 py-10 text-center text-sm text-foreground-secondary/50">
              An no hay resenas. Se el primero!
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border border-border-subtle bg-background-secondary/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/10 font-display text-xs font-bold">
                        {r.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="font-display text-sm font-bold">{r.name}</span>
                      <StarsRow value={r.rating} />
                    </div>
                    <time className="font-mono text-[10px] uppercase tracking-widest text-foreground-secondary/50">
                      {new Date(r.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  </div>
                  <p className="mt-2 break-words text-sm leading-relaxed text-foreground-secondary">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="h-fit border border-border-subtle bg-background-secondary/50 p-5">
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest">Dejar mi resena</h3>

          <div className="mb-3 flex gap-1" role="radiogroup" aria-label="Calificacion">
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
                    (hover || rating) >= n ? "fill-cta text-cta" : "text-foreground-secondary/20"
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
            className="mb-2 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Que te parecio el producto?"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            className="w-full resize-y rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />

          {message && (
            <p
              className={cn(
                "mt-2 rounded-lg border px-3 py-2 text-xs",
                message.ok
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-red-500/20 bg-red-500/5 text-red-400"
              )}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar resena
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-foreground-secondary/50">
            Las resenas pasan por moderacion antes de publicarse.{" "}
            <Link href={`/products/${productSlug}`} className="underline underline-offset-4 hover:text-foreground">
              Ver producto
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
