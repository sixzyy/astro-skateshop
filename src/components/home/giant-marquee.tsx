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
  const sizeCls = size === "xl" ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl";

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="inline-flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="inline-flex items-center">
          <span
            className={`whitespace-nowrap font-display font-bold uppercase tracking-tight ${sizeCls} ${
              i % 2 === 0 ? "text-foreground/[0.06]" : "text-foreground/[0.09]"
            }`}
          >
            {item}
          </span>
          <span className="mx-5 text-sm text-foreground-disabled md:mx-8">
            &middot;
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-8 md:py-10">
      <div className={anim} style={{ display: "flex", width: "max-content" }}>
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
