"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export function CosmosHero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-background">
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-accent/[0.04] blur-[120px]" />
        <div className="absolute -left-32 bottom-1/3 h-[400px] w-[400px] rounded-full bg-cta/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground-secondary animate-entrance animate-stagger-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            Skate Shop Premium
          </span>

          {/* Title */}
          <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block animate-entrance animate-stagger-2">Ride</span>
            <span className="block animate-entrance animate-stagger-3">Your Own</span>
            <span className="block text-accent animate-entrance animate-stagger-4">Orbit.</span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground-secondary animate-entrance animate-stagger-5">
            Equipo seleccionado. Marcas reales. Tablas, trucks, ruedas y streetwear
            para riders que marcan su propia ruta.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 animate-entrance animate-stagger-6">
            <Link
              href="/products"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Explorar Tienda
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/armador"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-foreground/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Arma tu Board
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-14 flex items-center gap-5 text-xs text-foreground-muted animate-entrance animate-stagger-7">
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-success" />
              Envio gratis +$999
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-success" />
              Pago seguro
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-success" />
              30 dias cambios
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-8 w-px bg-gradient-to-b from-foreground-muted/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
