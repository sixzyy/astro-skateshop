import type { ReactNode } from "react";

export function LegalPage({
  title,
  kicker,
  updated,
  children,
}: {
  title: string;
  kicker: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
        {kicker}
      </span>
      <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Última actualización: {updated}
      </p>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({
  heading,
  paragraphs,
  list,
}: {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}) {
  return (
    <section>
      <h2 className="font-display text-base font-bold uppercase tracking-wide text-accent">
        {heading}
      </h2>
      {paragraphs?.map((p) => (
        <p key={p} className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
      {list && (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}