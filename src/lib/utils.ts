import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(value);
}

export function trackUrl(trackingNumber: string, carrier?: string | null) {
  if (carrier === "estafeta") return `https://www.estafeta.com/Rastreo?guia=${encodeURIComponent(trackingNumber)}`;
  if (carrier === "dhl") return `https://www.dhl.com/co-es/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`;
  if (carrier === "fedex") return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  // Rastreador universal gratuito de 17TRACK
  return `https://www.17track.net/es/track#nums=${encodeURIComponent(trackingNumber)}`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateOrderNumber() {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AST-${Date.now().toString(36).toUpperCase()}${random}`;
}

export const SHIPPING_FLAT = 149;
export const FREE_SHIPPING_THRESHOLD = 999;

export function shippingFor(subtotal: number, threshold = FREE_SHIPPING_THRESHOLD, flat = SHIPPING_FLAT) {
  if (subtotal <= 0 || subtotal >= threshold) return 0;
  return flat;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i;
const IMAGE_FORMAT_RE = /^(image\/)?(jpe?g|png|webp|gif|avif)$/i;
const IMAGE_CDN_SUFFIXES = [
  "vtexassets.com",
  "cloudinary.com",
  "shopify.com",
  "imgur.com",
  "unsplash.com",
  "picsum.photos",
  "pexels.com",
  "pixabay.com",
  "pinimg.com",
  "akamaized.net",
  "amazonaws.com",
  "azureedge.us",
  "blob.core.windows.net",
  "discordapp.net",
  "discordapp.com",
  "cdninstagram.com",
  "fbcdn.net",
];

function looksLikeImageUrl(url: URL): boolean {
  if (IMAGE_EXT_RE.test(url.pathname)) return true;
  for (const [key, value] of url.searchParams) {
    if (/^(format|fmt|f|output|extension|ext)$/i.test(key) && IMAGE_FORMAT_RE.test(value)) return true;
  }
  const host = url.hostname.toLowerCase();
  if (IMAGE_CDN_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))) return true;
  return false;
}

function b64urlDecode(input: string): string | null {
  try {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    if (typeof atob !== "function") return null;
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function extractProxiedImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (/^images-ext-\d+\.(discordapp\.net|discordapp\.com)$/.test(host) && url.pathname.startsWith("/external/")) {
      const segments = url.pathname.split("/").filter(Boolean);
      const marker = segments.findIndex((s) => /^(https?:?)$/.test(s.replace(/:$/, "")));
      if (marker !== -1 && marker + 1 < segments.length) {
        const scheme = segments[marker].replace(/:$/, "");
        return `${scheme}://${segments.slice(marker + 1).join("/")}${url.search}`;
      }
    }

    if (host === "imgs.search.brave.com" || host.endsWith(".brave.com")) {
      const segments = url.pathname.split("/").filter(Boolean);
      const start = segments.findIndex((s) => /^aHR[01][A-Za-z0-9_-]*$/.test(s));
      if (start !== -1) {
        const joined = segments.slice(start).join("");
        const decoded = b64urlDecode(joined);
        if (decoded && /^https?:\/\//i.test(decoded)) return decoded;
      }
      for (let i = segments.length - 1; i >= 0; i--) {
        const seg = segments[i];
        if (/^[A-Za-z0-9_-]{16,}$/.test(seg)) {
          const decoded = b64urlDecode(seg);
          if (decoded && /^https?:\/\//i.test(decoded)) return decoded;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function isDirectImageUrl(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (looksLikeImageUrl(url)) return true;

    const inner = extractProxiedImageUrl(value);
    if (!inner) return false;
    try {
      const innerUrl = new URL(inner);
      if ((innerUrl.protocol === "https:" || innerUrl.protocol === "http:") && looksLikeImageUrl(innerUrl)) {
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  } catch {
    return false;
  }
}
