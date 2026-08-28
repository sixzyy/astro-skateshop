"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Coins } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { useCurrencyStore } from "@/store/currency";

const STALE_MS = 6 * 60 * 60 * 1000;

export function CurrencySelector() {
  const [open, setOpen] = useState(false);
  const code = useCurrencyStore((s) => s.code);
  const updated = useCurrencyStore((s) => s.updated);
  const setCode = useCurrencyStore((s) => s.setCode);
  const setRates = useCurrencyStore((s) => s.setRates);

  useEffect(() => {
    useCurrencyStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (Date.now() - updated > STALE_MS) {
      fetch("/api/rates")
        .then((r) => r.json())
        .then((d) => {
          if (d?.rates) setRates(d.rates);
        })
        .catch(() => {});
    }
  }, [updated, setRates]);

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-2.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-accent hover:text-accent cursor-pointer"
        aria-label="Cambiar moneda"
      >
        <Coins className="h-3.5 w-3.5" />
        {code}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-accent/25 bg-card p-1 shadow-[0_0_30px_rgba(111,200,233,0.12)]">
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCode(c.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted cursor-pointer ${
                c.code === code ? "text-accent" : ""
              }`}
            >
              <span>{c.label}</span>
              <span className="flex items-center gap-1 font-mono">
                {c.code}
                {c.code === code && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          ))}
          <p className="mt-1 border-t border-border px-2.5 pb-1 pt-1.5 text-[10px] leading-snug text-muted-foreground">
            Tipo de cambio informativo. El cobro se procesa en pesos colombianos.
            {updated > 0 && (
              <>
                {" "}
                Tasas al{" "}
                {new Date(updated).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                })}
                .
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
