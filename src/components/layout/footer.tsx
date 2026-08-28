import Link from "next/link";
import { CreditCard, Lock, MessageCircle, Music2, ShieldCheck, Truck } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";
import { Logo } from "@/components/layout/logo";

const SHOP_LINKS = [
  { href: "/products?category=tablas", label: "Tablas" },
  { href: "/products?category=grips", label: "Grips" },
  { href: "/products?category=trucks", label: "Trucks" },
  { href: "/products?category=ruedas", label: "Ruedas" },
  { href: "/products?category=tenis", label: "Tenis" },
  { href: "/products?category=ropa", label: "Ropa" },
];

const LEGAL_LINKS = [
  { href: "/legal/terminos", label: "Términos" },
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/envios", label: "Envíos" },
  { href: "/legal/devoluciones", label: "Devoluciones" },
];

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/astroskateshop" },
  { icon: Music2, label: "TikTok", href: "https://tiktok.com/@astroskateshop" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@astroskateshop" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/573001234567" },
];

export function Footer() {
  return (
    <footer className="scanlines relative mt-24 border-t border-accent/20">
      <div className="border-b border-border/60 py-2 text-center">
        <span className="select-none font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          astro skateshop // consola de navegación // est. 2016 // bogotá // órbita baja // transmitiendo //
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="panel-corners overflow-hidden border border-border/70 bg-card/40 p-5 sm:p-6">
          <Logo size="sm" className="sm:hidden" />
          <Logo size="md" className="hidden sm:inline-flex" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Skateshop 100% independiente. Equipo real, producto real, cultura real desde otra órbita.
          </p>
          <div className="mt-4 flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                title={s.label}
                className="link-glitch inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_14px_rgba(111,200,233,0.35)]"
              >
                <s.icon className="h-4 w-4" strokeWidth={1.7} />
              </a>
            ))}
          </div>
        </div>

        <div className="panel-corners border border-border/70 bg-card/40 p-5 sm:p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Módulos</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-glitch">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-corners border border-border/70 bg-card/40 p-5 sm:p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Protocolos</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground [overflow-wrap:break-word]">
            <li>Envíos a todo Colombia</li>
            <li>Cambios y devoluciones: 30 días</li>
            <li>Pago seguro con Stripe</li>
            <li>Envío gratis desde $999 COP</li>
          </ul>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            Documentación
          </p>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-glitch">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-corners border border-border/70 bg-card/40 p-5 sm:p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Base terrestre</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground [overflow-wrap:break-word]">
            <li>
              <a href="mailto:hola@astroskate.co" className="link-glitch break-all">
                hola@astroskate.co
              </a>
            </li>
            <li>Lun - Sáb / 11am - 8pm</li>
            <li>Bogotá, Colombia</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-2.5">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-2 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-cta" /> Conexión segura SSL
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-cta" /> Visa · Mastercard · Amex
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cta" /> Compras protegidas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-cta" /> Envío seguro a todo Colombia
          </span>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-8 sm:text-left lg:px-8">
          <span className="order-first col-span-2 sm:col-span-1">
            Sistema: <span className="text-emerald-400">online ●</span>
          </span>
          <span>Lat 4.7110°N / Lon 74.0721°W</span>
          <span className="text-accent">Señal ▓▓▓▓░</span>
          <span>© {new Date().getFullYear()} Astro Skateshop</span>
        </div>
      </div>
    </footer>
  );
}
