import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes · Admin" };

export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login?next=/admin/customers");

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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">{users.length} cuentas registradas</p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-display text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="px-5 py-3.5 font-bold">Cliente</th>
              <th className="px-5 py-3.5 font-bold">Registro</th>
              <th className="px-5 py-3.5 font-bold">Pedidos</th>
              <th className="px-5 py-3.5 font-bold">Gasto total</th>
              <th className="px-5 py-3.5 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-muted/50">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/customers/${u.id}`} className="font-semibold hover:text-accent">
                    {u.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3.5">{u._count.orders}</td>
                <td className="px-5 py-3.5 font-display font-bold">{formatPrice(u.orders.reduce((s, o) => s + o.total, 0))}</td>
                <td className="px-5 py-3.5">
                  {u.role === "ADMIN" ? (
                    <span className="rounded-sm bg-accent/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">Admin</span>
                  ) : u.active ? (
                    <span className="rounded-sm bg-emerald-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Activo</span>
                  ) : (
                    <span className="rounded-sm bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">Inactivo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
