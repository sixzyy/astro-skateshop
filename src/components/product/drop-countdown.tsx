"use client";

import { useEffect, useRef, useState } from "react";

function Cell({ value, label }: { value: number | null; label: string }) {
  const [display, setDisplay] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== null && value !== prevRef.current) {
      setAnimating(true);
      const timeout = setTimeout(() => {
        setDisplay(value);
        setAnimating(false);
      }, 150);
      prevRef.current = value;
      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <span className="flex flex-col items-center">
      <span className="relative min-w-[3.8rem] overflow-hidden rounded-lg border border-accent/30 bg-accent-deep/80 px-3 py-2.5 sm:min-w-[4.5rem] sm:px-4 sm:py-3">
        <span
          className={`font-mono text-2xl font-bold tabular-nums text-accent transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-3xl ${
            animating ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {value === null ? "--" : String(display ?? value).padStart(2, "0")}
        </span>
      </span>
      <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground-secondary">
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
    <div className="rounded-lg border border-accent/20 bg-accent-deep/30 p-5">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        <span>&#10022;</span>
        El drop cae en
      </p>
      <div className="mt-3 flex items-start gap-2 sm:gap-3" role="timer" aria-live="off">
        <Cell value={days} label="dias" />
        <span className="mt-3 text-lg font-bold text-accent/50">:</span>
        <Cell value={hours} label="hrs" />
        <span className="mt-3 text-lg font-bold text-accent/50">:</span>
        <Cell value={minutes} label="min" />
        <span className="mt-3 text-lg font-bold text-accent/50">:</span>
        <Cell value={seconds} label="seg" />
      </div>
    </div>
  );
}
