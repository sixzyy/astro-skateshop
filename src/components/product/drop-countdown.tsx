"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

function Cell({ value, label }: { value: number | null; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="min-w-[4rem] rounded-lg border border-cta/50 bg-background/80 px-3 py-2 font-mono text-2xl font-bold tabular-nums text-white shadow-[0_0_18px_rgba(255,107,0,0.25)] sm:text-3xl">
        {value === null ? "--" : String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </span>
  );
}

export function DropCountdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(target - Date.now(), 0));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const total = left ?? 0;
  const days = left === null ? null : Math.floor(total / 86400000);
  const hours = left === null ? null : Math.floor((total % 86400000) / 3600000);
  const minutes = left === null ? null : Math.floor((total % 3600000) / 60000);
  const seconds = left === null ? null : Math.floor((total % 60000) / 1000);

  return (
    <div className="rounded-xl border border-cta/40 bg-gradient-to-r from-galaxy/60 via-card to-cta/15 p-5">
      <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-cta">
        <Zap className="h-4 w-4 animate-pulse" /> El drop cae en
      </p>
      <div className="mt-3 flex items-start gap-2 sm:gap-3" role="timer" aria-live="off">
        <Cell value={days} label="días" />
        <span className="mt-2 font-bold text-cta">:</span>
        <Cell value={hours} label="hrs" />
        <span className="mt-2 font-bold text-cta">:</span>
        <Cell value={minutes} label="min" />
        <span className="mt-2 font-bold text-cta">:</span>
        <Cell value={seconds} label="seg" />
      </div>
    </div>
  );
}
