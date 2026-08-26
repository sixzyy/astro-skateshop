import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/armador",
    "/rastrear",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.5,
  }));

  let products: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.product.findMany({
      where: {
        published: true,
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
      },
      select: { slug: true, updatedAt: true },
      take: 500,
    });
    products = rows.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {}

  return [...staticRoutes, ...products];
}
