"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

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
      <span className="min-w-[2.4rem] rounded-md border border-cta/50 bg-background/80 px-2 py-1 font-mono text-lg font-bold tabular-nums text-white shadow-[0_0_14px_rgba(255,107,0,0.25)]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </span>
  );

  return (
    <Link
      href={`/products/${slug}`}
      className="animate-fade-up mx-auto mb-6 mt-6 flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-xl border border-cta/40 bg-gradient-to-r from-galaxy/70 via-card to-cta/15 px-5 py-3.5 transition-all hover:border-cta hover:shadow-[0_0_32px_rgba(255,107,0,0.25)] sm:flex-nowrap"
    >
      <span className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-cta">
        <Zap className="h-4 w-4 animate-pulse" /> Próximo drop
      </span>
      <span className="min-w-0 truncate text-sm text-foreground/90">{name}</span>
      <span className="flex items-center gap-1.5" aria-label={`Faltan ${days} días ${hours} horas ${minutes} minutos ${seconds} segundos`}>
        {cell(days, "días")}
        <span className="-mt-4 font-bold text-cta">:</span>
        {cell(hours, "hrs")}
        <span className="-mt-4 font-bold text-cta">:</span>
        {cell(minutes, "min")}
        <span className="-mt-4 font-bold text-cta">:</span>
        {cell(seconds, "seg")}
      </span>
      <span className="hidden font-mono text-xs uppercase tracking-widest text-accent underline-offset-4 group-hover:underline lg:block">
        Ver ahora →
      </span>
    </Link>
  );
}
