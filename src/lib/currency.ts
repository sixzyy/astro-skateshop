export interface CurrencyOption {
  code: string;
  label: string;
}

export const BASE_CURRENCY = "COP";

/**
 * Monedas ofrecidas en el selector. Los montos se muestran de forma
 * informativa; el cobro siempre se procesa en pesos colombianos (COP).
 */
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "Dólar estadounidense" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "Libra esterlina" },
  { code: "CAD", label: "Dólar canadiense" },
  { code: "AUD", label: "Dólar australiano" },
  { code: "JPY", label: "Yen japonés" },
  { code: "CNY", label: "Yuan chino" },
  { code: "CHF", label: "Franco suizo" },
  { code: "BRL", label: "Real brasileño" },
  { code: "CLP", label: "Peso chileno" },
  { code: "ARS", label: "Peso argentino" },
  { code: "PEN", label: "Sol peruano" },
];

/** Último recurso si ninguna API responde (aproximaciones conservadoras). */
const FALLBACK_RATES: Record<string, number> = {
  COP: 1,
  USD: 0.00025,
  EUR: 0.00023,
  GBP: 0.0002,
  CAD: 0.00034,
  AUD: 0.00038,
  JPY: 0.037,
  CNY: 0.0018,
  CHF: 0.0002,
  BRL: 0.0014,
  CLP: 0.24,
  ARS: 0.33,
  PEN: 0.00095,
};

type RatesSnapshot = { rates: Record<string, number>; fetchedAt: number };

let cache: RatesSnapshot | null = null;
const TTL_MS = 6 * 60 * 60 * 1000;

function pickRates(codes: string[], raw: Record<string, number>): Record<string, number> {
  const clean: Record<string, number> = { [BASE_CURRENCY]: 1 };
  for (const code of codes) {
    if (code === BASE_CURRENCY) continue;
    const rate = raw[code];
    // Tasas válidas: positivas y "razonables" respecto al peso (evita datos basura).
    if (typeof rate === "number" && Number.isFinite(rate) && rate > 0 && rate < 5000) {
      clean[code] = rate;
    }
  }
  return clean;
}

/** Fuente primaria: open.er-api.com — gratis, sin llave, 160+ monedas. */
async function fetchFromErApi(codes: string[]): Promise<Record<string, number>> {
  const res = await fetch("https://open.er-api.com/v6/latest/COP", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("er-api bad status");
  const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
  if (data.result !== "success" || !data.rates) throw new Error("er-api bad payload");
  const rates = pickRates(codes, data.rates);
  if (Object.keys(rates).length <= 2) throw new Error("er-api empty rates");
  return rates;
}

/** Respaldo gratuito: frankfurter.app (datos del BCE, ~30 monedas). */
async function fetchFromFrankfurter(codes: string[]): Promise<Record<string, number>> {
  const res = await fetch("https://api.frankfurter.app/latest?from=COP", { cache: "no-store" });
  if (!res.ok) throw new Error("frankfurter bad status");
  const data = (await res.json()) as { rates?: Record<string, number> };
  if (!data.rates) throw new Error("frankfurter empty");
  const rates = pickRates(codes, data.rates);
  if (Object.keys(rates).length <= 2) throw new Error("frankfurter empty rates");
  return rates;
}

export function isSupported(code: string): boolean {
  return SUPPORTED_CURRENCIES.some((c) => c.code === code);
}

/**
 * Tasas COP → X con caché de 6h. Cadena de fuentes:
 * open.er-api.com → frankfurter.app → valores locales de respaldo.
 */
export async function getRates(): Promise<{ rates: Record<string, number>; source: string }> {
  const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
    return { rates: cache.rates, source: "cache" };
  }

  try {
    const rates = await fetchFromErApi(codes);
    cache = { rates, fetchedAt: Date.now() };
    return { rates, source: "open.er-api.com" };
  } catch {}

  try {
    const rates = await fetchFromFrankfurter(codes);
    cache = { rates, fetchedAt: Date.now() };
    return { rates, source: "frankfurter.app" };
  } catch {}

  return { rates: FALLBACK_RATES, source: "fallback" };
}

export async function getRateFor(code: string): Promise<number> {
  if (!isSupported(code)) return 1;
  const { rates } = await getRates();
  return rates[code] ?? FALLBACK_RATES[code] ?? 1;
}

export function convert(
  amountCOP: number,
  code: string,
  rates?: Record<string, number> | null
): number {
  if (code === BASE_CURRENCY) return amountCOP;
  const rate = rates?.[code] ?? FALLBACK_RATES[code] ?? 1;
  return amountCOP * rate;
}

export function formatMoney(
  amountCOP: number,
  code: string = BASE_CURRENCY,
  rates?: Record<string, number> | null
): string {
  const value = convert(amountCOP, code, rates);
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: code }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}
