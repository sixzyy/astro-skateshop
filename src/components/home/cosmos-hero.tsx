"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Starfield } from "@/components/home/starfield";

export function CosmosHero() {
  const deckRef = useRef<HTMLDivElement>(null);
  const deckWrapRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      if (deckRef.current) {
        deckRef.current.style.transform = `rotateX(52deg) rotateZ(${Math.min(y * 0.09, 170)}deg)`;
      }
      if (deckWrapRef.current) {
        deckWrapRef.current.style.transform = `translateY(${-y * 0.08}px)`;
      }
      if (nebulaRef.current) {
        nebulaRef.current.style.transform = `translateY(${y * 0.14}px)`;
      }
      if (titleRef.current) {
        titleRef.current.style.translate = `0 ${y * 0.18}px`;
      }
      if (mapRef.current) {
        mapRef.current.style.opacity = String(Math.min(1, Math.max(0, (y - 120) / 380)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <Starfield />
      <div ref={nebulaRef} className="pointer-events-none absolute inset-0">
        <div className="animate-nebula absolute -left-40 -top-32 h-[34rem] w-[34rem] rounded-full bg-galaxy/50 blur-3xl" />
        <div
          className="animate-nebula absolute -bottom-40 right-[-10rem] h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-3xl"
          style={{ animationDelay: "-7s" }}
        />
      </div>
      <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-sm border border-accent/40 bg-accent/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
            {"// Temporada órbita · Drop 03"}
          </span>
          <h1
            ref={titleRef}
            className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl"
          >
            Patinando
            <br />
            sobre la{" "}
            <span className="bg-gradient-to-r from-accent via-white to-cta bg-clip-text text-transparent">
              gravedad
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground">
            Equipo de skate seleccionado entre nebulosas. Tablas con estampados de constelaciones, ruedas que giran
            como planetas y grips cargados de polvo estelar.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="btn-glow-cta inline-flex h-13 items-center gap-2 rounded-md bg-cta px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-cta-strong active:scale-[0.98]"
            >
              Lánzate al cosmos <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
            </Link>
            <Link
              href="/products?category=tablas"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground underline decoration-accent/40 underline-offset-8 transition-colors hover:text-accent"
            >
              ver misiones →
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <li>[ Envío gratis +$999 ]</li>
            <li>[ Pago seguro ]</li>
            <li>[ Cambios 30 días ]</li>
          </ul>
        </div>

        <div className="relative hidden h-[480px] items-center justify-center lg:flex">
          <div className="animate-spin-slower absolute h-80 w-80 rounded-full border border-dashed border-accent/25" />
          <div
            className="animate-spin-slower absolute h-96 w-96 rounded-full border border-border/70"
            style={{ animationDirection: "reverse", animationDuration: "40s" }}
          />
          <div ref={deckWrapRef} className="relative">
            <div className="animate-float">
              <div ref={deckRef} style={{ transformStyle: "preserve-3d", transform: "rotateX(52deg)" }}>
                <div className="grip-texture relative h-[84px] w-[300px] rounded-[2rem] border border-accent/30 shadow-[0_0_60px_rgba(0,240,255,0.22)]">
                  <svg viewBox="0 0 300 84" className="absolute inset-0 h-full w-full opacity-90">
                    <g stroke="#00f0ff" strokeWidth="1" opacity="0.75">
                      <line x1="52" y1="24" x2="98" y2="44" />
                      <line x1="98" y1="44" x2="140" y2="26" />
                      <line x1="196" y1="58" x2="232" y2="36" />
                      <line x1="232" y1="36" x2="264" y2="52" />
                    </g>
                    <g fill="#eafcff">
                      <circle cx="52" cy="24" r="2.6" />
                      <circle cx="98" cy="44" r="2" />
                      <circle cx="140" cy="26" r="3" fill="#ff6b00" />
                      <circle cx="196" cy="58" r="2.2" />
                      <circle cx="232" cy="36" r="2.6" />
                      <circle cx="264" cy="52" r="1.8" />
                    </g>
                  </svg>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.35em] text-accent/70">
                    astro deck // 001
                  </span>
                </div>
                <div className="absolute inset-x-12 top-full flex justify-between">
                  {[0, 1].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="h-5 w-1.5 bg-zinc-600" />
                      <span className="h-9 w-9 rounded-full border border-cta/70 bg-[radial-gradient(circle_at_32%_28%,#ffb066,#ff6b00_48%,#571d00_100%)] shadow-[0_0_24px_rgba(255,107,0,0.55)]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            ref={mapRef}
            className="panel-corners absolute bottom-0 left-1/2 w-72 -translate-x-1/2 border border-cta/30 bg-background/85 p-3 font-mono text-[10px] uppercase tracking-widest text-cta opacity-0 backdrop-blur"
          >
            <p>mapa estelar // capa de grip</p>
            <svg viewBox="0 0 260 40" className="mt-2 h-10 w-full">
              <g fill="#ff6b00" opacity="0.85">
                <circle cx="16" cy="28" r="1.6" />
                <circle cx="58" cy="12" r="1.2" />
                <circle cx="102" cy="30" r="1.8" />
                <circle cx="150" cy="14" r="1.2" />
                <circle cx="198" cy="26" r="1.6" />
                <circle cx="242" cy="10" r="1.2" />
              </g>
              <g stroke="#00f0ff" strokeWidth="0.7" opacity="0.5">
                <line x1="16" y1="28" x2="58" y2="12" />
                <line x1="58" y1="12" x2="102" y2="30" />
                <line x1="150" y1="14" x2="198" y2="26" />
                <line x1="198" y1="26" x2="242" y2="10" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
