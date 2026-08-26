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
  where: { stock: { gte: 2 } },
  take: 3,
  select: {
    id: true,
    title: true,
    stock: true,
    product: { select: { name: true, price: true } },
  },
});
console.log(JSON.stringify(variants));
await prisma.$disconnect();
