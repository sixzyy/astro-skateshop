import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { scheduledFilter } from "@/lib/schedule";
import { parseImages } from "@/lib/types";

export async function GET(req: NextRequest) {
  const limiter = rateLimit(`search:${clientIp(req)}`, 60, 60_000);
  if (!limiter.ok) return NextResponse.json({ error: "Demasiadas búsquedas." }, { status: 429 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: {
      AND: [
        scheduledFilter(),
        {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { brand: { name: { contains: q } } },
            { category: { name: { contains: q } } },
          ],
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      images: true,
      brand: { select: { name: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: parseImages(p.images)[0] ?? null,
      brandName: p.brand.name,
    })),
  });
}
