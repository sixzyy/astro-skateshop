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
      <span className="relative min-w-[3.2rem] overflow-hidden rounded-lg border border-accent/30 bg-accent-deep/80 px-2.5 py-2 sm:min-w-[4rem] sm:px-4 sm:py-2.5">
        <span className="font-mono text-xl font-bold tabular-nums text-accent sm:text-3xl">
          {String(value).padStart(2, "0")}
        </span>
      </span>
      <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-secondary sm:text-[11px]">
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
      {/* Atmospheric background — stronger glow */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 rounded-xl cosmic-drop" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-[20rem] w-[20rem] rounded-full bg-accent/[0.1] blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-[18rem] w-[18rem] rounded-full bg-accent-secondary/[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[12rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cta/[0.04] blur-[80px]" />
      </div>

      <Link
        href={`/products/${slug}`}
        className="group relative block rounded-xl border border-accent/20 bg-accent-deep/20 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_40px_rgba(84,216,255,0.08)] sm:p-7"
      >
        {/* Top row — kicker + product name */}
        <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-7 sm:gap-4">
          {/* Decorative star */}
          <span className="text-xl text-accent animate-entrance animate-stagger-1" aria-hidden="true">&#10022;</span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent sm:text-xs animate-entrance animate-stagger-2">
            Proximo drop
          </span>
          <span className="h-px flex-1 bg-accent/20 hidden sm:block" />
          <span className="font-display text-base font-bold uppercase tracking-wide text-foreground sm:text-lg animate-entrance animate-stagger-3">
            {name}
          </span>
        </div>

        {/* Countdown — colorful cells */}
        <div className="flex items-start justify-center gap-2 sm:gap-4 animate-entrance animate-stagger-4" aria-label={`Faltan ${days} dias ${hours} horas ${minutes} minutos ${seconds} segundos`}>
          <CountdownCell value={days} label="dias" />
          <span className="mt-3 text-lg font-bold text-accent/50">:</span>
          <CountdownCell value={hours} label="hrs" />
          <span className="mt-3 text-lg font-bold text-accent/50">:</span>
          <CountdownCell value={minutes} label="min" />
          <span className="mt-3 text-lg font-bold text-accent/50">:</span>
          <CountdownCell value={seconds} label="seg" />
        </div>

        {/* Orbital line — accent color */}
        <div className="my-5 sm:my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <span className="text-sm text-accent/60">&#9670;</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent transition-colors duration-300 group-hover:text-foreground">
          <span>Ver drop</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">&#8594;</span>
        </div>
      </Link>
    </div>
  );
}
