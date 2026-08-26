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

      {/* Cosmic atmosphere — deeper, animated entrance */}
      <div className="pointer-events-none absolute inset-0" style={{ animation: "fade-in 1.4s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
        <div className="absolute -right-32 top-1/4 h-[36rem] w-[36rem] rounded-full bg-accent/[0.08] blur-[150px]" />
        <div className="absolute -left-40 bottom-1/4 h-[40rem] w-[40rem] rounded-full bg-accent-secondary/[0.09] blur-[170px]" />
        <div className="absolute left-1/3 top-1/2 h-[28rem] w-[28rem] rounded-full bg-cosmic-violet/50 blur-[130px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[16rem] w-[16rem] rounded-full bg-cta/[0.03] blur-[100px]" />
      </div>

      <div className="texture-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Kicker */}
          <span className="inline-block font-mono text-[11px] uppercase tracking-[0.3em] text-foreground-disabled animate-entrance animate-stagger-1">
            Skateshop &amp; Streetwear
          </span>

          {/* Title — each line staggered independently */}
          <h1 ref={titleRef} className="mt-4 font-display font-extrabold uppercase leading-[0.85] tracking-tighter">
            <span className="block text-[clamp(3.5rem,10vw,9rem)] animate-entrance animate-stagger-2">
              SKATE
            </span>
            <span className="block text-[clamp(3.5rem,10vw,9rem)] animate-entrance animate-stagger-3">
              BEYOND
            </span>
            <span className="block text-[clamp(3.5rem,10vw,9rem)] text-foreground-muted animate-entrance animate-stagger-4">
              THE ORDINARY.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-md text-base leading-relaxed text-foreground-secondary animate-entrance animate-stagger-5">
            Equipo seleccionado. Marcas reales. Cultura autentica.
            Tablas, trucks, ruedas y streetwear para riders que no siguen orbitas ajenas.
          </p>

          {/* CTA buttons — pulse glow on primary */}
          <div className="mt-10 flex flex-wrap items-center gap-5 animate-entrance animate-stagger-6">
            <Link
              href="/products"
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-lg bg-cta px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:bg-cta-hover hover:shadow-[0_8px_30px_rgba(255,90,31,0.25)] active:scale-[0.98] animate-pulse-glow"
            >
              Explore Boards
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
            </Link>
            <Link
              href="/armador"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-lg border border-border px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:border-border-active hover:shadow-[0_8px_30px_rgba(84,216,255,0.08)] active:scale-[0.98]"
            >
              Build Your Board
            </Link>
          </div>

          {/* Telemetry bar */}
          <div className="mt-16 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground-disabled animate-entrance animate-stagger-7">
            <span>Free shipping +$999</span>
            <span className="h-px w-4 bg-border" />
            <span>Secure checkout</span>
            <span className="h-px w-4 bg-border" />
            <span>30 day returns</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-entrance animate-stagger-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-disabled">
            Scroll to explore
          </span>
          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-foreground-disabled/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
