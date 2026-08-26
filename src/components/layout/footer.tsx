import Link from "next/link";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { Logo } from "@/components/layout/logo";
import { Star } from "lucide-react";

const SHOP_LINKS = [
  { href: "/products?category=tablas", label: "Decks" },
  { href: "/products?category=grips", label: "Grips" },
  { href: "/products?category=trucks", label: "Trucks" },
  { href: "/products?category=ruedas", label: "Wheels" },
  { href: "/products?category=tenis", label: "Footwear" },
  { href: "/products?category=ropa", label: "Apparel" },
];

const HELP_LINKS = [
  { href: "/rastrear", label: "Rastrear pedido" },
  { href: "/account", label: "Mi cuenta" },
  { href: "/register", label: "Crear cuenta" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Marquee */}
      <div className="overflow-hidden border-b border-border py-3 select-none">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((n) => (
            <span
              key={n}
              className="shrink-0 whitespace-nowrap font-display text-[11px] font-medium uppercase tracking-[0.2em] text-foreground-muted"
              aria-hidden={n === 1}
            >
              ride your own orbit &nbsp;&nbsp;&middot;&nbsp;&nbsp; est. 2016 &nbsp;&nbsp;&middot;&nbsp;&nbsp; skate culture &nbsp;&nbsp;&middot;&nbsp;&nbsp; streetwear &nbsp;&nbsp;&middot;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Logo size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-secondary">
            Skate shop premium. Equipo real, cultura real.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/astroskateshop" },
              { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@astroskateshop" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground-secondary transition-all duration-200 hover:border-border-active hover:text-foreground hover:bg-background-secondary"
              >
                <s.icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
            Shop
          </h3>
          <ul className="mt-4 space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-foreground-secondary transition-colors duration-200 hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
            Help
          </h3>
          <ul className="mt-4 space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-foreground-secondary transition-colors duration-200 hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <span className="text-sm text-foreground-secondary">
                Envio gratis desde $999
              </span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground">
            Contacto
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground-secondary">
            <li>
              <a href="mailto:hola@astroskate.co" className="transition-colors duration-200 hover:text-foreground">
                hola@astroskate.co
              </a>
            </li>
            <li>Colombia</li>
            <li>Lun - Sab / 11am - 8pm</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-foreground-muted sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5 font-display font-semibold uppercase tracking-tight text-foreground-secondary">
            <Star className="h-3 w-3 fill-accent text-accent" />
            Ride Your Own Orbit.
          </span>
          <span className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} ASTRO Skateshop
          </span>
        </div>
      </div>
    </footer>
  );
}
