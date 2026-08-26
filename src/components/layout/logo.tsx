import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { text: string; sub: string; iso: string }> = {
  sm: { text: "text-sm", sub: "text-[8px]", iso: "h-5 w-5" },
  md: { text: "text-base", sub: "text-[9px]", iso: "h-6 w-6" },
  lg: { text: "text-lg", sub: "text-[10px]", iso: "h-8 w-8" },
};

export function Logo({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Isotype — sharp deck silhouette in precision circle */}
      <svg
        viewBox="0 0 32 32"
        className={cn("shrink-0", s.iso)}
        aria-hidden="true"
        fill="none"
      >
        <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        <path
          d="M12 6L16 4L20 6L21 24L16 27L11 24Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <line x1="13" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="13" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      </svg>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className={cn("font-display font-black uppercase tracking-tighter", s.text)}>
          Astro
        </span>
        <span className={cn("font-mono uppercase tracking-[0.2em] text-foreground-disabled", s.sub)}>
          [Skate Lab]
        </span>
      </span>
    </span>
  );
}
