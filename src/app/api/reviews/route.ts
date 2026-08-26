import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { reviewInputSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Falta productId" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, rating: true, comment: true, createdAt: true },
  });

  const avg = reviews.length
    ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return NextResponse.json({ reviews, average: avg, count: reviews.length });
}

export async function POST(req: NextRequest) {
  const limiter = rateLimit(`review:${clientIp(req)}`, 5, 300_000);
  if (!limiter.ok) return NextResponse.json({ error: "Espera un momento antes de enviar otra reseña." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = reviewInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const session = await getSession();
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });

  await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session?.sub ?? null,
      name: parsed.data.name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      approved: false,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
