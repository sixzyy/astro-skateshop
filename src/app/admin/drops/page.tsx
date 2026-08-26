import { prisma } from "@/lib/prisma";
import { DropsManager, type DropProduct } from "@/components/admin/drops-manager";
import { parseImages } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDropsPage() {
  let drops: DropProduct[] = [];
  try {
    const rows = await prisma.product.findMany({
      where: { publishedAt: { not: null } },
      include: { variants: true },
      orderBy: { publishedAt: "asc" },
    });
    drops = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: parseImages(p.images)[0] ?? null,
      publishedAt: (p.publishedAt ?? new Date()).toISOString(),
      totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
    }));
  } catch {}

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Drops</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lanzamientos programados. Cambia fechas, quita drops o revisa que tengan stock antes del despegue.
        </p>
      </header>
      <DropsManager drops={drops} />
    </div>
  );
}
