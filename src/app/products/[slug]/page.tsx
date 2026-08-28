import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, RefreshCcw, ShieldCheck, Truck, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { scheduledFilter } from "@/lib/schedule";
import { Gallery } from "@/components/product/gallery";
import { AddToCart } from "@/components/product/add-to-cart";
import { ProductCard } from "@/components/product/product-card";
import { HeartButton } from "@/components/product/heart-button";
import { ReviewsSection } from "@/components/product/reviews-section";
import { DropCountdown } from "@/components/product/drop-countdown";
import { Price } from "@/components/ui/price";
import type { ProductDTO } from "@/lib/types";
import { withImages, withImagesAll } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  try {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true, category: true, brand: true },
    });
    return row ? withImages(row) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: new URL(product.images[0], base).toString() }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.published) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inStock = product.variants.some((v) => v.stock > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => new URL(img, base).toString()),
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      url: `${base}/products/${product.slug}`,
      priceCurrency: "COP",
      price: product.price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  // Drop programado: la página es pública con cuenta regresiva,
  // pero sin compra hasta que llegue la hora del lanzamiento.
  if (product.publishedAt && product.publishedAt > new Date()) {
    const launch = product.publishedAt.toLocaleString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Gallery images={product.images} name={product.name} />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{product.brand.name}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-cta/50 bg-cta/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-cta">
              <Zap className="h-3.5 w-3.5" /> Drop próximamente
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-baseline gap-3">
              <Price amount={product.price} className="font-display text-3xl font-bold" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">precio de lanzamiento</span>
            </div>

            <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-6">
              <DropCountdown date={product.publishedAt.toISOString()} />
            </div>

            <p className="mt-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Se libera automáticamente el{" "}
              <strong className="text-foreground">{launch}</strong>. Vuelve en ese momento y estará
              disponible para comprar.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Envío gratis +$999" },
                { icon: ShieldCheck, label: "Pago seguro" },
                { icon: RefreshCcw, label: "Cambios en 30 días" },
              ].map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <f.icon className="h-4 w-4 shrink-0 text-accent" /> {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  let related: ProductDTO[] = [];
  let reviews: { id: string; name: string; rating: number; comment: string; createdAt: Date }[] = [];
  try {
    const [rawRelated, rawReviews] = await Promise.all([
      prisma.product.findMany({
        where: { ...scheduledFilter(), categoryId: product.categoryId, id: { not: product.id } },
        include: { variants: true, category: true, brand: true },
        take: 4,
      }),
      prisma.review.findMany({
        where: { productId: product.id, approved: true },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, name: true, rating: true, comment: true, createdAt: true },
      }),
    ]);
    related = withImagesAll(rawRelated) as unknown as ProductDTO[];
    reviews = rawReviews;
  } catch {}

  const average = reviews.length
    ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const specs = (product.specs ?? null) as Record<string, string> | null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la tienda
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={product.images} name={product.name} />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{product.brand.name}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <HeartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
              }}
              className="mt-1.5 h-10 w-10 shrink-0"
            />
          </div>
          {reviews.length > 0 && average !== null && (
            <a href="#resenas" className="mt-2 inline-flex items-center gap-2 text-sm">
              <span className="tracking-wide text-cta">
                {"★".repeat(Math.round(average))}
                <span className="text-muted-foreground/40">{"★".repeat(5 - Math.round(average))}</span>
              </span>
              <span className="text-muted-foreground underline hover:text-accent">
                {average} · {reviews.length} reseña{reviews.length === 1 ? "" : "s"}
              </span>
            </a>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <Price amount={product.price} className="font-display text-3xl font-bold" />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  <Price amount={product.compareAtPrice} />
                </span>
                <span className="rounded-sm bg-accent px-2 py-0.5 font-display text-xs font-bold uppercase text-zinc-950">
                  Ahorra{" "}
                  {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-7 border-t border-border pt-7">
            <AddToCart product={product as unknown as ProductDTO} />
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Envío gratis +$999" },
              { icon: ShieldCheck, label: "Pago seguro" },
              { icon: RefreshCcw, label: "Cambios en 30 días" },
            ].map((f) => (
              <li key={f.label} className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <f.icon className="h-4 w-4 shrink-0 text-accent" /> {f.label}
              </li>
            ))}
          </ul>

          {specs && Object.keys(specs).length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest">Especificaciones</h2>
              <dl className="divide-y divide-border rounded-lg border border-border bg-card px-4">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="font-display font-bold uppercase tracking-wide text-muted-foreground">{key}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ReviewsSection
        productId={product.id}
        productSlug={product.slug}
        initialReviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        initialAverage={average}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-2xl font-bold uppercase tracking-tight">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


