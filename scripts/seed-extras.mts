import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaMssql } from "@prisma/adapter-mssql";

process.loadEnvFile(".env");

const prisma = new PrismaClient({
  adapter: new PrismaMssql({
    server: process.env.MSSQL_HOST ?? "localhost",
    port: Number(process.env.MSSQL_PORT ?? 1433),
    database: process.env.MSSQL_DB ?? "astro_skateshop",
    user: process.env.MSSQL_USER ?? "",
    password: process.env.MSSQL_PASSWORD ?? "",
    options: { encrypt: true, trustServerCertificate: true },
  }),
});

async function main() {
  // --- Cupones demo ---
  await prisma.coupon.upsert({
    where: { code: "ASTRO10" },
    create: { code: "ASTRO10", type: "PERCENT", value: 10, minSubtotal: 0, active: true },
    update: {},
  });
  await prisma.coupon.upsert({
    where: { code: "GRAVEDAD150" },
    create: { code: "GRAVEDAD150", type: "FIXED", value: 150, minSubtotal: 800, active: true },
    update: {},
  });

  // --- Ajustes de la tienda ---
  const settings: Record<string, string> = {
    freeShippingThreshold: "999",
    shippingFlat: "149",
    announcement: "Envío gratis en compras mayores a $999 · Cupón ASTRO10 = -10%",
    whatsappNumber: "5215512345678",
    instagramUrl: "https://instagram.com/astroskateshop",
    tiktokUrl: "https://tiktok.com/@astroskateshop",
    youtubeUrl: "https://youtube.com/@astroskateshop",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  // --- Reseñas aprobadas en productos existentes ---
  const firstProducts = await prisma.product.findMany({ take: 3, orderBy: { createdAt: "asc" } });
  if (firstProducts[0]) {
    const yaTiene = await prisma.review.findFirst({ where: { productId: firstProducts[0].id, name: "Diego R." } });
    if (!yaTiene) {
      await prisma.review.createMany({
        data: [
          {
            productId: firstProducts[0].id,
            name: "Diego R.",
            rating: 5,
            comment:
              "Llegó antes de lo esperado y la calidad es brutal. El grip trae un patrón de estrellas que se ve increíble bajo el sol.",
            approved: true,
          },
          {
            userId: null,
            productId: firstProducts[0].id,
            name: "Melissa T.",
            rating: 4,
            comment: "Muy buena tabla para street, el concave es perfecto para mi stance. Le quito una estrella porque quería más tallas de grip.",
            approved: true,
          },
        ],
      });
    }
  }
  if (firstProducts[1]) {
    const yaTiene2 = await prisma.review.findFirst({ where: { productId: firstProducts[1].id, name: "Alex G." } });
    if (!yaTiene2) {
      await prisma.review.createMany({
        data: [
          {
            productId: firstProducts[1].id,
            name: "Alex G.",
            rating: 5,
            comment: "Las ruedas agarran bien el bowl y son silenciosas. Recomendadísimas.",
            approved: true,
          },
        ],
      });
    }
  }

  // --- Drop programado: tercera producto se lanza en 2 días ---
  if (firstProducts[2]) {
    await prisma.product.update({
      where: { id: firstProducts[2].id },
      data: { publishedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    });
  }

  console.log("Seed extras OK");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
