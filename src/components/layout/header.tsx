"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { cartCount, useCartStore } from "@/store/cart";
import { CurrencySelector } from "@/components/layout/currency-selector";
import { LiveSearch } from "@/components/layout/live-search";
import { Logo } from "@/components/layout/logo";
import type { SessionUser } from "@/lib/types";

const NAV_LINKS = [
  { href: "/armador", label: "Armador 3D" },
  { href: "/products", label: "Tienda" },
  { href: "/products?category=tablas", label: "Tablas" },
  { href: "/products?category=ruedas", label: "Ruedas" },
  { href: "/products?category=tenis", label: "Tenis" },
  { href: "/products?category=ropa", label: "Ropa" },
];

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.open);
  const count = cartCount(items);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setUser(data?.user ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6">
      <div className="btn-glow-cyan mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 rounded-xl border border-accent/25 bg-background/75 pl-4 pr-2 backdrop-blur-xl">
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted md:hidden cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" aria-label="Astro Skateshop — inicio">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="font-mono text-xs uppercase tracking-[0.2em] text-cta"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block">
            <CurrencySelector />
          </div>

          <div className="hidden xl:block">
            <LiveSearch className="w-48" />
          </div>

          <Link
            href="/wishlist"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
            aria-label="Mi wishlist"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>

          <Link
            href={user ? "/account" : "/login"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
            aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
          >
            <User className="h-[18px] w-[18px]" />
          </Link>

          <button
            onClick={openCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted cursor-pointer"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cta px-1 font-mono text-[10px] font-bold text-zinc-950 shadow-[0_0_10px_rgba(70,212,191,0.7)]">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-fade-up mx-auto mt-2 w-full max-w-7xl rounded-xl border border-border bg-card/95 p-4 backdrop-blur-xl md:hidden">
          <LiveSearch className="mb-3" />
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md py-2.5 font-mono text-sm uppercase tracking-widest hover:bg-muted hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-md py-2.5 font-mono text-sm uppercase tracking-widest text-cta"
              >
                Panel Admin
              </Link>
            )}
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            <CurrencySelector />
          </div>
        </div>
      )}
    </header>
  );
}
