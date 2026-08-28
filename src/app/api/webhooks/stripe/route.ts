import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Firma ausente" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;

    if (!orderId) return NextResponse.json({ received: true });

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.status !== "PENDING") return;

      for (const item of order.items) {
        if (!item.variantId || item.productName === "Envío") continue;
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(`Stock insuficiente al confirmar orden ${order.number}`);
        }
      }

      await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

      // Confirmación por correo (best-effort, no debe romper el webhook).
      await sendOrderConfirmation({
        to: order.email,
        number: order.number,
        total: order.total,
        items: order.items.map((i) => ({
          productName: i.productName,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
        })),
      }).catch(() => null);
    });
  }

  // Sesiones abandonadas: no dejar órdenes PENDING huérfanas.
  if (event.type === "checkout.session.expired") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
