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

const variants = await prisma.productVariant.findMany({
  include: { product: { select: { name: true, slug: true } } },
  orderBy: [{ productId: "asc" }, { title: "asc" }],
});

for (const v of variants) {
  console.log(`${v.stock === 0 ? "XX" : String(v.stock).padStart(2)} | ${v.title.padEnd(8)} | ${v.product.name}`);
}

await prisma.$disconnect();
