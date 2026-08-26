import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createOrderWithItems, decrementStock, StockError } from "@/lib/orders";
import { resolveCoupon, CouponError } from "@/lib/coupons";
import { getStripe } from "@/lib/stripe";
import { isSupported } from "@/lib/currency";
import { sendOrderConfirmation } from "@/lib/email";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const scopeAll = req.nextUrl.searchParams.get("scope") === "all";

  if (scopeAll && session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: scopeAll ? {} : { userId: session.sub },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!limiter.ok) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un momento." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { items, couponCode } = parsed.data;
  const session = await getSession();

  // Dirección de envío: guardada (addressId) o capturada en el formulario.
  let finalShipping = parsed.data.shippingInfo;
  if (session && parsed.data.addressId) {
    const saved = await prisma.address.findFirst({
      where: { id: parsed.data.addressId, userId: session.sub },
    });
    if (!saved) return NextResponse.json({ error: "Dirección no válida" }, { status: 400 });
    finalShipping = {
      name: saved.name,
      email: session.email,
      address: saved.address,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
    };
  }
  if (!finalShipping) {
    return NextResponse.json({ error: "Falta la dirección de envío" }, { status: 400 });
  }

  // Guardar dirección nueva para usuarios registrados.
  if (session && parsed.data.saveAddress && !parsed.data.addressId) {
    const count = await prisma.address.count({ where: { userId: session.sub } });
    if (count < 10) {
      const makeDefault = count === 0;
      if (makeDefault) {
        await prisma.address.updateMany({ where: { userId: session.sub, isDefault: true }, data: { isDefault: false } });
      }
      await prisma.address.create({
        data: {
          userId: session.sub,
          label: "Checkout",
          name: finalShipping.name,
          address: finalShipping.address,
          city: finalShipping.city,
          state: finalShipping.state,
          postalCode: finalShipping.postalCode,
          isDefault: makeDefault,
        },
      });
    }
  }

  const currency =
    typeof body?.currency === "string" && isSupported(body.currency.toUpperCase())
      ? body.currency.toUpperCase()
      : "MXN";

  // Pre-validate the coupon so Stripe flow fails fast with a clear message.
  let discount = 0;
  if (couponCode?.trim()) {
    try {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: items.map((i) => i.variantId) } },
        include: { product: { select: { price: true } } },
      });
      const subtotal = variants.reduce((sum, variant) => {
        const item = items.find((i) => i.variantId === variant.id);
        return sum + variant.product.price * (item?.quantity ?? 0);
      }, 0);
      const result = await resolveCoupon(couponCode, subtotal);
      discount = result.discount;
    } catch (err) {
      if (err instanceof CouponError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ error: "No se pudo validar el cupón." }, { status: 500 });
    }
  }

  try {
    const stripe = getStripe();

    if (stripe) {
      const order = await createOrderWithItems({
        ...finalShipping,
        userId: session?.sub ?? null,
        currency,
        couponCode,
        items,
      });

      const variants = await prisma.productVariant.findMany({
        where: { id: { in: items.map((i) => i.variantId) } },
        include: { product: true },
      });

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId)!;
        return {
          quantity: item.quantity,
          price_data: {
            currency: "mxn",
            unit_amount: Math.round(variant.product.price * 100),
            product_data: {
              name: `${variant.product.name} — ${variant.title}`,
            },
          },
        };
      });

      if (order.shipping > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: Math.round(order.shipping * 100),
            product_data: { name: "Envío" },
          },
        });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        line_items: lineItems,
        customer_email: finalShipping.email,
        metadata: { orderId: order.id },
        success_url: `${appUrl}/checkout/success?number=${order.number}`,
        cancel_url: `${appUrl}/checkout?canceled=1`,
      };

      if (discount > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(discount * 100),
          currency: "mxn",
          duration: "once",
          name: `Cupón ${order.couponCode}`,
        });
        sessionParams.discounts = [{ coupon: coupon.id }];
      }

      const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

      return NextResponse.json({ url: checkoutSession.url });
    }

    const order = await prisma.$transaction(async (tx) => {
      await decrementStock(items, tx);
      const o = await createOrderWithItems({
        ...finalShipping,
        userId: session?.sub ?? null,
        currency,
        couponCode,
        items,
      }, tx);
      return o;
    });

    await sendOrderConfirmation({
      to: order.email,
      number: order.number,
      total: order.total,
      items: order.items.map((i: (typeof order.items)[number]) => ({
        productName: i.productName,
        variantTitle: i.variantTitle,
        quantity: i.quantity,
      })),
    });

    return NextResponse.json({ number: order.number, total: order.total });
  } catch (err) {
    if (err instanceof StockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("checkout error", err);
    return NextResponse.json({ error: "No se pudo procesar la orden" }, { status: 500 });
  }
}
