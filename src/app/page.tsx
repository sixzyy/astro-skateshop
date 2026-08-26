import Link from "next/link";
import { ArrowRight, ArrowUpRight, Footprints, Grip, RefreshCcw, Shirt, Truck, ShieldCheck, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { nextScheduledDrop, scheduledFilter } from "@/lib/schedule";
import { ProductCard } from "@/components/product/product-card";
import { CosmosHero } from "@/components/home/cosmos-hero";
import { GiantMarquee } from "@/components/home/giant-marquee";
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
        <div className="mx-auto mt-6 w-[calc(100%-1.5rem)] max-w-7xl border border-border bg-background-secondary px-4 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-foreground-secondary sm:w-full">
          {announcement}
        </div>
      )}
      {drop?.publishedAt && (
        <DropBanner name={drop.name} slug={drop.slug} date={drop.publishedAt.toISOString()} />
      )}

      <CosmosHero />

      <GiantMarquee
        items={["Santa Cruz", "Independent", "Spitfire", "Element", "Vans", "Nike SB", "Thrasher"]}
      />

      {/* Trust strip */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Envio gratis", text: "En compras desde $999 MXN" },
            { icon: ShieldCheck, title: "Pago seguro", text: "Stripe + cifrado SSL" },
            { icon: RefreshCcw, title: "Cambios faciles", text: "30 dias para cambios y devoluciones" },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 border border-border bg-background-secondary/50 p-6"
            >
              <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground-disabled" strokeWidth={1.5} />
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wide">{f.title}</h3>
                <p className="mt-1 text-sm text-foreground-secondary">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionHeading kicker="Explora" title="Compra por categoria" href="/products" linkText="Ver todo" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Zap;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 border border-border bg-background-secondary/30 p-6 text-center transition-all duration-250 hover:border-border-active hover:-translate-y-0.5"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground-secondary transition-colors group-hover:border-border-active group-hover:text-foreground">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-display text-sm font-bold uppercase tracking-wide">{cat.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-disabled">
                    {cat._count.products} items
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <GiantMarquee reverse items={["Patinando", "Astro Skateshop", "Grit + Cosmos"]} />

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="Recien llegados"
            title="Nuevos arribos"
            href="/products?sort=newest"
            linkText="Ver todos"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p as unknown as ProductDTO} />
            ))}
          </div>
        </section>
      )}

      {/* Setup section */}
      <section className="border-y border-border-subtle bg-background-secondary/30">
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-disabled">
            Tu setup, tu forma
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-4xl">
            El setup completo,{" "}
            <span className="text-foreground-disabled">sin excusas</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground-secondary">
            Arma tu skate pieza por pieza con producto original. Nuestro equipo te asesora gratis
            para elegir la medida correcta antes de tu proximo despegue.
          </p>
          <Link
            href="/armador"
            className="mt-8 inline-flex h-12 items-center gap-2 border border-border px-7 font-display text-sm font-bold uppercase tracking-wide text-foreground transition-colors hover:border-border-active"
          >
            Arma tu setup <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="Destacados"
            title="Lanzamientos destacados"
            href="/products"
            linkText="Ver catalogo"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p as unknown as ProductDTO}
                className={i === 0 ? "lg:col-span-2" : ""}
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-foreground-secondary transition-colors hover:text-foreground"
            >
              Explorar todo el catalogo
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
  href,
  linkText,
}: {
  kicker: string;
  title: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="relative mb-10 flex items-end justify-between gap-4">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-disabled">
          {kicker}
        </span>
        <h2 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="hidden shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-foreground-secondary underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-border-active sm:inline-flex"
      >
        {linkText} &rarr;
      </Link>
    </div>
  );
}
