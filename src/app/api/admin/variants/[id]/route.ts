import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { sendRestockAlerts } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const stock = Number(body?.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 10_000) {
    return NextResponse.json({ error: "El stock debe ser un entero entre 0 y 10,000." }, { status: 400 });
  }

  try {
    const variant = await prisma.productVariant.update({
      where: { id },
      data: { stock },
      include: {
        product: { select: { name: true, slug: true } },
        stockAlerts: { where: { notifiedAt: null }, select: { email: true } },
      },
    });

    // Restock: notifica a los suscritos y márcalos como avisados.
    let notified: string[] = [];
    if (variant.stock > 0 && variant.stockAlerts.length > 0) {
      const emails = variant.stockAlerts.map((a) => a.email);
      await sendRestockAlerts({ product: variant.product.name, variantTitle: variant.title, emails });
      await prisma.stockAlert.updateMany({
        where: { variantId: id, notifiedAt: null },
        data: { notifiedAt: new Date() },
      });
      notified = emails;
    }

    return NextResponse.json({ variant, pendingAlerts: notified });
  } catch {
    return NextResponse.json({ error: "Variante no encontrada." }, { status: 404 });
  }
}
