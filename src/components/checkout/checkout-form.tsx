"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Tag } from "lucide-react";
import type { CartItem } from "@/store/cart";
import { useCurrencyStore } from "@/store/currency";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

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

interface Props {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  expressAvailable: boolean;
  blocked?: boolean;
  coupon?: { code: string; discount: number } | null;
  applyCoupon?: (code: string) => Promise<{ ok: boolean; error?: string }>;
  removeCoupon?: () => void;
  savedAddresses?: SavedAddress[];
  userEmail?: string | null;
  loggedIn?: boolean;
}

const STEPS = ["Envío", "Pago", "Confirmación"];

type FieldKey = "name" | "email" | "address" | "city" | "state" | "postalCode";

const FIELD_VALIDATORS: Record<FieldKey, (v: string) => boolean> = {
  name: (v) => v.trim().length >= 3,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  address: (v) => v.trim().length >= 5,
  city: (v) => v.trim().length >= 2,
  state: (v) => v.trim().length >= 2,
  postalCode: (v) => /^\d{4,6}$/.test(v.trim()),
};

const FIELD_LABELS: Record<FieldKey, { label: string; placeholder: string; autoComplete: string; type?: string; span?: string }> = {
  name: { label: "Nombre completo", placeholder: "Tu nombre y apellido", autoComplete: "name" },
  email: { label: "Correo electrónico", placeholder: "tu@correo.mx", autoComplete: "email", type: "email" },
  address: { label: "Calle y número", placeholder: "Av. Reforma 123, Int. 4", autoComplete: "street-address", span: "sm:col-span-2" },
  city: { label: "Ciudad", placeholder: "CDMX", autoComplete: "address-level2" },
  state: { label: "Estado", placeholder: "CMX", autoComplete: "address-level1" },
  postalCode: { label: "C.P.", placeholder: "06700", autoComplete: "postal-code" },
};

