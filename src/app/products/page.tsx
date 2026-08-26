import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { scheduledFilter } from "@/lib/schedule";
import { ProductCard } from "@/components/product/product-card";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import type { BrandDTO, CategoryDTO, ProductDTO } from "@/lib/types";
import { withImagesAll } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tienda" };

const PER_PAGE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
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
    products = withImagesAll(rawProducts) as unknown as ProductDTO[];
    total = rawTotal;
    categories = rawCategories;
    brands = rawBrands;
  } catch {}

  const pages = Math.ceil(total / PER_PAGE);

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
      label: "Nuevos",
      active: !category && sort === "newest" && !q && !stock && Number.isNaN(min) && Number.isNaN(max),
      href: buildHref({ category: null, sort: "newest" }),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-disabled">Catalogo</span>
        <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {q ? `Resultados para "${q}"` : category ? `Categoria: ${category}` : "Toda la tienda"}
        </h1>
        <p className="mt-2 font-mono text-xs text-foreground-secondary">{total} productos</p>
      </header>

      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {quickFilters.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`whitespace-nowrap border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              f.active
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground-secondary hover:border-border-active hover:text-foreground"
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
            <div className="flex flex-col items-center justify-center border border-dashed border-border py-24 text-center">
              <span className="font-display text-3xl font-bold uppercase tracking-widest text-foreground-disabled">
                Sin resultados
              </span>
              <p className="mt-3 max-w-sm text-sm text-foreground-secondary">
                No encontramos productos con esos filtros. Prueba ajustando tu busqueda.
              </p>
              <Link
                href="/products"
                className="mt-6 bg-cta px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-cta-hover"
              >
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {pages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={buildHref({ page: String(page - 1) })}
                      className="border border-border px-4 py-2 font-display text-sm font-semibold uppercase transition-colors hover:border-border-active hover:text-foreground"
                    >
                      Anterior
                    </Link>
                  )}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={buildHref({ page: String(p) })}
                      className={`border px-4 py-2 font-display text-sm font-semibold transition-colors ${
                        p === page
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-border-active hover:text-foreground"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < pages && (
                    <Link
                      href={buildHref({ page: String(page + 1) })}
                      className="border border-border px-4 py-2 font-display text-sm font-semibold uppercase transition-colors hover:border-border-active hover:text-foreground"
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
