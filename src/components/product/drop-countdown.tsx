"use client";

import { useEffect, useState } from "react";

function Cell({ value, label }: { value: number | null; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="min-w-[3.5rem] rounded-lg border border-border bg-background-secondary px-3 py-2 font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
        {value === null ? "--" : String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground-secondary/50">
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
    <div className="border border-border-subtle bg-background-secondary/50 p-5">
      <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-foreground-secondary">
        El drop cae en
      </p>
      <div className="mt-3 flex items-start gap-2 sm:gap-3" role="timer" aria-live="off">
        <Cell value={days} label="dias" />
        <span className="mt-2 font-bold text-foreground-secondary/40">:</span>
        <Cell value={hours} label="hrs" />
        <span className="mt-2 font-bold text-foreground-secondary/40">:</span>
        <Cell value={minutes} label="min" />
        <span className="mt-2 font-bold text-foreground-secondary/40">:</span>
        <Cell value={seconds} label="seg" />
      </div>
    </div>
  );
}
