import { cookies } from "next/headers";
import { signToken, verifyToken, type SessionPayload } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/auth-cookie";

const MAX_AGE = 60 * 60 * 24 * 7;

export async function createSession(payload: SessionPayload) {
  const token = await signToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
