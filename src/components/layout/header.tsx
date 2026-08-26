"use client";

import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLDivElement>(null);

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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backdropFilter: "blur(20px) saturate(1.2)",
          WebkitBackdropFilter: "blur(20px) saturate(1.2)",
        }}
      >
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
            scrolled
              ? "h-[72px] border-b border-border-subtle"
              : "h-[72px]"
          }`}
          style={{
            maxWidth: "1400px",
            background: scrolled
              ? "rgba(10, 13, 22, 0.92)"
              : "transparent",
          }}
        >
          {/* Mobile menu */}
          <button
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors hover:bg-card md:hidden"
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
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <span key={link.label} className="inline-flex items-center gap-1">
                {i > 0 && (
                  <span className="font-mono text-[10px] text-foreground-disabled select-none">
                    {"//"}
                  </span>
                )}
                <Link
                  href={link.href}
                  className="group relative inline-flex min-h-[48px] items-center gap-1.5 px-3 py-1.5 font-mono text-xs sm:text-sm uppercase tracking-[0.12em] font-medium text-foreground-secondary transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-foreground hover:-translate-y-[2px] animate-stagger-in animate-fade-in"
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  <span className="absolute -bottom-0.5 left-3 right-3 h-px w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full" />
                  {link.label}
                </Link>
              </span>
            ))}
            {user?.role === "ADMIN" && (
              <span className="inline-flex items-center gap-1">
                <span className="font-mono text-[10px] text-foreground-disabled select-none">/</span>
                <Link
                  href="/admin"
                  className="inline-flex min-h-[48px] items-center px-3 py-1.5 font-mono text-xs sm:text-sm uppercase tracking-[0.12em] font-medium text-cta transition-all duration-300 hover:text-cta-hover"
                >
                  Admin
                </Link>
              </span>
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
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 hover:bg-card"
              aria-label="Wishlist"
            >
              <Heart className="h-[20px] w-[20px]" />
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 hover:bg-card"
              aria-label={user ? "Mi cuenta" : "Iniciar sesion"}
            >
              <User className="h-[20px] w-[20px]" />
            </Link>

            <button
              onClick={openCart}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 hover:bg-card"
              aria-label="Carrito"
            >
              <ShoppingBag className="h-[20px] w-[20px]" />
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
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="animate-slide-in absolute left-0 top-0 h-full w-72 border-r border-border bg-background-secondary p-6">
            <div className="mb-8">
              <Logo size="sm" />
            </div>
            <LiveSearch className="mb-6" />
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[56px] items-center rounded-lg px-3 text-lg font-medium text-foreground-secondary transition-colors duration-200 hover:bg-card hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[56px] items-center rounded-lg px-3 text-lg font-medium text-cta"
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
