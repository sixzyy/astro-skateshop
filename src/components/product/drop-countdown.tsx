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
      <span className="relative min-w-[3.5rem] overflow-hidden rounded-lg border border-border-subtle bg-card px-3 py-2 sm:min-w-[4.2rem]">
        <span
          className={`font-mono text-2xl font-bold tabular-nums text-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-3xl ${
            animating ? "translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {value === null ? "--" : String(display ?? value).padStart(2, "0")}
        </span>
      </span>
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground-disabled">
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
    <div className="rounded-lg border border-border-subtle bg-drop-surface/50 p-5">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground-disabled">
        <span className="text-drop-accent">&#10022;</span>
        El drop cae en
      </p>
      <div className="mt-3 flex items-start gap-2 sm:gap-3" role="timer" aria-live="off">
        <Cell value={days} label="dias" />
        <span className="mt-2 font-bold text-foreground-disabled">:</span>
        <Cell value={hours} label="hrs" />
        <span className="mt-2 font-bold text-foreground-disabled">:</span>
        <Cell value={minutes} label="min" />
        <span className="mt-2 font-bold text-foreground-disabled">:</span>
        <Cell value={seconds} label="seg" />
      </div>
    </div>
  );
}
