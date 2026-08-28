import { prisma } from "@/lib/prisma";
import { scheduledFilter } from "@/lib/schedule";
import { BoardBuilder } from "@/components/armador/board-builder";
import { withImagesAll, type ProductDTO } from "@/lib/types";

export const metadata = {
  title: "Armador 3D — Astro SkateShop",
  description: "Arma tu setup completo en 3D: tabla, trucks, ruedas y grip de la tienda.",
};

async function byCategory(slug: string) {
  const products = await prisma.product.findMany({
    where: {
      AND: [
        { published: true },
        scheduledFilter(),
        { variants: { some: { stock: { gt: 0 } } } },
        { category: { slug } },
      ],
    },
    include: {
      brand: true,
      category: true,
      variants: { orderBy: { title: "asc" } },
    },
    take: 12,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return withImagesAll(JSON.parse(JSON.stringify(products)) as ProductDTO[]) as ProductDTO[];
}

export default async function ArmadorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [decks, trucks, wheels, grips] = await Promise.all([
    byCategory("tablas"),
    byCategory("trucks"),
    byCategory("ruedas"),
    byCategory("grips"),
  ]);

  const sp = await searchParams;
  const asString = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const initial = {
    decks: asString(sp.tabla),
    trucks: asString(sp.trucks),
    wheels: asString(sp.ruedas),
    grips: asString(sp.grip),
  };

  return (
    <BoardBuilder decks={decks} trucks={trucks} wheels={wheels} grips={grips} initial={initial} />
  );
}
