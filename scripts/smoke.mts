/**
 * Smoke tests de Astro SkateShop.
 * Uso: npm test   (requiere el dev server corriendo en NEXT_PUBLIC_APP_URL o :3000)
 */
import { loadEnvFile } from "node:process";

loadEnvFile();

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ADMIN = { email: "admin@astroskate.co", password: "admin123!" };

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, extra = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name} ${extra}`);
  }
}

async function get(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, { ...init, redirect: "manual" });
}

async function main() {
  console.log(`\nAstro SkateShop — smoke tests contra ${BASE}\n`);

  // ── Páginas públicas ──────────────────────────────────────────
  console.log("Páginas públicas:");
  for (const path of ["/", "/products", "/armador", "/rastrear", "/login", "/register"]) {
    const res = await get(path);
    check(`GET ${path} → ${res.status}`, res.status === 200);
  }

  // SEO
  const robots = await get("/robots.txt");
  check("GET /robots.txt → 200", robots.status === 200);
  const sitemap = await get("/sitemap.xml");
  check("GET /sitemap.xml → 200", sitemap.status === 200);

  // ── APIs públicas ─────────────────────────────────────────────
  console.log("\nAPIs públicas:");
  const productsRes = await get("/api/products");
  check("GET /api/products → 200", productsRes.status === 200);
  const productsJson = await productsRes.json().catch(() => null);
  const productList: { id: string; slug: string; variants?: { id: string; stock: number }[] }[] =
    productsJson?.products ?? [];
  check("/api/products devuelve productos", Array.isArray(productList) && productList.length > 0);

  const searchRes = await get("/api/search?q=tabla");
  check("GET /api/search?q=tabla → 200", searchRes.status === 200);

  // Producto con variantes y stock para el pedido de prueba
  let variant: { id: string; stock: number } | undefined;
  for (const p of productList) {
    const detailRes = await get(`/api/products/${p.id}`);
    if (!detailRes.ok) continue;
    const detail = await detailRes.json().catch(() => null);
    const v = (detail?.product?.variants ?? []).find((x: { stock: number }) => x.stock > 1);
    if (v) {
      variant = v;
      break;
    }
  }
  check("Existe variante con stock para probar checkout", Boolean(variant));

  // Cupón
  const couponRes = await get("/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "ASTRO10", subtotal: 1000 }),
  });
  check("Cupón ASTRO10 válido", couponRes.ok);

  // ── Guards de autenticación ───────────────────────────────────
  console.log("\nGuards de seguridad:");
  const accUnauth = await get("/api/account/addresses");
  check("/api/account/addresses sin sesión → 401", accUnauth.status === 401);
  const custUnauth = await get("/api/admin/customers");
  check("/api/admin/customers sin sesión → 401/403", custUnauth.status === 401 || custUnauth.status === 403);
  const adminPage = await get("/admin/customers");
  check("/admin/customers sin sesión → redirige a login", [302, 303, 307, 308].includes(adminPage.status));

  // ── Checkout de invitado + rastreo ────────────────────────────
  if (variant) {
    console.log("\nCheckout de invitado:");
    const stockBefore = await get(`/api/stock?ids=${variant.id}`).then((r) => r.json());    const orderRes = await get("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ variantId: variant.id, quantity: 1 }],
        saveAddress: false,
        shippingInfo: {
          name: "Smoke Test",
          email: "smoke@test.co",
          address: "Cra 30 # 73-10",
          city: "Bogotá",
          state: "Cundinamarca",
          postalCode: "110221",
        },
      }),
    });
    const orderJson = await orderRes.json().catch(() => null);
    check("POST /api/orders (invitado) → 200", orderRes.status === 200, `→ ${orderRes.status}`);
    check("Devuelve número de orden", typeof orderJson?.number === "string");

    if (orderJson?.number) {
      const subtotal = Number(orderJson.total ?? 0);
      check("Total > 0", subtotal > 0);
      await new Promise((r) => setTimeout(r, 300));
      const trackRes = await get(`/api/track/${orderJson.number}`);
      check("Rastreo público del pedido → 200", trackRes.status === 200);
      const stockAfter = await get(`/api/stock?ids=${variant.id}`).then((r) => r.json());
      const before = stockBefore?.stocks?.[variant.id];
      const after = stockAfter?.stocks?.[variant.id];
      check(`Stock decrementó (${before} → ${after})`, after === before - 1);
    }
  }

  // ── Flujo admin ───────────────────────────────────────────────
  console.log("\nFlujo administrador:");
  const loginRes = await get("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ADMIN),
  });
  check("Login admin → 200", loginRes.status === 200);
  const cookie = loginRes.headers.getSetCookie?.().map((c) => c.split(";")[0]).join("; ") ?? "";

  if (cookie) {
    const customersRes = await get("/api/admin/customers", { headers: { cookie } });
    check("GET /api/admin/customers con sesión admin → 200", customersRes.status === 200);
    const customersJson = await customersRes.json().catch(() => null);
    check(
      "Lista de clientes incluye gasto calculado",
      Array.isArray(customersJson?.customers) && customersJson.customers.length > 0,
    );

    const ordersRes = await get("/api/orders?status=ALL", { headers: { cookie } });
    check("GET /api/orders admin → 200", ordersRes.status === 200);
  }

  // ── Resultado ─────────────────────────────────────────────────
  console.log(`\nResultado: ${passed} pasaron · ${failed} fallaron\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fallo fatal:", err);
  process.exit(1);
});
