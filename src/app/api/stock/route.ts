import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ids =
    req.nextUrl.searchParams
      .get("ids")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50) ?? [];

  if (!ids.length) return NextResponse.json({ stocks: {} });

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    select: { id: true, stock: true },
  });

  const stocks = Object.fromEntries(variants.map((v) => [v.id, v.stock]));
  return NextResponse.json({ stocks });
}
