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

export function DropBanner({ name, slug, date }: { name: string; slug: string; date: string }) {
  const target = new Date(date).getTime();
  const [left, setLeft] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (left <= 0) return null;

  const { days, hours, minutes, seconds } = parts(left);
  const cell = (value: number, label: string) => (
    <span className="flex flex-col items-center">
      <span className="min-w-[2.2rem] border border-border bg-background-secondary px-2 py-1 font-mono text-base font-bold tabular-nums text-foreground">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 font-mono text-[8px] uppercase tracking-widest text-foreground-disabled">{label}</span>
    </span>
  );

  return (
    <Link
      href={`/products/${slug}`}
      className="mx-auto mb-6 mt-6 flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border border-border bg-background-secondary/50 px-5 py-3 transition-colors hover:border-border-active sm:flex-nowrap"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cta">
        Proximo drop
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
      <span className="flex items-center gap-1.5" aria-label={`Faltan ${days} dias ${hours} horas ${minutes} minutos ${seconds} segundos`}>
        {cell(days, "dias")}
        <span className="-mt-4 text-xs text-foreground-disabled">:</span>
        {cell(hours, "hrs")}
        <span className="-mt-4 text-xs text-foreground-disabled">:</span>
        {cell(minutes, "min")}
        <span className="-mt-4 text-xs text-foreground-disabled">:</span>
        {cell(seconds, "seg")}
      </span>
    </Link>
  );
}
