import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { svg: string; text: string; sub: string }> = {
  sm: { svg: "h-6 w-6", text: "text-sm", sub: "text-[7px]" },
  md: { svg: "h-7 w-7", text: "text-base", sub: "text-[8px]" },
  lg: { svg: "h-9 w-9", text: "text-lg", sub: "text-[9px]" },
};

export function Logo({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className={cn("shrink-0", s.svg)}
        aria-hidden="true"
        fill="none"
      >
        {/* Orbit ring — incomplete, open at top-right */}
        <path
          d="M16 2.5C8.548 2.5 2.5 8.548 2.5 16S8.548 29.5 16 29.5"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.35"
          strokeLinecap="round"
        />
        {/* Planet body */}
        <circle cx="16" cy="16" r="7.5" fill="currentColor" opacity="0.12" />
        <circle cx="16" cy="16" r="7.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* Wheel accent on the orbit */}
        <circle cx="16" cy="4" r="2.5" fill="var(--cta)" opacity="0.9" />
        <circle cx="16" cy="4" r="1" fill="var(--background)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold uppercase tracking-tight",
            s.text
          )}
        >
          Astro
        </span>
        <span
          className={cn(
            "font-mono uppercase tracking-[0.3em] text-foreground-secondary",
            s.sub
          )}
        >
          Skateshop
        </span>
      </span>
    </span>
  );
}
