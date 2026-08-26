import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const ip = clientIp(req);
  const limiter = rateLimit(`pwd-change:${session.sub}:${ip}`, 5, 300_000);
  if (!limiter.ok) {
    return NextResponse.json({ error: "Demasiados intentos. Espera 5 minutos." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { passwordHash: true } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: session.sub }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}
