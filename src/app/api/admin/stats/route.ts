import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [orders, productCount, pendingReviews, activeAlerts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true, items: { select: { quantity: true, unitPrice: true, productName: true, productId: true } } },
    }),
    prisma.product.count(),
    prisma.review.count({ where: { approved: false } }),
    prisma.stockAlert.count({ where: { notifiedAt: null } }),
  ]);

  // Daily revenue series (30 days, zero-filled)
  const series = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    series.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (series.has(key)) series.set(key, (series.get(key) ?? 0) + order.total);
  }

  // Top products by units sold
  const byProduct = new Map<string, { name: string; units: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productId ?? item.productName;
      const entry = byProduct.get(key) ?? { name: item.productName, units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.unitPrice * item.quantity;
      byProduct.set(key, entry);
    }
  }
  const topProducts = [...byProduct.values()].sort((a, b) => b.units - a.units).slice(0, 5);

  const revenue = orders.reduce((a, o) => a + o.total, 0);

  return NextResponse.json({
    totals: {
      revenue,
      orderCount: orders.length,
      productCount,
      pendingReviews,
      activeAlerts,
    },
    dailySeries: [...series.entries()].map(([date, total]) => ({ date, total })),
    topProducts,
  });
}
