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
  { href: "/products", label: "Shop" },
  { href: "/products?category=tablas", label: "Decks" },
  { href: "/products?category=ropa", label: "Apparel" },
  { href: "/armador", label: "Builder" },
];

export function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: scrolled ? "blur(12px)" : undefined,
          WebkitBackdropFilter: scrolled ? "blur(12px)" : undefined,
        }}
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            scrolled
              ? "h-16 border-b border-border bg-background/90"
              : "h-[72px]"
          }`}
          style={{ maxWidth: "1280px" }}
        >
          {/* Mobile menu */}
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-background-secondary md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link href="/" aria-label="ASTRO - Inicio" className="shrink-0">
            <Logo size={scrolled ? "sm" : "md"} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors duration-200 hover:text-foreground rounded-lg hover:bg-background-secondary"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3 py-2 text-sm font-medium text-cta transition-colors duration-200 hover:text-cta-hover rounded-lg hover:bg-cta-light"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            <div className="hidden md:block">
              <LiveSearch className="w-44" />
            </div>

            <Link
              href="/wishlist"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-background-secondary"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-background-secondary"
              aria-label={user ? "Mi cuenta" : "Iniciar sesion"}
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            <button
              onClick={openCart}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-background-secondary"
              aria-label="Carrito"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="animate-slide-in absolute left-0 top-0 h-full w-72 border-r border-border bg-background p-6">
            <div className="mb-8">
              <Logo size="sm" />
            </div>
            <LiveSearch className="mb-6" />
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors duration-200 hover:bg-background-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-cta"
                >
                  Admin
                </Link>
              )}
            </nav>
            <div className="mt-6 border-t border-border pt-4">
              <CurrencySelector />
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-[72px]" />
    </>
  );
}
