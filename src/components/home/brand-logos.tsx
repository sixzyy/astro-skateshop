const BRANDS = [
  { name: "Santa Cruz", cls: "font-display font-extrabold tracking-tight" },
  { name: "Independent", cls: "font-mono font-bold tracking-[0.18em] uppercase" },
  { name: "Spitfire", cls: "font-display italic font-bold tracking-wide" },
  { name: "Element", cls: "font-sans font-extrabold uppercase tracking-[0.28em]" },
  { name: "Vans", cls: "font-display font-extrabold tracking-widest" },
  { name: "Nike SB", cls: "font-mono font-bold tracking-[0.22em] uppercase" },
  { name: "Thrasher", cls: "font-display font-extrabold tracking-tight uppercase" },
];

export function BrandLogos() {
  return (
    <section className="border-y border-border/60 py-10 md:py-12">
      <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
        {"// marcas asociadas"}
      </p>
      <ul className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 sm:px-6 lg:px-8">
        {BRANDS.map((brand) => (
          <li
            key={brand.name}
            className={`text-lg text-muted-foreground/80 transition-colors duration-200 hover:text-accent sm:text-xl ${brand.cls}`}
          >
            {brand.name}
          </li>
        ))}
      </ul>
    </section>
  );
}