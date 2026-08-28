import Link from "next/link";
import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/badge";
import { SalesChart } from "@/components/admin/sales-chart";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboardPage() {
  let revenue = 0;
  let ordersCount = 0;
  let pendingCount = 0;
  let productsCount = 0;
  let pendingReviews = 0;
  let activeAlerts = 0;
  let lowStock: { id: string; title: string; stock: number; product: { name: string; slug: string } }[] = [];
  let topProducts: { id: string; name: string; sold: number }[] = [];
  let recentOrders: {
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: Date;
    user: { name: string } | null;
  }[] = [];

  try {
    const [rev, oc, pc, prodCount, low, topGroups, recent, pr, sa] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: [...PAID_STATUSES] } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.productVariant.findMany({
        where: { stock: { lte: 3 } },
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        where: { productId: { not: null } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.review.count({ where: { approved: false } }),
      prisma.stockAlert.count({ where: { notifiedAt: null } }),
    ]);

    revenue = rev._sum.total ?? 0;
    ordersCount = oc;
    pendingCount = pc;
    productsCount = prodCount;
    lowStock = low;
    recentOrders = recent;
    pendingReviews = pr;
    activeAlerts = sa;

    const ids = topGroups.map((g) => g.productId!).filter(Boolean);
    if (ids.length > 0) {
      const prods = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
      topProducts = topGroups
        .map((g) => ({
          id: g.productId!,
          name: prods.find((p) => p.id === g.productId)?.name ?? "Producto",
          sold: g._sum.quantity ?? 0,
        }))
        .sort((a, b) => b.sold - a.sold);
    }
  } catch (err) {
    console.error("Dashboard query error:", err);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumen general de la tienda</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Ventas totales" value={formatPrice(revenue)} accent />
        <StatCard icon={ShoppingCart} label="Órdenes" value={String(ordersCount)} hint={`${pendingCount} pendientes`} />
        <StatCard icon={Package} label="Productos" value={String(productsCount)} />
        <StatCard
          icon={AlertTriangle}
          label="Stock bajo (≤3)"
          value={String(lowStock.length)}
          hint={lowStock.length > 0 ? "Revisar inventario" : undefined}
        />
      </section>

      {(pendingReviews > 0 || activeAlerts > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingReviews > 0 && (
            <Link
              href="/admin/reviews"
              className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-500 transition-colors hover:bg-yellow-500/20"
            >
              {pendingReviews} reseña{pendingReviews === 1 ? "" : "s"} por moderar →
            </Link>
          )}
          {activeAlerts > 0 && (
            <Link
              href="/admin/alerts"
              className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
            >
              {activeAlerts} alerta{activeAlerts === 1 ? "" : "s"} de stock pendiente{activeAlerts === 1 ? "" : "s"} →
            </Link>
          )}
        </div>
      )}

      <SalesChart />

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest">Más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
          ) : (
            <ol className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted font-display text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="line-clamp-1 flex-1 text-sm">{p.name}</span>
                  <span className="flex items-center gap-1 font-display text-sm font-bold text-accent">
                    <TrendingUp className="h-3.5 w-3.5" /> {p.sold}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest">Stock bajo</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todo el inventario está saludable.</p>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/products/${v.product.slug}`} className="line-clamp-1 flex-1 text-sm hover:text-accent">
                    {v.product.name} — {v.title}
                  </Link>
                  <span
                    className={`rounded-sm px-2 py-0.5 font-display text-xs font-bold ${
                      v.stock === 0 ? "bg-red-500/15 text-red-500" : "bg-yellow-500/15 text-yellow-500"
                    }`}
                  >
                    {v.stock === 0 ? "AGOTADO" : `${v.stock} u.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Órdenes recientes</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-accent hover:underline">
            Ver todas
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">No hay órdenes todavía.</p>
        ) : (
          <ul className="divide-y divide-border px-5">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3.5">
                <div>
                  <p className="font-display text-sm font-bold tracking-wide">{o.number}</p>
                    <p className="text-xs text-muted-foreground">
                    {o.user?.name ?? o.number} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-bold">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-5 ${accent ? "border-accent/40 bg-accent/10" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${accent ? "text-accent" : "text-muted-foreground"}`} strokeWidth={1.8} />
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
