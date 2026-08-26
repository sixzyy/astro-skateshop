"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BellRing,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Rocket,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/drops", label: "Drops", icon: Rocket },
  { href: "/admin/inventory", label: "Inventario", icon: Warehouse },
  { href: "/admin/orders", label: "Ordenes", icon: ShoppingCart },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/coupons", label: "Cupones", icon: Tag },
  { href: "/admin/reviews", label: "Resenas", icon: MessageSquareQuote },
  { href: "/admin/alerts", label: "Alertas stock", icon: BellRing },
  { href: "/admin/settings", label: "Ajustes", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside>
      <div className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground-disabled">
        Administracion
      </div>
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-all duration-300",
                active ? "bg-foreground text-background" : "text-foreground-secondary bg-background-secondary hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-6 hidden items-center gap-2 rounded-lg px-3 text-sm text-foreground-secondary transition-all duration-300 hover:text-foreground lg:flex"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la tienda
      </Link>
    </aside>
  );
}
