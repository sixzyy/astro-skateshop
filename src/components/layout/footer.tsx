import Link from "next/link";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { Logo } from "@/components/layout/logo";

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
    <footer className="border-t border-border-subtle">
      {/* Marquee */}
      <div className="overflow-hidden border-b border-border-subtle py-3 select-none">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((n) => (
            <span
              key={n}
              className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.4em] text-foreground-secondary/40"
              aria-hidden={n === 1}
            >
              ride your own orbit &nbsp;&nbsp;//&nbsp;&nbsp; est. 2016 &nbsp;&nbsp;//&nbsp;&nbsp; cdmx &nbsp;&nbsp;//&nbsp;&nbsp; skate culture &nbsp;&nbsp;//&nbsp;&nbsp; streetwear &nbsp;&nbsp;//&nbsp;&nbsp;
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
            Skate y streetwear independiente. Equipo real, cultura real.
          </p>
          <div className="mt-5 flex gap-3">
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground-secondary transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <s.icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-secondary/60">
            Shop
          </h3>
          <ul className="mt-4 space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-secondary/60">
            Help
          </h3>
          <ul className="mt-4 space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <span className="text-sm text-foreground-secondary">
                Envios a todo Mexico
              </span>
            </li>
            <li>
              <span className="text-sm text-foreground-secondary">
                Envio gratis desde $999 MXN
              </span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-secondary/60">
            Contacto
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-foreground-secondary">
            <li>
              <a href="mailto:hola@astroskate.mx" className="transition-colors hover:text-foreground">
                hola@astroskate.mx
              </a>
            </li>
            <li>Roma Norte, CDMX</li>
            <li>Lun - Sab / 11am - 8pm</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-foreground-secondary/50 sm:px-6 lg:px-8">
          <span className="font-display font-bold uppercase tracking-tight text-foreground-secondary/70">
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
