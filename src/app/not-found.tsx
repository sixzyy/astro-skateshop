import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(39,64,111,0.5),transparent_65%)]" />
      <div className="relative text-center">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">{"// 404"}</p>
        <h1 className="mt-3 font-display text-6xl font-extrabold uppercase tracking-tight sm:text-8xl">
          Perdido en
          <span className="text-stroke"> el espacio</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          La ruta que buscas no existe o fue movida. Volvé a órbita con alguno de estos accesos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-glow-cta inline-flex h-11 items-center rounded-md bg-cta px-6 font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-cta-strong active:scale-[0.98]"
          >
            Inicio
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center rounded-md border border-accent/50 px-6 font-display text-sm font-bold uppercase tracking-wide text-accent transition-colors hover:bg-accent/10"
          >
            Tienda
          </Link>
          <Link
            href="/armador"
            className="inline-flex h-11 items-center rounded-md border border-border px-6 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            Armador 3D
          </Link>
        </div>
      </div>
    </div>
  );
}