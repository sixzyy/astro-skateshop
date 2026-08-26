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
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground-disabled">
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
        className="group block rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:border-border-active hover:shadow-[0_8px_30px_rgba(84,216,255,0.04)] sm:p-6"
      >
        {/* Top */}
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-drop-accent/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-drop-accent">
            <Star className="h-3 w-3 fill-drop-accent text-drop-accent" />
            Proximo drop
          </span>
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </div>

        {/* Countdown */}
        <div className="flex items-start justify-center gap-2 sm:gap-3" aria-label={`Faltan ${days} dias ${hours} horas ${minutes} minutos ${seconds} segundos`}>
          <CountdownCell value={days} label="dias" />
          <span className="mt-2.5 text-sm text-foreground-disabled">:</span>
          <CountdownCell value={hours} label="hrs" />
          <span className="mt-2.5 text-sm text-foreground-disabled">:</span>
          <CountdownCell value={minutes} label="min" />
          <span className="mt-2.5 text-sm text-foreground-disabled">:</span>
          <CountdownCell value={seconds} label="seg" />
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground-secondary transition-colors duration-200 group-hover:text-foreground">
          Ver drop
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">&rarr;</span>
        </div>
      </Link>
    </div>
  );
}
