import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = rateLimit(`register:${ip}`, 10, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${limiter.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash },
  });

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role as Role });

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
}
