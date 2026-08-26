import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const customers = users.map((u) => ({
    ...u,
    spent: u.orders.reduce((sum, o) => sum + o.total, 0),
    orderCount: u._count.orders,
    orders: undefined as never,
  }));

  return NextResponse.json({ customers });
}
