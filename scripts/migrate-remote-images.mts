import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
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

function extFromType(type: string): string | null {
  if (type.includes("jpeg")) return ".jpg";
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  if (type.includes("avif")) return ".avif";
  if (type.includes("gif")) return ".gif";
  return null;
}

async function main() {
  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
  const cache = new Map<string, string>();
  let migrated = 0;

  for (const p of products) {
    let urls: string[] = [];
    try {
      const raw = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
      urls = Array.isArray(raw) ? raw.filter((u): u is string => typeof u === "string") : [];
    } catch {
      continue;
    }

    const nextUrls: string[] = [];
    let changed = false;

    for (const url of urls) {
      if (url.startsWith("/")) {
        nextUrls.push(url);
        continue;
      }
      if (cache.has(url)) {
        nextUrls.push(cache.get(url)!);
        changed = true;
        continue;
      }
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        const type = res.headers.get("content-type") ?? "";
        const ext = extFromType(type.split(";")[0]);
        const buf = Buffer.from(await res.arrayBuffer());
        if (!res.ok || !ext || buf.length === 0) throw new Error(`HTTP ${res.status} ${type}`);
        if (buf.length > 4 * 1024 * 1024) throw new Error("Archivo > 4 MB");
        const filename = `${randomUUID()}${ext}`;
        await writeFile(path.join(process.cwd(), "public", "uploads", filename), buf);
        const local = `/uploads/${filename}`;
        cache.set(url, local);
        nextUrls.push(local);
        changed = true;
        console.log(`OK ${p.name}: ${url.slice(0, 60)}... -> ${local}`);
      } catch (e) {
        console.log(`FALLO ${p.name}: ${url.slice(0, 70)} -> ${e instanceof Error ? e.message : e}`);
        nextUrls.push(url);
      }
    }

    if (changed) {
      await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify(nextUrls) } });
      migrated++;
    }
  }

  console.log(`Listo. ${migrated} producto(s) actualizados.`);
  await prisma.$disconnect();
}

main();
