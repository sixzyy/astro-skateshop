import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "CLIENT" | "ADMIN";
}

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET es obligatoria en producción (mínimo 32 caracteres).");
    }
    return new TextEncoder().encode("astro-dev-secret-do-not-use-in-prod");
  }
  return new TextEncoder().encode(secret);
};

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || !payload.role) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role === "ADMIN" ? "ADMIN" : "CLIENT",
    };
  } catch {
    return null;
  }
}
