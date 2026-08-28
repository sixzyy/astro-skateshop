import Link from "next/link";
import { ArrowRight, ArrowUpRight, Footprints, Grip, RefreshCcw, Shirt, Truck, ShieldCheck, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { nextScheduledDrop, scheduledFilter } from "@/lib/schedule";
import { ProductCard } from "@/components/product/product-card";
import { CosmosHero } from "@/components/home/cosmos-hero";
import { BrandLogos } from "@/components/home/brand-logos";
import { AstroCommunity } from "@/components/home/community";
import { DropBanner } from "@/components/home/drop-banner";
import type { ProductDTO } from "@/lib/types";
import { withImagesAll } from "@/lib/types";

export const dynamic = "force-dynamic";

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

const CATEGORY_ICONS: Record<string, IconComponent> = {
  tablas: SkateboardIcon,
  grips: Grip,
  trucks: Truck,
  ruedas: CircleDotIcon,
  tenis: Footprints,
  ropa: Shirt,
};

const TAGS = ["LANZAMIENTO", "ÓRBITA", "MISIÓN"];

function SkateboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M3 13h18" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 9c1.5-1.5 3.5-1.5 5 0M14 9c1.5-1.5 3.5-1.5 5 0" />
    </svg>
  );
}

function CircleDotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

async function getHomeData() {
  try {
    const [newArrivals, featured, categories] = await Promise.all([
      prisma.product.findMany({
        where: scheduledFilter(),
        include: { variants: true, category: true, brand: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { ...scheduledFilter(), featured: true },
        include: { variants: true, category: true, brand: true },
        take: 4,
      }),
      prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }),
    ]);
    return { newArrivals: withImagesAll(newArrivals), featured: withImagesAll(featured), categories };
  } catch {
    return { newArrivals: [] as ProductDTO[], featured: [] as ProductDTO[], categories: [] };
  }
}

export default async function HomePage() {
  const { newArrivals, featured, categories } = await getHomeData();
  let drop: Awaited<ReturnType<typeof nextScheduledDrop>> = null;
  let announcement = "";
  try {
    [drop, announcement] = await Promise.all([
      nextScheduledDrop(),
      prisma.setting.findUnique({ where: { key: "announcement" } }).then((s) => s?.value ?? ""),
    ]);
  } catch {}

  return (
    <>
      {announcement.trim() && (
        <div className="animate-fade-up mx-auto mt-6 w-[calc(100%-1.5rem)] max-w-7xl rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-center font-mono text-xs uppercase tracking-[0.2em] text-accent sm:w-full">
          {announcement}
        </div>
      )}
      {drop?.publishedAt && (
        <DropBanner name={drop.name} slug={drop.slug} date={drop.publishedAt.toISOString()} />
      )}

      <CosmosHero />

      <BrandLogos />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Envío gratis", text: "En compras desde $999 COP a toda la galaxia" },
            { icon: ShieldCheck, title: "Pago 100% seguro", text: "Procesado con Stripe y cifrado SSL" },
            { icon: RefreshCcw, title: "Cambios fáciles", text: "30 días para cambios y devoluciones" },
          ].map((f) => (
            <div
              key={f.title}
              className="panel-corners flex items-start gap-4 border border-border/70 bg-card/40 p-6"
            >
              <f.icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wide">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionHeading kicker="// explora las órbitas" title="Compra por categoría" ghost="ÓRBITAS" href="/products" linkText="Ver todo" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Zap;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative flex flex-col items-center gap-3 overflow-hidden border border-border/70 bg-gradient-to-b from-galaxy/40 to-card p-6 text-center transition-all hover:border-accent/60 hover:-translate-y-0.5"
                >
                  <span className="absolute -right-7 -top-7 h-20 w-20 rounded-full border border-dashed border-accent/25 transition-transform duration-700 group-hover:rotate-90 group-hover:border-accent/60" />
                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background transition-colors group-hover:bg-accent group-hover:text-zinc-950">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </span>
                  <span className="font-display text-sm font-bold uppercase tracking-wide">{cat.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {cat._count.products} en órbita
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="// recién aterrizados"
            title="Nuevos arribos"
            ghost="DROP 03"
            href="/products?sort=newest"
            linkText="Ver todos"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} tag={TAGS[i % TAGS.length]} />
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden border-y border-accent/15 bg-[radial-gradient(ellipse_at_70%_50%,rgba(39,64,111,0.55),transparent_60%)]">
        <div className="scanlines pointer-events-none absolute inset-0 opacity-50" />
        <div className="animate-float absolute -right-24 top-1/2 hidden h-96 w-96 -translate-y-1/2 md:block" style={{ animationDuration: "9s" }}>
          <div className="relative h-full w-full rounded-full bg-[radial-gradient(circle_at_32%_28%,#6f8fe0,#27406f_52%,#0f1d40_100%)] shadow-[0_0_90px_rgba(39,64,111,0.9)]">
            <span className="absolute left-[22%] top-[18%] h-10 w-10 rounded-full bg-galaxy-deep/80" />
            <span className="absolute right-[20%] top-[48%] h-14 w-14 rounded-full bg-galaxy-deep/70" />
            <span className="absolute bottom-[16%] left-[38%] h-7 w-7 rounded-full bg-galaxy-deep/80" />
            <div className="animate-spin-slower absolute -inset-10">
              <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-cta shadow-[0_0_18px_rgba(70,212,191,0.9)]" />
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// misión secundaria"}</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
            El setup completo,{" "}
            <span className="bg-gradient-to-r from-accent to-cta bg-clip-text text-transparent">sin excusas</span>
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Arma tu skate pieza por pieza con producto original. Nuestro equipo te asesora gratis para elegir la medida
            correcta antes de tu próximo despegue.
          </p>
          <Link
            href="/products?category=grips"
            className="btn-glow-cyan mt-8 inline-flex h-12 items-center gap-2 rounded-md border border-accent/60 px-7 font-display text-sm font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-zinc-950"
          >
            Completa tu setup <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="// selección de cabina"
            title="Lanzamientos destacados"
            ghost="DESTACADOS"
            href="/products"
            linkText="Ver catálogo"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                tag={TAGS[i % TAGS.length]}
                className={i === 0 ? "lg:col-span-2" : ""}
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-accent"
            >
              Explorar todo el catálogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      <AstroCommunity />
    </>
  );
}

function SectionHeading({
  kicker,
  title,
  ghost,
  href,
  linkText,
}: {
  kicker: string;
  title: string;
  ghost?: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="relative mb-10 flex items-end justify-between gap-4">
      {ghost && (
        <span
          aria-hidden="true"
          className="text-stroke-soft pointer-events-none absolute -top-7 left-0 select-none whitespace-nowrap font-display text-6xl font-extrabold uppercase tracking-tight md:text-7xl"
        >
          {ghost}
        </span>
      )}
      <div className="relative">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{kicker}</span>
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <Link
        href={href}
        className="link-glitch hidden shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline-flex"
      >
        {linkText} →
      </Link>
    </div>
  );
}



