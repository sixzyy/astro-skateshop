import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { couponInputSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (typeof body?.active === "boolean") {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { active: body.active },
    });
    return NextResponse.json({ coupon });
  }

  const parsed = couponInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
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
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el cupón." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.coupon.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
