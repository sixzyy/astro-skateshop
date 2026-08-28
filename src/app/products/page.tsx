import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { scheduledFilter } from "@/lib/schedule";
import { ProductCard } from "@/components/product/product-card";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { BrandDTO, CategoryDTO, ProductDTO } from "@/lib/types";
import { withImagesAll } from "@/lib/types";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const category = single(sp.category);
  const q = single(sp.q);
  const title = q ? `Búsqueda: ${q}` : category ? `Categoría: ${category}` : "Tienda";
  return {
    title,
    description: `Catálogo${category ? ` de ${category}` : ""} de tablas, trucks, ruedas, grip, tenis y ropa. Envío gratis desde $999 COP en toda Colombia.`,
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = single(sp.category);
  const brand = single(sp.brand);
  const q = single(sp.q);
  const min = Number(single(sp.min));
  const max = Number(single(sp.max));
  const stock = single(sp.stock);
  const sort = single(sp.sort) ?? "newest";
  const page = Math.max(1, Number(single(sp.page) ?? 1));

  const where: Record<string, unknown> = scheduledFilter();
  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (q) where.OR = [{ name: { contains: q } }, { description: { contains: q } }];
  if ((min > 0 && !Number.isNaN(min)) || (max > 0 && !Number.isNaN(max))) {
    where.price = {
      ...((min > 0 && !Number.isNaN(min)) ? { gte: min } : {}),
      ...((max > 0 && !Number.isNaN(max)) ? { lte: max } : {}),
    };
  }
  if (stock === "1") where.variants = { some: { stock: { gt: 0 } } };

  let products: ProductDTO[] = [];
  let total = 0;
  let categories: CategoryDTO[] = [];
  let brands: BrandDTO[] = [];
  let ratings: Record<string, { average: number; count: number }> = {};

  try {
    const [rawProducts, rawTotal, rawCategories, rawBrands] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, category: true, brand: true },
        orderBy:
          sort === "price_asc"
            ? { price: "asc" }
            : sort === "price_desc"
              ? { price: "desc" }
              : { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
    products = withImagesAll(rawProducts);
    total = rawTotal;
    categories = rawCategories;
    brands = rawBrands;
    if (rawProducts.length > 0) {
      const grouped = await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: rawProducts.map((p) => p.id) }, approved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });
      ratings = Object.fromEntries(
        grouped.map((r) => [
          r.productId,
          { average: Number((r._avg.rating ?? 0).toFixed(1)), count: r._count.rating },
        ])
      );
    }
  } catch {}

  const pages = Math.ceil(total / PER_PAGE);

  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const itemListJsonLd = products.length
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: q ? `Resultados de búsqueda: ${q}` : category ? `Categoría ${category}` : "Catálogo de tienda",
        numberOfItems: total,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BASE}/products/${p.slug}`,
          name: p.name,
          ...(p.images[0] ? { image: p.images[0] } : {}),
        })),
      })
    : null;

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const val = single(v as string | string[] | undefined);
      if (val && k !== "page" && !(k in overrides)) params.set(k, val);
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  const quickFilters = [
    { label: "Todos", active: !category && !q && !stock && Number.isNaN(min) && Number.isNaN(max), href: buildHref({ category: null, sort: null }) },
    ...categories.map((c) => ({
      label: c.name,
      active: category === c.slug,
      href: buildHref({ category: c.slug, sort: null }),
    })),
    {
      label: "Nuevos lanzamientos",
      active: !category && sort === "newest" && !q && !stock && Number.isNaN(min) && Number.isNaN(max),
      href: buildHref({ category: null, sort: "newest" }),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: itemListJsonLd }}
        />
      )}
      <header className="mb-8">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Catálogo</span>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {q ? `Resultados para "${q}"` : category ? `Categoría: ${category}` : "Toda la tienda"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{total} productos encontrados</p>
      </header>

      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {quickFilters.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
              f.active
                ? "border-accent bg-accent/10 text-accent shadow-[0_0_16px_rgba(111,200,233,0.2)]"
                : "border-border text-muted-foreground hover:border-accent/60 hover:text-accent"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <CatalogFilters categories={categories} brands={brands} />

        <div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
              <span className="-rotate-3 font-display text-4xl font-bold uppercase tracking-widest text-muted-foreground/50">
                Sin resultados
              </span>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                No encontramos productos con esos filtros. Prueba ajustando tu búsqueda.
              </p>
              <Link
                href="/products"
                className="btn-glow-cta mt-6 rounded-md bg-cta px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-zinc-950 hover:bg-cta-strong"
              >
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
                ))}
              </div>

              {pages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={buildHref({ page: String(page - 1) })}
                      className="rounded-md border border-border px-4 py-2 font-display text-sm font-semibold uppercase hover:border-accent hover:text-accent"
                    >
                      Anterior
                    </Link>
                  )}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={buildHref({ page: String(p) })}
                      className={`rounded-md border px-4 py-2 font-display text-sm font-semibold ${
                        p === page
                          ? "border-cta bg-cta text-zinc-950 shadow-[0_0_14px_rgba(70,212,191,0.4)]"
                          : "border-border hover:border-accent hover:text-accent"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < pages && (
                    <Link
                      href={buildHref({ page: String(page + 1) })}
                      className="rounded-md border border-border px-4 py-2 font-display text-sm font-semibold uppercase hover:border-accent hover:text-accent"
                    >
                      Siguiente
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



