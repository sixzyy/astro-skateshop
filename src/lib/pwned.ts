import { createHash } from "node:crypto";

export const PWNED_ENDPOINT = "https://api.pwnedpasswords.com/range/";

/**
 * Chequea si una contraseña aparece en filtraciones de datos conocidas,
 * usando la API de Pwned Passwords (troyhunt.com) con verificación por
 * rango (k-anonimato): solo se envía el prefijo SHA-1 del hash a HIBP,
 * nunca la contraseña ni el hash completo.
 *
 * Fail-open: si la API está caída o tarda demasiado, se permite el registro
 * para no bloquear la tienda.
 */
export async function isPasswordPwned(password: string): Promise<boolean> {
  try {
    const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const res = await fetch(`${PWNED_ENDPOINT}${prefix}`, {
      cache: "no-store",
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) {
      console.warn(`[pwned] respuesta inesperada: ${res.status}`);
      return false;
    }

    const found = (await res.text()).split(/\r?\n/).some((line) => {
      const suffixPart = line.split(":")[0]?.trim().toUpperCase();
      return suffixPart === suffix;
    });
    return found;
  } catch (err) {
    console.warn(
      "[pwned] API no disponible, se omite el chequeo:",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}