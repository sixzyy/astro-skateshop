"use client";

import { useCurrencyStore } from "@/store/currency";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function Price({ amount, className }: { amount: number; className?: string }) {
  const code = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);
  return <span className={cn(className)}>{formatMoney(amount, code, rates)}</span>;
}
