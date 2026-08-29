"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/logo";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidget = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
    }
  ) => { reset: () => void };
  remove: (id: string) => void;
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<{ reset: () => void } | null>(null);
  const isLogin = mode === "login";

  useEffect(() => {
    if (!SITE_KEY || !holderRef.current) return;
    let cancelled = false;
    const holder = holderRef.current;
    const widgetId = `turnstile-${mode}`;
    holder.innerHTML = "";
    const div = document.createElement("div");
    div.id = widgetId;
    holder.appendChild(div);

    const win = window as unknown as TurnstileWindow;
    const render = () => {
      if (cancelled || !win.turnstile || !holder.isConnected) return;
      const widget = win.turnstile.render(div, {
        sitekey: SITE_KEY as string,
        theme: "dark",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
      });
      widgetRef.current = widget;
    };

    if (win.turnstile) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (typeof win.turnstile?.remove === "function") {
        try {
          win.turnstile.remove(widgetId);
        } catch {}
      }
      widgetRef.current = null;
      setTurnstileToken(null);
    };
  }, [mode]);

  function resetChallenge() {
    widgetRef.current?.reset();
    setTurnstileToken(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (SITE_KEY && !turnstileToken) {
      setError("Completa la verificación de seguridad para continuar.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    if (SITE_KEY) payload.turnstileToken = turnstileToken ?? "";

    const res = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setLoading(false);

    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => null) : null;
      setError(data?.error ?? "Ocurrió un error. Intenta de nuevo.");
      resetChallenge();
      return;
    }

    const next = searchParams.get("next");
    router.push(next ?? "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">
            {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLogin
              ? "Bienvenido de vuelta al crew"
              : "Únete y guarda tus pedidos favoritos"}
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <Field label="Nombre" name="name" type="text" placeholder="Tu nombre" required minLength={2} />
          )}
          <Field label="Correo" name="email" type="email" placeholder="tu@correo.co" required />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            placeholder={isLogin ? "••••••••" : "Mínimo 8 caracteres"}
            required
            minLength={isLogin ? undefined : 8}
          />

          {SITE_KEY && (
            <div>
              <div ref={holderRef} className="min-h-[65px] w-full overflow-hidden rounded-md" />
              <p className="mt-1.5 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                Protegido por Cloudflare Turnstile
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-glow-cta h-11 w-full rounded-md bg-cta font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-cta-strong active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Procesando..." : isLogin ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              ¿Sin cuenta?{" "}
              <Link href="/register" className="font-semibold text-accent hover:underline">
                Regístrate gratis
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Inicia sesión
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-accent"
      />
    </label>
  );
}

type TurnstileWindow = Window & { turnstile?: TurnstileWidget };