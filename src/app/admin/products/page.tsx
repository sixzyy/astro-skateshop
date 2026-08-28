import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BadgeOutline } from "@/components/ui/badge";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatPrice } from "@/lib/utils";
import { withImagesAll } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    published: boolean;
    featured: boolean;
    brand: { name: string };
    category: { name: string };
    variants: { stock: number }[];
  }[] = [];

  try {
    products = withImagesAll(
      await prisma.product.findMany({
        include: { variants: true, category: true, brand: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    );
  } catch {}

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} productos en catálogo</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-5 font-display text-xs font-bold uppercase tracking-wide text-zinc-950 hover:bg-accent-strong"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No hay productos todavía. Crea el primero.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-display text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3.5 font-bold">Producto</th>
                <th className="px-5 py-3.5 font-bold">Categoría</th>
                <th className="px-5 py-3.5 font-bold">Precio</th>
                <th className="px-5 py-3.5 font-bold">Stock</th>
                <th className="px-5 py-3.5 font-bold">Estado</th>
                <th className="px-5 py-3.5 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                return (
                  <tr key={p.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-10 w-10 rounded-md border border-border object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.category.name}</td>
                    <td className="px-5 py-3 font-display font-bold">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">
                      <span className={totalStock === 0 ? "text-red-500" : totalStock <= 5 ? "text-yellow-500" : ""}>
                        {totalStock} u.
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <BadgeOutline className={p.published ? "" : "border-red-500/40 text-red-500"}>
                        {p.published ? "Publicado" : "Oculto"}
                      </BadgeOutline>
                    </td>
                    <td className="px-5 py-3">
                      <ProductRowActions id={p.id} published={p.published} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
