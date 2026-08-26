import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json({ user });
}
