"use client";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { text: string; sub: string; iso: string }> = {
  sm: { text: "text-base", sub: "text-[9px]", iso: "h-6 w-6" },
  md: { text: "text-lg", sub: "text-[10px]", iso: "h-7 w-7" },
  lg: { text: "text-xl", sub: "text-[11px]", iso: "h-9 w-9" },
};

export function Logo({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "group/logo inline-flex items-center gap-2.5",
        className
      )}
    >
      {/* Isotype — deck silhouette in precision circle, rotates on hover */}
      <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.15s" }}>
        <svg
          viewBox="0 0 32 32"
          className={cn(
            "shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/logo:rotate-[15deg]",
            s.iso
          )}
          aria-hidden="true"
          fill="none"
        >
          <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
          <path
            d="M12.5 7L16 5L19.5 7L20.5 23L16 25.5L11.5 23Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <line x1="13" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
          <line x1="13" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
          {/* Star accent */}
          <path d="M16 2 L16.8 4.5 L16 4 L15.2 4.5 Z" fill="currentColor" opacity="0.2" />
        </svg>
      </span>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span
          className={cn(
            "font-display font-black uppercase tracking-tighter transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/logo:translate-x-[3px]",
            s.text
          )}
        >
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.25s" }}>A</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.3s" }}>s</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.35s" }}>t</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.4s" }}>r</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.45s" }}>o</span>
        </span>
        <span className={cn("font-mono uppercase tracking-[0.2em] text-foreground-disabled", s.sub)}>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.55s" }}>[</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.6s" }}>S</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.65s" }}>k</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.7s" }}>a</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.75s" }}>t</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.8s" }}>e</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.85s" }}>&nbsp;</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.9s" }}>L</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "0.95s" }}>a</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "1.0s" }}>b</span>
          <span className="inline-block animate-logo-entrance" style={{ animationDelay: "1.05s" }}>]</span>
        </span>
      </span>
    </span>
  );
}
