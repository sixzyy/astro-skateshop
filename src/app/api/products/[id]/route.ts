import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { productInputSchema } from "@/lib/validators";
import { withImages } from "@/lib/types";
import { extractProxiedImageUrl } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

function sanitizeImages(images: string[]): string[] {
  return images
    .map((img) => {
      if (img.startsWith("/")) return img;
      const real = extractProxiedImageUrl(img);
      return real || null;
    })
    .filter((img): img is string => img !== null);
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const row = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true, brand: true },
  });
  if (!row) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json({ product: withImages(row) });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (body && typeof body.published === "boolean" && Object.keys(body).length === 1) {
    const updated = await prisma.product.update({ where: { id }, data: { published: body.published } }).catch(() => null);
    if (!updated) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ product: updated });
  }

  // Actualización rápida del drop programado (panel Drops).
  if (body && Object.keys(body).length === 1 && "publishedAt" in body) {
    const raw: unknown = body.publishedAt;
    let date: Date | null = null;
    if (raw !== null && raw !== undefined && raw !== "") {
      const parsedDate = new Date(String(raw));
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Fecha de drop inválida." }, { status: 400 });
      }
      date = parsedDate;
    }
    const updated = await prisma.product.update({
      where: { id },
      data: { publishedAt: date },
    }).catch(() => null);
    if (!updated) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ product: withImages(updated) });
  }

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const sanitizedImages = sanitizeImages(data.images);
    const product = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          images: JSON.stringify(sanitizedImages),
          specs: data.specs ? JSON.stringify(data.specs) : undefined,
          featured: data.featured,
          published: data.published,
          publishedAt: data.publishedAt ?? null,
          categoryId: data.categoryId,
          brandId: data.brandId,
          variants: {
            create: data.variants.map((v, i) => ({
              title: v.title,
              stock: v.stock,
              sku: v.sku || `${id.slice(-6).toUpperCase()}-${i + 1}-${Date.now().toString(36)}`,
            })),
          },
        },
        include: { variants: true, category: true, brand: true },
      });
    });

    return NextResponse.json({ product: withImages(product) });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 400 });
  }
}
