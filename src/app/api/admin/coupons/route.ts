import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { couponInputSchema } from "@/lib/validators";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const parsed = couponInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const exists = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (exists) return NextResponse.json({ error: "Ya existe un cupón con ese código." }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      minSubtotal: data.minSubtotal,
      startsAt: data.startsAt ?? null,
      expiresAt: data.expiresAt ?? null,
      maxUses: data.maxUses ?? null,
      active: data.active,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
