import { prisma } from "@/lib/prisma";
import { InventoryTable, type InventoryVariant } from "@/components/admin/inventory-table";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  let variants: InventoryVariant[] = [];
  try {
    const rows = await prisma.productVariant.findMany({
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ product: { name: "asc" } }, { title: "asc" }],
    });
    variants = rows.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      stock: v.stock,
      product: v.product,
    }));
  } catch {}

  const critical = variants.filter((v) => v.stock <= 2).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Inventario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {variants.length} variantes · {critical > 0 ? `${critical} en nivel crítico (≤2)` : "todo saludable"}
        </p>
        {critical > 0 && (
          <p className="mt-2 inline-block rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
            Las filas marcadas en rojo tienen stock crítico. Edita el número y presiona Enter o clic fuera para guardar.
          </p>
        )}
      </header>

      <InventoryTable variants={variants} />
    </div>
  );
}
