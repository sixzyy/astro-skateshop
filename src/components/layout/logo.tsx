"use client";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { text: string; sub: string; iso: string }> = {
  sm: { text: "text-base", sub: "text-[8px]", iso: "h-5 w-5" },
  md: { text: "text-lg", sub: "text-[9px]", iso: "h-6 w-6" },
  lg: { text: "text-xl", sub: "text-[10px]", iso: "h-7 w-7" },
};

export function Logo({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  const s = SIZES[size];
  return (
    <span className={cn("group/logo inline-flex items-center gap-2", className)}>
      {/* Star — clean four-point */}
      <svg
        viewBox="0 0 24 24"
        className={cn("shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/logo:rotate-90", s.iso)}
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M12 2 L13.2 9.5 L20 12 L13.2 14.5 L12 22 L10.8 14.5 L4 12 L10.8 9.5 Z"
          fill="currentColor"
          className="text-foreground"
        />
      </svg>
      <span className="flex items-baseline gap-1 leading-none">
        <span className={cn("font-display font-bold uppercase tracking-tight", s.text)}>
          Astro
        </span>
        <span className={cn("font-mono uppercase tracking-[0.15em] text-foreground-muted", s.sub)}>
          Skate
        </span>
      </span>
    </span>
  );
}
