import { prisma } from "@/lib/prisma";
import { generateOrderNumber, shippingFor } from "@/lib/utils";
import { getRateFor } from "@/lib/currency";
import { resolveCoupon, consumeCoupon } from "@/lib/coupons";
import { getSettings } from "@/lib/settings";
import { parseImages } from "@/lib/types";

export class StockError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxClient = { productVariant: any; order: any };

export async function decrementStock(items: { variantId: string; quantity: number }[], tx?: TxClient) {
  const db = tx ?? prisma;
  for (const item of items) {
    const result = await db.productVariant.updateMany({
      where: { id: item.variantId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (result.count === 0) {
      const variant = await db.productVariant.findUnique({
        where: { id: item.variantId },
        select: { title: true, stock: true, product: { select: { name: true } } },
      });
      throw new StockError(
        variant
          ? `Solo quedan ${variant.stock} pieza${variant.stock === 1 ? "" : "s"} de "${variant.product.name} — ${variant.title}". Ajusta la cantidad e intenta de nuevo.`
          : `Stock insuficiente para ${item.variantId}`
      );
    }
  }
}

export async function createOrderWithItems(input: {
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  userId?: string | null;
  currency?: string;
  couponCode?: string | null;
  items: { variantId: string; quantity: number }[];
}, tx?: TxClient) {
  const db = tx ?? prisma;
  const variants = await db.productVariant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) } },
    include: { product: true },
  });

  if (variants.length !== input.items.length) {
    throw new Error("Uno o más productos no existen");
  }

  const settings = await getSettings();
  const threshold = Number(settings.freeShippingThreshold) || 999;
  const flat = Number(settings.shippingFlat) || 149;

  const currency = input.currency ?? "COP";
  const exchangeRate = currency === "COP" ? 1 : await getRateFor(currency);

  let subtotal = 0;
  const lineData = input.items.map((item) => {
    const variant = variants.find((v: (typeof variants)[number]) => v.id === item.variantId)!;
    subtotal += variant.product.price * item.quantity;
    return {
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      variantTitle: variant.title,
      image: parseImages(variant.product.images)[0] ?? null,
      unitPrice: variant.product.price,
      quantity: item.quantity,
    };
  });

  // Coupon is validated server-side against the real subtotal.
  let discount = 0;
  if (input.couponCode?.trim()) {
    const result = await resolveCoupon(input.couponCode, subtotal);
    discount = result.discount;
  }

  // Free shipping is decided on the discounted amount.
  const shipping = shippingFor(subtotal - discount, threshold, flat);

  const order = await db.order.create({
    data: {
      number: generateOrderNumber(),
      ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
      email: input.email,
      name: input.name,
      address: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      currency,
      exchangeRate,
      couponCode: discount > 0 ? input.couponCode?.trim().toUpperCase() ?? null : null,
      discount,
      subtotal,
      shipping,
      total: Math.max(subtotal - discount + shipping, 0),
      items: { create: lineData },
    },
    include: { items: true },
  });

  if (discount > 0 && order.couponCode) {
    await consumeCoupon(order.couponCode).catch(() => null);
  }

  return order;
}
