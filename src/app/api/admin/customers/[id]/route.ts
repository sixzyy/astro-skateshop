import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: { select: { productName: true, variantTitle: true, quantity: true } } },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const spent = user.orders.reduce((s, o) => s + o.total, 0);
  return NextResponse.json({ customer: { ...user, spent } });
}

const patchSchema = z.object({
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(body ?? {}).length === 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (id === guard.session!.sub && parsed.data.active === false) {
    return NextResponse.json({ error: "No puedes desactivar tu propia cuenta." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { active: parsed.data.active },
      select: { id: true, active: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }
}

const resetSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Za-z]/, "Debe incluir letras")
    .regex(/\d/, "Debe incluir un número"),
});

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  try {
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  } catch {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
