import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/account/logout-button";
import { ProfileForm } from "@/components/account/profile-form";
import { AddressesManager, type Address } from "@/components/account/addresses-manager";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ReorderButton } from "@/components/account/reorder-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi cuenta" };

async function AddressesSection({ userId }: { userId: string }) {
  let addresses: Address[] = [];
  try {
    const rows = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    addresses = rows.map((a) => ({
      id: a.id,
      label: a.label,
      name: a.name,
      address: a.address,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      phone: a.phone,
      isDefault: a.isDefault,
    }));
  } catch {}
  return <AddressesManager initial={addresses} />;
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  let orders: {
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: Date;
    items: {
      id: string;
      productName: string;
      variantTitle: string;
      quantity: number;
      image: string | null;
      variantId: string | null;
      productId: string | null;
    }[];
  }[] = [];

  try {
    orders = await prisma.order.findMany({
      where: { userId: session.sub },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch {}

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Mi cuenta</p>
          <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">{session.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{session.email}</p>
        </div>
        <div className="flex gap-2">
          {session.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex h-10 items-center rounded-md border border-accent px-5 font-display text-xs font-bold uppercase tracking-wide text-accent hover:bg-accent hover:text-zinc-950"
            >
              Panel admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfileForm initialName={session.name} />
        <AddressesSection userId={session.sub} />
      </div>

      <h2 className="mb-5 font-display text-lg font-bold uppercase tracking-wide">Mis pedidos</h2>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">Aún no tienes pedidos.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-accent px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-zinc-950 hover:bg-accent-strong"
          >
            Explorar la tienda
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <div>
                  <p className="font-display text-sm font-bold tracking-wide">{order.number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="font-display text-sm font-bold"
                    title={ORDER_STATUS_LABELS[order.status]}
                  >
                    {formatPrice(order.total)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <ul className="divide-y divide-border px-5">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    {item.image && (
                      <ProductImage
                        src={item.image}
                        alt={item.productName}
                        className="h-11 w-11 rounded-md border border-border object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantTitle} × {item.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end border-t border-border px-5 py-3">
                <ReorderButton
                  items={order.items.map((it) => ({
                    variantId: it.variantId,
                    productId: it.productId,
                    quantity: it.quantity,
                  }))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
