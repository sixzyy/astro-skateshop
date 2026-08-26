"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Lock, ShieldCheck, ShoppingBag, XCircle } from "lucide-react";
import { cartSubtotal, useCartStore } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { shippingFor } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { useSettings } from "@/hooks/use-settings";
import { CheckoutForm } from "@/components/checkout/checkout-form";

interface SavedAddress {
  id: string;
  label: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

interface Notice {
  variantId: string;
  label: string;
  type: "clamped" | "out";
  qty: number;
}

export function CheckoutBody({ expressAvailable = false }: { expressAvailable?: boolean }) {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.remove);
  const searchParams = useSearchParams();
  const currencyCode = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);
  const canceled = searchParams.get("canceled") === "1";

  const [liveStock, setLiveStock] = useState<Record<string, number> | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [account, setAccount] = useState<{ loggedIn: boolean; email: string | null; addresses: SavedAddress[] }>({
    loggedIn: false,
    email: null,
    addresses: [],
  });
  const settings = useSettings();
  const idsKey = useMemo(() => items.map((i) => i.variantId).sort().join(","), [items]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (!me?.user || cancelled) return;
      const addr = await fetch("/api/account/addresses")
        .then((r) => (r.ok ? r.json() : { addresses: [] }))
        .catch(() => ({ addresses: [] }));
      if (!cancelled) {
        setAccount({
          loggedIn: true,
          email: me.user.email ?? null,
          addresses: (addr.addresses ?? []) as SavedAddress[],
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function applyCoupon(code: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal: cartSubtotal(useCartStore.getState().items) }),
    }).catch(() => null);
    if (!res || !res.ok) {
      const json = res ? await res.json().catch(() => null) : null;
      return { ok: false, error: json?.error ?? "No se pudo validar el cupon." };
    }
    const json = await res.json();
    setCoupon({ code: json.code, discount: json.discount });
    return { ok: true };
  }

  function removeCoupon() {
    setCoupon(null);
  }

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    fetch(`/api/stock?ids=${idsKey}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { stocks?: Record<string, number> }) => {
        const stocks = data.stocks ?? {};
        setLiveStock(stocks);
        const found: Notice[] = [];
        for (const item of useCartStore.getState().items) {
          const available = stocks[item.variantId];
          if (available === undefined) continue;
          if (available <= 0) {
            found.push({ variantId: item.variantId, label: `${item.name} (${item.variantTitle})`, type: "out", qty: 0 });
          } else if (item.quantity > available) {
            setQuantity(item.variantId, available);
            found.push({
              variantId: item.variantId,
              label: `${item.name} (${item.variantTitle})`,
              type: "clamped",
              qty: available,
            });
          }
        }
        setNotices(found);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [idsKey, setQuantity]);

  const hasOutOfStock = notices.some((n) => n.type === "out");

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-foreground-disabled" strokeWidth={1.2} />
        <p className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-foreground-disabled">
          Tu carrito esta vacio
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex min-h-[48px] items-center rounded-lg bg-cta px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:bg-cta-hover active:scale-[0.98]"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const discount = Math.min(coupon?.discount ?? 0, subtotal);
  const discountedSubtotal = subtotal - discount;
  const shipping = shippingFor(discountedSubtotal, settings.freeShippingThreshold, settings.shippingFlat);
  const total = discountedSubtotal + shipping;

  return (
    <>
      {canceled && (
        <p className="mb-6 flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5 text-sm text-warning">
          <XCircle className="h-4 w-4 shrink-0" /> El pago fue cancelado. Puedes intentarlo de nuevo.
        </p>
      )}

      {notices.length > 0 && (
        <div className="mb-6 space-y-2">
          {notices.map((n) =>
            n.type === "out" ? (
              <p
                key={n.variantId}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-error/20 bg-error/5 px-3 py-2.5 text-sm text-error"
              >
                <XCircle className="h-4 w-4 shrink-0" />
                <span>
                  <strong>{n.label}</strong> se agoto. Eliminalo del carrito para continuar.
                </span>
                <button
                  onClick={() => removeItem(n.variantId)}
                  className="ml-auto rounded-lg border border-error/30 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-error hover:text-white cursor-pointer"
                >
                  Eliminar
                </button>
              </p>
            ) : (
              <p
                key={n.variantId}
                className="flex items-center gap-2 rounded-lg border border-cta/20 bg-cta/5 px-3 py-2.5 text-sm text-cta"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Ajustamos <strong>{n.label}</strong> a {n.qty} pieza{n.qty === 1 ? "" : "s"}.
              </p>
            )
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <CheckoutForm
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          expressAvailable={expressAvailable}
          blocked={hasOutOfStock}
          coupon={coupon}
          applyCoupon={applyCoupon}
          removeCoupon={removeCoupon}
          savedAddresses={account.addresses}
          userEmail={account.email}
          loggedIn={account.loggedIn}
        />

        <aside className="h-fit rounded-lg border border-border bg-background-secondary/50 p-5 lg:sticky lg:top-24">
          <h2 className="mb-1 font-display text-sm font-bold uppercase tracking-widest">Tu pedido</h2>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-foreground-disabled">
            {liveStock === null ? "Verificando disponibilidad..." : "Disponibilidad confirmada"}
          </p>
          <ul className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3">
                  <ProductImage
                    src={item.image ?? "/products/generic.svg"}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-display text-xs font-bold uppercase">{item.name}</p>
                  <p className="text-xs text-foreground-secondary">
                    {item.variantTitle} x {item.quantity}
                  </p>
                </div>
                <span className="font-display text-sm font-bold">{formatMoney(item.price * item.quantity, currencyCode, rates)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground-secondary">Subtotal</dt>
              <dd>{formatMoney(subtotal, currencyCode, rates)}</dd>
            </div>
            {coupon && discount > 0 && (
              <div className="flex justify-between text-success">
                <dt className="flex items-center gap-1.5">
                  Cupon {coupon.code}
                  <button
                    onClick={removeCoupon}
                    aria-label="Quitar cupon"
                    className="rounded p-0.5 transition-colors hover:bg-error/10 hover:text-error cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </dt>
                <dd>-{formatMoney(discount, currencyCode, rates)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-foreground-secondary">Envio</dt>
              <dd>{shipping === 0 ? "Gratis" : formatMoney(shipping, currencyCode, rates)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(total, currencyCode, rates)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-widest text-foreground-disabled">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> SSL 256-bit
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" /> Pago cifrado
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
