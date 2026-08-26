export function GiantMarquee({
  items,
  reverse = false,
  size = "lg",
}: {
  items: string[];
  reverse?: boolean;
  size?: "lg" | "xl";
}) {
  const anim = reverse ? "animate-marquee-rev" : "animate-marquee";
  const sizeCls = size === "xl" ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl";

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span
            className={`whitespace-nowrap font-display font-extrabold uppercase tracking-tighter ${sizeCls} ${
              i % 2 === 0 ? "text-foreground/[0.06]" : "text-foreground/[0.10]"
            }`}
          >
            {item}
          </span>
          <span className="mx-6 font-mono text-sm text-foreground-disabled md:mx-10">
            {"//"}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-background-secondary/30 py-8 md:py-12">
      <div className={`flex w-max ${anim}`}>
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
