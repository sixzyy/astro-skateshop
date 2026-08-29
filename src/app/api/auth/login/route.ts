import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limiter.ok) {
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${limiter.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);

  if (!(await verifyTurnstile((body as Record<string, unknown> | null)?.turnstileToken))) {
    return NextResponse.json(
      { error: "Verificación de seguridad fallida. Intenta de nuevo." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }
  if (!user.active) {
    return NextResponse.json({ error: "Esta cuenta está desactivada. Contáctanos si crees que es un error." }, { status: 403 });
  }

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role as Role });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
