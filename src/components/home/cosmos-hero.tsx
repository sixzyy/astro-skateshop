"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Starfield } from "@/components/home/starfield";

export function CosmosHero() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      if (titleRef.current) {
        titleRef.current.style.translate = `0 ${y * 0.12}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      <Starfield density={30} />

      {/* Technical grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(var(--border-subtle) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Cosmic atmosphere — cyan top-right, violet bottom-left */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-accent/[0.05] blur-[120px]" />
        <div className="absolute -left-40 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-accent-secondary/[0.06] blur-[140px]" />
        <div className="absolute left-1/3 top-1/2 h-[20rem] w-[20rem] rounded-full bg-cosmic-violet/40 blur-[100px]" />
      </div>

      <div className="texture-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-block font-mono text-[11px] uppercase tracking-[0.3em] text-foreground-disabled">
            Skateshop &amp; Streetwear
          </span>

          <h1
            ref={titleRef}
            className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] tracking-tighter sm:text-7xl lg:text-8xl"
          >
            SKATE
            <br />
            BEYOND
            <br />
            <span className="text-foreground-muted">THE ORDINARY.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground-secondary">
            Equipo seleccionado. Marcas reales. Cultura autentica.
            Tablas, trucks, ruedas y streetwear para riders que no siguen orbitas ajenas.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/products"
              className="group inline-flex h-12 items-center gap-2 rounded-lg bg-cta px-7 font-display text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-cta-hover active:scale-[0.98]"
            >
              Explore Boards
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/armador"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border px-7 font-display text-sm font-bold uppercase tracking-wide text-foreground transition-all duration-300 hover:border-border-active"
            >
              Build Your Board
            </Link>
          </div>

          {/* Telemetry bar */}
          <div className="mt-16 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground-disabled">
            <span>Free shipping +$999</span>
            <span className="h-px w-4 bg-border" />
            <span>Secure checkout</span>
            <span className="h-px w-4 bg-border" />
            <span>30 day returns</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-disabled">
            Scroll to explore
          </span>
          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-foreground-disabled/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
