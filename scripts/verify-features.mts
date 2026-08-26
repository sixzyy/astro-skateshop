/* eslint-disable @typescript-eslint/no-explicit-any */
/** Verificación end-to-end de las features nuevas (cuenta, direcciones, clientes, guía). */
import { loadEnvFile } from "node:process";
loadEnvFile();

const BASE = "http://localhost:3000";
let ok = 0;
let bad = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (cond) { ok++; console.log(`  ✓ ${name}`); }
  else { bad++; console.error(`  ✗ ${name} ${extra}`); }
};

async function api(path: string, init?: RequestInit & { rawCookie?: string }) {
  const headers = new Headers(init?.headers);
  if (init?.rawCookie) headers.set("cookie", init.rawCookie);
  const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
  let json: any = null;
  try { json = await res.json(); } catch {}
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return { res, json, setCookie };
}

const cookieOf = (setCookies: string[]) =>
  setCookies.map((c) => c.split(";")[0]).join("; ");

async function main() {
  console.log("\n— Cuenta de cliente —");
  const login = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "cliente@demo.mx", password: "nueva12345" }),
  });
  if (login.res.status !== 200) {
    // La contraseña pudo no haber sido reseteada; usa la original.
    const l2 = await api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "cliente@demo.mx", password: "cliente123!" }),
    });
    login.setCookie = l2.setCookie;
    check("login cliente", l2.res.status === 200);
  } else {
    check("login cliente (password reseteada)", true);
  }
  const userCookie = cookieOf(login.setCookie);

  const addr = await api("/api/account/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({
      label: "Oficina",
      name: "Demo Cliente",
      address: "Av. Cosmos 42",
      city: "Guadalajara",
      state: "JAL",
      postalCode: "44100",
    }),
  });
  check("crear dirección", addr.res.status === 201 && Boolean(addr.json?.address?.id), `→ ${addr.res.status}`);
  const addrId = addr.json?.address?.id as string;

  const listA = await api("/api/account/addresses", { headers: { cookie: userCookie } });
  check("listar direcciones", listA.json?.addresses?.length >= 1);

  const prof = await api("/api/account/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ name: "Cliente Demo Actualizado" }),
  });
  check("actualizar perfil", prof.res.status === 200 && prof.json?.user?.name === "Cliente Demo Actualizado");

  console.log("\n— Checkout express con dirección guardada —");
  const prods = await api("/api/products");
  const tabla = (prods.json?.products ?? []).find(
    (p: any) => p.category?.name === "Tablas",
  );
  const detail = await api(`/api/products/${tabla.id}`);
  const variant = (detail.json?.product?.variants ?? []).find((v: any) => v.stock > 1);

  const order = await api("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: userCookie },
    body: JSON.stringify({ items: [{ variantId: variant.id, quantity: 1 }], addressId: addrId }),
  });
  check("checkout solo con addressId → 200", order.res.status === 200, `→ ${order.res.status} ${JSON.stringify(order.json)}`);

  console.log("\n— Admin clientes —");
  const aLogin = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@astroskate.mx", password: "admin123!" }),
  });
  check("login admin", aLogin.res.status === 200);
  const adminCookie = cookieOf(aLogin.setCookie);

  const customers = await api("/api/admin/customers", { headers: { cookie: adminCookie } });
  check("GET /api/admin/customers", customers.res.status === 200 && customers.json?.customers?.length > 0);
  const demo = (customers.json?.customers ?? []).find((c: any) => c.email === "cliente@demo.mx");

  const det = await api(`/api/admin/customers/${demo.id}`, { headers: { cookie: adminCookie } });
  check(
    "detalle cliente con historial y direcciones",
    det.res.status === 200 && Array.isArray(det.json?.customer?.orders) && Array.isArray(det.json?.customer?.addresses),
  );

  const reset = await api(`/api/admin/customers/${demo.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ newPassword: "reset9abc" }),
  });
  check("resetear contraseña del cliente", reset.res.status === 200);

  const deact = await api(`/api/admin/customers/${demo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ active: false }),
  });
  check("desactivar cuenta", deact.res.status === 200 && deact.json?.user?.active === false);

  const blockedLogin = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "cliente@demo.mx", password: "reset9abc" }),
  });
  check("login bloqueado para cuenta desactivada → 403", blockedLogin.res.status === 403);

  const react = await api(`/api/admin/customers/${demo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ active: true }),
  });
  check("reactivar cuenta", react.res.status === 200 && react.json?.user?.active === true);

  const reLogin = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "cliente@demo.mx", password: "reset9abc" }),
  });
  check("login con contraseña reseteada → 200", reLogin.res.status === 200);

  console.log(`\nVerificación features: ${ok} pasaron · ${bad} fallaron\n`);
  process.exit(bad ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