export function CheckoutForm({
  items,
  subtotal,
  shipping,
  total,
  expressAvailable,
  blocked = false,
  coupon = null,
  applyCoupon,
  removeCoupon,
  savedAddresses = [],
  userEmail = null,
  loggedIn = false,
}: Props) {
  const [step, setStep] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    name: false,
    email: false,
    address: false,
    city: false,
    state: false,
    postalCode: false,
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveAddressChecked, setSaveAddressChecked] = useState(true);
  const currencyCode = useCurrencyStore((s) => s.code);
  const rates = useCurrencyStore((s) => s.rates);

  const errors = useMemo(() => {
    const result = {} as Record<FieldKey, boolean>;
    (Object.keys(FIELD_VALIDATORS) as FieldKey[]).forEach((key) => {
      result[key] = !FIELD_VALIDATORS[key](values[key]);
    });
    return result;
  }, [values]);

  const shippingValid = !Object.values(errors).some(Boolean);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  function setField(key: FieldKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Si el usuario edita manualmente, deja de usar la dirección guardada.
    if (key !== "email") setSelectedAddressId("");
  }

  function pickAddress(id: string) {
    const a = savedAddresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddressId(a.id);
    setValues((prev) => ({
      ...prev,
      name: a.name,
      email: userEmail ?? prev.email,
      address: a.address,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
    }));
  }

  async function submit() {
    setServerError("");
    setLoading(true);

    const payload = {
      shippingInfo: values,
      currency: useCurrencyStore.getState().code,
      couponCode: coupon?.code,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      ...(selectedAddressId ? { addressId: selectedAddressId } : {}),
      ...(loggedIn && !selectedAddressId && saveAddressChecked ? { saveAddress: true } : {}),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error ?? "No se pudo procesar tu pedido.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url as string;
        return;
      }

      window.location.href = `/checkout/success?number=${data.number}`;
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  async function submitCoupon(e?: React.FormEvent) {
    e?.preventDefault();
    if (!applyCoupon || !couponInput.trim() || couponBusy) return;
    setCouponBusy(true);
    setCouponMessage(null);
    const result = await applyCoupon(couponInput.trim().toUpperCase());
    setCouponMessage(
      result.ok
        ? { ok: true, text: "¡Cupón aplicado! El descuento ya está en tu total." }
        : { ok: false, text: result.error ?? "Cupón inválido." }
    );
    if (result.ok) setCouponInput("");
    setCouponBusy(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!shippingValid) {
          setTouched({ name: true, email: true, address: true, city: true, state: true, postalCode: true });
          setStep(0);
          return;
        }
        if (step === 1 && !loading) void submit();
      }}
      id="checkout-form"
      className="space-y-6"
    >
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                i === step
                  ? "border-cta bg-cta text-zinc-950 shadow-[0_0_14px_rgba(255,107,0,0.5)]"
                  : i === 2
                    ? "border-border text-muted-foreground"
                    : "border-accent/60 bg-accent/10 text-accent"
              )}
            >
              {i === 0 && step > 0 ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden font-mono text-[11px] uppercase tracking-widest sm:block",
                i === step ? "text-white" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={cn("h-px flex-1", i < step ? "bg-cta" : "bg-border")} />
            )}
          </li>
        ))}
      </ol>

      {serverError && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">{serverError}</p>
      )}

      {blocked && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">
          Hay artículos agotados en tu carrito. Elimínalos para poder pagar.
        </p>
      )}

      {step === 0 && (
        <div className="animate-fade-up space-y-4">
          <fieldset className="rounded-lg border border-border bg-card p-5">
            <legend className="px-1 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Datos de contacto
            </legend>
            <div className="grid gap-4 pt-1 sm:grid-cols-2">
              <WizardField fieldKey="name" values={values} errors={errors} touched={touched} onBlur={setTouched} onChange={setField} />
              <WizardField fieldKey="email" values={values} errors={errors} touched={touched} onBlur={setTouched} onChange={setField} />
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-border bg-card p-5">
            <legend className="px-1 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Dirección de envío
            </legend>
            {loggedIn && savedAddresses.length > 0 && (
              <div className="mb-4 grid gap-2 pt-1 sm:grid-cols-2">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => pickAddress(a.id)}
                    className={cn(
                      "rounded-md border p-3 text-left text-xs transition-colors cursor-pointer",
                      selectedAddressId === a.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/60"
                    )}
                  >
                    <span className="flex items-center justify-between font-bold">
                      {a.label}
                      {selectedAddressId === a.id && <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />}
                      {a.isDefault && selectedAddressId !== a.id && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-accent">Predeterminada</span>
                      )}
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      {a.name} · {a.address}, {a.city}, {a.state} C.P. {a.postalCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-4 pt-1 sm:grid-cols-3">
              <WizardField fieldKey="address" values={values} errors={errors} touched={touched} onBlur={setTouched} onChange={setField} />
              <WizardField fieldKey="city" values={values} errors={errors} touched={touched} onBlur={setTouched} onChange={setField} />
              <WizardField fieldKey="state" values={values} errors={errors} touched={touched} onBlur={setTouched} onChange={setField} />
              <WizardField fieldKey="postalCode" values={values} errors={errors} touched={touched} onBlur={setTouched} onChange={setField} />
            </div>
            {loggedIn && !selectedAddressId && (
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={saveAddressChecked}
                  onChange={(e) => setSaveAddressChecked(e.target.checked)}
                  className="accent-[#00f0ff]"
                />
                Guardar esta dirección en mi cuenta para futuras compras
              </label>
            )}
          </fieldset>

          <button
            type="button"
            onClick={() => {
              if (shippingValid) {
                setStep(1);
                return;
              }
              setTouched({ name: true, email: true, address: true, city: true, state: true, postalCode: true });
            }}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-md font-display text-sm font-bold uppercase tracking-wide transition-all active:scale-[0.99] sm:w-auto sm:px-10 cursor-pointer",
              shippingValid
                ? "btn-glow-cta bg-cta text-zinc-950 hover:bg-cta-strong"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            )}
          >
            Continuar al pago <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up space-y-4">
          <fieldset className="rounded-lg border border-border bg-card p-5">
            <legend className="px-1 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Pago exprés
            </legend>
            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
              {[
                { label: "Apple Pay", cls: "bg-black text-white border-white/25 hover:border-white/60" },
                { label: "G Pay", cls: "bg-white text-zinc-900 border-transparent hover:border-accent" },
                { label: "PayPal", cls: "bg-[#ffc439] text-[#003087] border-transparent hover:border-accent" },
              ].map((w) => (
                <button
                  key={w.label}
                  type="button"
                  disabled={!expressAvailable || loading || blocked}
                  title={
                    blocked
                      ? "Elimina los artículos agotados primero"
                      : expressAvailable
                        ? `Paga rápido con ${w.label}`
                        : "Disponible al activar Stripe"
                  }
                  onClick={() => void submit()}
                  className={cn(
                    "h-11 rounded-md border font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer",
                    w.cls
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
            {!expressAvailable && (
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Los pagos exprés se activan al configurar Stripe. Por ahora continúa con el pago seguro estándar.
              </p>
            )}
          </fieldset>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">o paga con tarjeta</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <fieldset className="rounded-lg border border-border bg-card p-4">
            <legend className="px-1 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ¿Tienes un cupón?
            </legend>
            {coupon ? (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-400">
                  <Tag className="h-4 w-4" /> {coupon.code}
                </span>
                {removeCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponMessage(null);
                    }}
                    className="rounded border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-red-500/60 hover:text-red-500 cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submitCoupon(e);
                    }
                  }}
                  placeholder="ASTRO10"
                  maxLength={24}
                  aria-label="Código de cupón"
                  className="h-10 flex-1 rounded-md border border-border bg-background px-3 font-mono text-sm uppercase outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => void submitCoupon()}
                  disabled={couponBusy || !couponInput.trim()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-accent/50 px-4 font-display text-xs font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  {couponBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Aplicar
                </button>
              </div>
            )}
            {couponMessage && (
              <p
                className={cn(
                  "mt-2 rounded-md border px-3 py-1.5 text-xs",
                  couponMessage.ok
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/40 bg-red-500/10 text-red-400"
                )}
              >
                {couponMessage.text}
              </p>
            )}
          </fieldset>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {itemCount} artícul{itemCount === 1 ? "o" : "os"} · envío{" "}
                {shipping === 0 ? "gratis" : formatMoney(shipping, currencyCode, rates)}
              </span>
              <span className="font-mono font-bold">{formatMoney(total, currencyCode, rates)}</span>
            </div>
            <button
              type="submit"
              disabled={loading || blocked}
              className="btn-glow-cta h-12 w-full rounded-md bg-cta font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-cta-strong active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                "Procesando pago..."
              ) : blocked ? (
                "Carrito con artículos agotados"
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pagar {formatMoney(total, currencyCode, rates)}
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep(0)}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Editar envío
          </button>
        </div>
      )}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {currencyCode !== "MXN" && (
          <>
            Monto informativo en tu moneda. El cargo se procesa en pesos mexicanos (MXN).{" "}
          </>
        )}
        Pago cifrado y seguro. Nunca almacenamos los datos de tu tarjeta.
      </p>
    </form>
  );
}

