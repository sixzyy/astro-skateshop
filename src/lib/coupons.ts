import { prisma } from "@/lib/prisma";
import type { Coupon } from "@/generated/prisma/client";

export interface CouponResult {
  code: string;
  discount: number;
}

export class CouponError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function resolveCoupon(rawCode: string, subtotal: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) throw new CouponError("Escribe un código de cupón.");

  const coupon: Coupon | null = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) throw new CouponError("Este cupón no existe o ya no está activo.");
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new CouponError("Este cupón aún no está disponible.");
  if (coupon.expiresAt && coupon.expiresAt < now) throw new CouponError("Este cupón ya expiró.");
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) {
    throw new CouponError("Este cupón alcanzó su límite de usos.");
  }
  if (subtotal < coupon.minSubtotal) {
    throw new CouponError(`Este cupón requiere una compra mínima de $${round2(coupon.minSubtotal)} COP.`);
  }

  const discount =
    coupon.type === "PERCENT"
      ? round2((subtotal * coupon.value) / 100)
      : Math.min(round2(coupon.value), subtotal);

  return { code: coupon.code, discount };
}

export async function consumeCoupon(code: string) {
  await prisma.coupon.update({
    where: { code },
    data: { uses: { increment: 1 } },
  });
}
