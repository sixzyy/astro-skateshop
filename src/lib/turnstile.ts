const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SECRET = process.env.TURNSTILE_SECRET_KEY;

/** Turnstile solo se activa si existen ambas claves (site key + secreto). */
export function turnstileEnabled(): boolean {
  return Boolean(SITE_KEY && SECRET);
}

export function turnstileSiteKey(): string | null {
  return SITE_KEY ?? null;
}

/**
 * Verifica el token de Cloudflare Turnstile en el servidor.
 * Si Turnstile no está configurado, no bloquea (la tienda sigue funcionando
 * sin las claves).
 */
export async function verifyTurnstile(token: unknown): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (typeof token !== "string" || token.length === 0) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET, response: token }),
    });
    if (!res.ok) {
      console.warn(`[turnstile] siteverify respondió ${res.status}`);
      return false;
    }
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.warn(
      "[turnstile] siteverify no disponible, se rechaza el intento:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}