import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { stockAlertInputSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const limiter = rateLimit(`stockalert:${clientIp(req)}`, 8, 300_000);
  if (!limiter.ok) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = stockAlertInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    select: { id: true, stock: true },
  });
  if (!variant) return NextResponse.json({ error: "Variante no encontrada." }, { status: 404 });
  if (variant.stock > 0) {
    return NextResponse.json({ error: "Esta talla ya tiene stock disponible." }, { status: 400 });
  }

  await prisma.stockAlert.upsert({
    where: { variantId_email: { variantId: variant.id, email: parsed.data.email.toLowerCase() } },
    create: { variantId: variant.id, email: parsed.data.email.toLowerCase() },
    update: {},
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
