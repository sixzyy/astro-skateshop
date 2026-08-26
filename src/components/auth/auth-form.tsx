"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/layout/logo";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setLoading(false);

    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => null) : null;
      setError(data?.error ?? "Ocurrio un error. Intenta de nuevo.");
      return;
    }

    const next = searchParams.get("next");
    router.push(next ?? "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="border border-border bg-background-secondary/50 p-8">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">
            {isLogin ? "Inicia sesion" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1.5 text-sm text-foreground-secondary">
            {isLogin
              ? "Bienvenido de vuelta al crew"
              : "Unete y guarda tus pedidos favoritos"}
          </p>
        </div>

        {error && (
          <p className="mb-4 border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <Field label="Nombre" name="name" type="text" placeholder="Tu nombre" required minLength={2} />
          )}
          <Field label="Correo" name="email" type="email" placeholder="tu@correo.mx" required />
          <Field
            label="Contrasena"
            name="password"
            type="password"
            placeholder={isLogin ? "********" : "Minimo 8 caracteres"}
            required
            minLength={isLogin ? undefined : 8}
          />

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-cta font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-cta-hover active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Procesando..." : isLogin ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-secondary">
          {isLogin ? (
            <>
              Sin cuenta?{" "}
              <Link href="/register" className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70">
                Registrate gratis
              </Link>
            </>
          ) : (
            <>
              Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-foreground/70">
                Inicia sesion
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
      <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-foreground-disabled">
        {label}
      </span>
      <input
        {...props}
        className="h-11 w-full border border-border bg-background-secondary px-3 text-sm outline-none transition-colors focus:border-border-active"
      />
    </label>
  );
}
