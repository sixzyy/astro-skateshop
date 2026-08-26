import { Download, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; q?: string }>;

const FILTERS = ["ALL", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { status, q } = await searchParams;
  const filter = status && FILTERS.includes(status as (typeof FILTERS)[number]) ? status : "ALL";
  const query = (q ?? "").trim();

  let orders: {
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: Date;
    name: string;
    email: string;
    city: string;
    trackingNumber: string | null;
    carrier: string | null;
    _count: { items: number };
  }[] = [];

  try {
    const result = await prisma.order.findMany({
      where: {
        ...(filter === "ALL" ? {} : { status: filter as OrderStatus }),
        ...(query
          ? {
              OR: [
                { number: { contains: query.toUpperCase() } },
                { email: { contains: query } },
                { name: { contains: query } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    orders = result as unknown as typeof orders;
  } catch {}

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Órdenes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} órdenes</p>
        </div>
        <a
          href={`/api/admin/orders/export${filter !== "ALL" ? `?status=${filter}` : ""}`}
          download
          className="inline-flex items-center gap-2 rounded-md border border-border px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wide transition-colors hover:border-accent hover:text-accent"
        >
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </a>
      </header>

      <form method="GET" action="/admin/orders" className="relative max-w-md">
        {filter !== "ALL" && <input type="hidden" name="status" value={filter} />}
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por número, cliente o correo…"
          className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
      </form>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f}
            href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
            className={`rounded-md border px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
              filter === f
                ? "border-accent bg-accent text-zinc-950"
                : "border-border text-muted-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {f === "ALL" ? "Todas" : ORDER_STATUS_LABELS[f]}
          </a>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No hay órdenes con este filtro.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-display text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3.5 font-bold">Orden</th>
                <th className="px-5 py-3.5 font-bold">Cliente</th>
                <th className="px-5 py-3.5 font-bold">Artículos</th>
                <th className="px-5 py-3.5 font-bold">Total</th>
                <th className="px-5 py-3.5 font-bold">Estado</th>
                <th className="px-5 py-3.5 font-bold">Cambiar a</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3.5">
                    <p className="font-display font-bold tracking-wide">{order.number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold">{order.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.email} · {order.city}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">{order._count.items}</td>
                  <td className="px-5 py-3.5 font-display font-bold">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <OrderStatusSelect
                      orderId={order.id}
                      current={order.status}
                      initialTracking={order.trackingNumber}
                      initialCarrier={order.carrier}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
