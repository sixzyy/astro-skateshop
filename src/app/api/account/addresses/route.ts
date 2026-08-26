import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const count = await prisma.address.count({ where: { userId: session.sub } });
  if (count >= 10) {
    return NextResponse.json({ error: "Límite de 10 direcciones alcanzado." }, { status: 400 });
  }

  const makeDefault = parsed.data.isDefault === true || count === 0;
  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId: session.sub, isDefault: true }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.sub,
      label: parsed.data.label,
      name: parsed.data.name,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      phone: parsed.data.phone ?? null,
      isDefault: makeDefault,
    },
  });
  return NextResponse.json({ address }, { status: 201 });
}
