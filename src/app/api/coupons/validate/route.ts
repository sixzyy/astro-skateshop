import { NextResponse, type NextRequest } from "next/server";
import { resolveCoupon, CouponError } from "@/lib/coupons";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limiter = rateLimit(`coupon:${clientIp(req)}`, 10, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const subtotal = typeof body?.subtotal === "number" && body.subtotal > 0 ? body.subtotal : 0;

  try {
    const result = await resolveCoupon(code, subtotal);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "No se pudo validar el cupón." }, { status: 500 });
  }
}
