import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

async function owned(id: string, userId: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const existing = await owned(id, session.sub);
  if (!existing) return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });

  const body = await req.json().catch(() => null);

  // Acción rápida: marcar como predeterminada
  if (body && typeof body.isDefault === "boolean" && Object.keys(body).length === 1) {
    if (body.isDefault) {
      await prisma.$transaction([
        prisma.address.updateMany({ where: { userId: session.sub, isDefault: true }, data: { isDefault: false } }),
        prisma.address.update({ where: { id }, data: { isDefault: true } }),
      ]);
    } else {
      await prisma.address.update({ where: { id }, data: { isDefault: false } });
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.sub, isDefault: true }, data: { isDefault: false } });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      label: parsed.data.label,
      name: parsed.data.name,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      phone: parsed.data.phone ?? null,
      isDefault: parsed.data.isDefault === true,
    },
  });
  return NextResponse.json({ address });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const deleted = await prisma.address.deleteMany({ where: { id, userId: session.sub } });
  if (deleted.count === 0) return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
