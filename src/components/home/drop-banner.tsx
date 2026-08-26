"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      <span className="relative min-w-[3rem] overflow-hidden rounded-lg border border-border-subtle bg-card px-2.5 py-1.5 sm:min-w-[3.8rem] sm:px-3 sm:py-2">
        <span className="font-mono text-lg font-bold tabular-nums text-foreground sm:text-2xl">
          {String(value).padStart(2, "0")}
        </span>
      </span>
      <span className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-foreground-disabled sm:text-[10px]">
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
    <div className="relative mx-auto mb-8 mt-8 w-[calc(100%-2rem)] max-w-7xl sm:w-full">
      {/* Atmospheric background */}
      <div className="absolute inset-0 rounded-xl opacity-60">
        <div className="absolute inset-0 rounded-xl cosmic-drop" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[16rem] w-[16rem] rounded-full bg-drop-accent/[0.06] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-[14rem] w-[14rem] rounded-full bg-accent-secondary/[0.04] blur-[80px]" />
      </div>

      <Link
        href={`/products/${slug}`}
        className="relative block rounded-xl border border-border-subtle p-5 transition-all duration-300 hover:border-border-active sm:p-7"
      >
        {/* Top row — kicker + product name */}
        <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-7 sm:gap-4">
          {/* Decorative star */}
          <span className="text-lg text-drop-accent animate-entrance animate-stagger-1" aria-hidden="true">&#10022;</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-drop-accent sm:text-xs animate-entrance animate-stagger-2">
            Proximo drop
          </span>
          <span className="h-px flex-1 bg-border-subtle hidden sm:block" />
          <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground sm:text-base animate-entrance animate-stagger-3">
            {name}
          </span>
        </div>

        {/* Countdown — animated cells */}
        <div className="flex items-start justify-center gap-2 sm:gap-3 animate-entrance animate-stagger-4" aria-label={`Faltan ${days} dias ${hours} horas ${minutes} minutos ${seconds} segundos`}>
          <CountdownCell value={days} label="dias" />
          <span className="mt-2 text-xs text-foreground-disabled">:</span>
          <CountdownCell value={hours} label="hrs" />
          <span className="mt-2 text-xs text-foreground-disabled">:</span>
          <CountdownCell value={minutes} label="min" />
          <span className="mt-2 text-xs text-foreground-disabled">:</span>
          <CountdownCell value={seconds} label="seg" />
        </div>

        {/* Orbital line — horizontal accent */}
        <div className="my-4 sm:my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <span className="text-[10px] text-foreground-disabled">&#9670;</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground-secondary transition-colors duration-300 group-hover:text-foreground">
          <span>Ver drop</span>
          <span className="text-drop-accent">&#8594;</span>
        </div>
      </Link>
    </div>
  );
}
