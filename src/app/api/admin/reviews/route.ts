import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const status = req.nextUrl.searchParams.get("status") ?? "PENDING";
  const where =
    status === "ALL" ? {} : status === "APPROVED" ? { approved: true } : { approved: false };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json({ reviews });
}