function WizardField({
  fieldKey,
  values,
  errors,
  touched,
  onBlur,
  onChange,
}: {
  fieldKey: FieldKey;
  values: Record<FieldKey, string>;
  errors: Record<FieldKey, boolean>;
  touched: Record<FieldKey, boolean>;
  onBlur: (map: Record<FieldKey, boolean>) => void;
  onChange: (key: FieldKey, value: string) => void;
}) {
  const meta = FIELD_LABELS[fieldKey];
  const invalid = touched[fieldKey] && errors[fieldKey];
  const valid = touched[fieldKey] && !errors[fieldKey];

  return (
    <label className={cn("block", meta.span)}>
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {meta.label}
        {valid && <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />}
      </span>
      <input
        value={values[fieldKey]}
        type={meta.type ?? "text"}
        autoComplete={meta.autoComplete}
        placeholder={meta.placeholder}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        onBlur={() => onBlur({ ...touched, [fieldKey]: true })}
        aria-invalid={invalid}
        required
        className={cn(
          "h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors",
          invalid
            ? "border-red-500/70 focus:border-red-500"
            : valid
              ? "border-emerald-500/60 focus:border-emerald-400"
              : "border-border focus:border-accent"
        )}
      />
      {invalid && (
        <span className="mt-1 block text-[11px] text-red-400">
          {fieldKey === "email"
            ? "Escribe un correo válido (ej. tu@correo.mx)"
            : fieldKey === "postalCode"
              ? "Código postal de 4 a 6 dígitos"
              : fieldKey === "address"
                ? "Incluye calle y número"
                : "Este campo es obligatorio"}
        </span>
      )}
    </label>
  );
}
