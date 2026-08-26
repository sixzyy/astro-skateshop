"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

function parts(ms: number) {
  const total = Math.max(Math.floor(ms / 1000), 0);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="min-w-[3rem] rounded-lg bg-background-secondary px-2.5 py-2 sm:min-w-[3.8rem] sm:px-3 sm:py-2.5">
        <span className="font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
          {String(value).padStart(2, "0")}
        </span>
      </span>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
        {label}
      </span>
    </span>
  );
}

export function DropBanner({ name, slug, date }: { name: string; slug: string; date: string }) {
  const target = new Date(date).getTime();
  const [left, setLeft] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (left <= 0) return null;

  const { days, hours, minutes, seconds } = parts(left);

  return (
    <div className="mx-auto mb-6 mt-6 w-[calc(100%-2rem)] max-w-7xl sm:w-full">
      <Link
        href={`/products/${slug}`}
        className="group block rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-border-active hover:shadow-sm sm:p-6"
      >
        {/* Top */}
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cta-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cta">
            <Star className="h-3 w-3 fill-cta text-cta" />
            Proximo drop
          </span>
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </div>

        {/* Countdown */}
        <div className="flex items-start justify-center gap-2 sm:gap-3" aria-label={`Faltan ${days} dias ${hours} horas ${minutes} minutos ${seconds} segundos`}>
          <CountdownCell value={days} label="dias" />
          <span className="mt-2.5 text-sm text-foreground-muted">:</span>
          <CountdownCell value={hours} label="hrs" />
          <span className="mt-2.5 text-sm text-foreground-muted">:</span>
          <CountdownCell value={minutes} label="min" />
          <span className="mt-2.5 text-sm text-foreground-muted">:</span>
          <CountdownCell value={seconds} label="seg" />
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-secondary transition-colors duration-200 group-hover:text-foreground">
          Ver drop
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
        </div>
      </Link>
    </div>
  );
}
