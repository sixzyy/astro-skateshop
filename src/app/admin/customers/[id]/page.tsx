import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/badge";
import { CustomerActions } from "@/components/admin/customer-actions";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login?next=/admin/customers");

  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { _count: { select: { items: true } } },
      },
    },
  });

  if (!customer) notFound();

  const spent = customer.orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/admin/customers" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Todos los clientes
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">{customer.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{customer.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Registrado el {formatDate(customer.createdAt)} ·{" "}
            <span className="font-bold text-foreground">{formatPrice(spent)}</span> en {customer.orders.length} pedidos
          </p>
        </div>
        {customer.role !== "ADMIN" && (
          <CustomerActions
            customerId={customer.id}
            active={customer.active}
            isSelf={customer.id === session.sub}
          />
        )}
      </header>

      {customer.addresses.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Direcciones</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {customer.addresses.map((a) => (
              <li key={a.id} className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
                <p className="text-sm font-semibold text-foreground">
                  {a.label} {a.isDefault && <span className="ml-1 text-[10px] font-bold uppercase text-accent">· predeterminada</span>}
                </p>
                {a.name} · {a.address}, {a.city}, {a.state}, C.P. {a.postalCode}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Historial de pedidos</h2>
        {customer.orders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Sin pedidos todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {customer.orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
                <div>
                  <p className="font-display text-sm font-bold tracking-wide">{o.number}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt)} · {o._count.items} artículos
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-sm font-bold">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
