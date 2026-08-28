import Link from "next/link";
import { MessageCircle, Music2 } from "lucide-react";
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

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/astroskateshop" },
  { icon: Music2, label: "TikTok", href: "https://tiktok.com/@astroskateshop" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@astroskateshop" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/5215512345678" },
];

export function Footer() {
  return (
    <footer className="scanlines relative mt-24 border-t border-accent/20">
      <div className="overflow-hidden select-none border-b border-border/60 py-2">
        <div className="animate-marquee-fast flex w-max">
          {[0, 1].map((n) => (
            <span key={n} className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground" aria-hidden={n === 1}>
              astro skateshop // consola de navegación // est. 2016 // cdmx // órbita baja // transmitiendo //
            </span>
          ))}
        </div>
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
                className="link-glitch inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-all hover:border-accent hover:text-accent hover:shadow-[0_0_14px_rgba(0,240,255,0.35)]"
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
            <li>Envíos a todo México</li>
            <li>Cambios y devoluciones: 30 días</li>
            <li>Pago seguro con Stripe</li>
            <li>Envío gratis desde $999 COP</li>
          </ul>
        </div>

        <div className="panel-corners border border-border/70 bg-card/40 p-5 sm:p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Base terrestre</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground [overflow-wrap:break-word]">
            <li>
              <a href="mailto:hola@astroskate.mx" className="link-glitch break-all">
                hola@astroskate.mx
              </a>
            </li>
            <li>Lun - Sáb / 11am - 8pm</li>
            <li>Roma Norte, CDMX</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-8 sm:text-left lg:px-8">
          <span className="order-first col-span-2 sm:col-span-1">
            Sistema: <span className="text-emerald-400">online ●</span>
          </span>
          <span>Lat 19.4194°N / Lon 99.1453°W</span>
          <span className="text-accent">Señal ▓▓▓▓░</span>
          <span>© {new Date().getFullYear()} Astro Skateshop</span>
        </div>
      </div>
    </footer>
  );
}
