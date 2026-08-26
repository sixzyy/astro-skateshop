import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

type Params = { params: Promise<{ number: string }> };

const TIMELINE = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;

export async function GET(req: NextRequest, { params }: Params) {
  const limiter = rateLimit(`track:${clientIp(req)}`, 20, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Demasiadas consultas." }, { status: 429 });

  const { number } = await params;
  if (!/^AST-[A-Z0-9]{8,16}$/i.test(number)) {
    return NextResponse.json({ error: "Formato de número inválido. Ejemplo: AST-MT7NSJF4IPX5" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { number: number.toUpperCase() },
    select: {
      number: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      city: true,
      trackingNumber: true,
      carrier: true,
      items: {
        select: { productName: true, variantTitle: true, quantity: true, image: true },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "No encontramos ninguna orden con ese número." }, { status: 404 });
  if (order.status === "CANCELLED") {
    return NextResponse.json({ error: "Esta orden fue cancelada. Contáctanos si crees que es un error." }, { status: 410 });
  }

  return NextResponse.json({
    order: {
      ...order,
      statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
      steps: TIMELINE,
    },
  });
}
