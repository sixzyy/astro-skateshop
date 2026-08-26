import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validators";
import { sendOrderStatusUpdate } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  if (order.userId !== session.sub && session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

const CARRIERS = ["estafeta", "dhl", "fedex", "otros"];

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    status?: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    notify?: boolean;
  } | null;

  const data: {
    status?: string;
    trackingNumber?: string | null;
    carrier?: string | null;
  } = {};

  if (body?.status !== undefined) {
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    data.status = parsed.data.status;
  }

  if (body?.trackingNumber !== undefined) {
    const tn = body.trackingNumber === null ? null : String(body.trackingNumber).trim();
    if (tn && (tn.length < 5 || tn.length > 40)) {
      return NextResponse.json({ error: "La guía debe tener entre 5 y 40 caracteres." }, { status: 400 });
    }
    data.trackingNumber = tn || null;
  }

  if (body?.carrier !== undefined) {
    const c = body.carrier === null ? null : String(body.carrier).trim().toLowerCase();
    if (c && !CARRIERS.includes(c)) {
      return NextResponse.json({ error: "Transportista inválido." }, { status: 400 });
    }
    data.carrier = c || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { items: true },
  }).catch(() => null);

  if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

  // Envía correo solo si cambió el estado o se registró/actualizó una guía.
  const shouldNotify =
    body?.notify !== false &&
    (data.status !== undefined ||
      (data.trackingNumber !== undefined && data.trackingNumber !== null));

  if (shouldNotify) {
    await sendOrderStatusUpdate({
      to: order.email,
      number: order.number,
      status: order.status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
    });
  }

  return NextResponse.json({ order });
}
