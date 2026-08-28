export function GiantMarquee({
  items,
  reverse = false,
  fast = false,
  size = "xl",
}: {
  items: string[];
  reverse?: boolean;
  fast?: boolean;
  size?: "lg" | "xl";
}) {
  const anim = reverse ? "animate-marquee-rev" : fast ? "animate-marquee-fast" : "animate-marquee";
  const sizeCls = size === "xl" ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl";

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span
            className={`whitespace-nowrap font-display font-extrabold uppercase tracking-tight ${sizeCls} ${
              i % 2 === 0 ? "text-stroke" : "text-accent/90"
            }`}
          >
            {item}
          </span>
          <span className="mx-8 select-none font-mono text-xl text-cta md:text-2xl">{"//"}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden border-y border-border/60 py-6 md:py-8">
      <div className={`flex w-max ${anim}`}>
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
