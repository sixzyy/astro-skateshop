import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md";

const SIZES: Record<LogoSize, { svg: string; text: string; shop: string }> = {
  sm: { svg: "h-7 w-10", text: "text-base", shop: "text-[8px]" },
  md: { svg: "h-8 w-12", text: "text-xl", shop: "text-[9px]" },
};

export function Logo({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex max-w-full items-center gap-2.5 whitespace-nowrap", className)}>
      <svg viewBox="0 0 52 34" className={cn("shrink-0", s.svg)} aria-hidden="true">
        <defs>
          <radialGradient id="astro-planet" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#8b46ff" />
            <stop offset="55%" stopColor="#2a085c" />
            <stop offset="100%" stopColor="#150430" />
          </radialGradient>
        </defs>
        <ellipse
          cx="26"
          cy="15"
          rx="22"
          ry="6.5"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.3"
          opacity="0.5"
          transform="rotate(-12 26 15)"
        />
        <circle cx="26" cy="14" r="10" fill="url(#astro-planet)" />
        <circle cx="22.5" cy="10.5" r="2" fill="#1b0a38" opacity="0.85" />
        <circle cx="29.5" cy="16.5" r="1.4" fill="#1b0a38" opacity="0.85" />
        <circle cx="25" cy="18.5" r="0.9" fill="#1b0a38" opacity="0.7" />
        <rect x="7" y="21.4" width="38" height="2.4" rx="1.2" fill="#b9b9c9" />
        <rect x="24" y="21.4" width="4" height="2.4" fill="#00f0ff" opacity="0.9" />
        <circle cx="8.6" cy="27" r="3.6" fill="#141420" stroke="#00f0ff" strokeWidth="1.4" />
        <circle cx="8.6" cy="27" r="1.2" fill="#ff6b00" />
        <circle cx="43.4" cy="27" r="3.6" fill="#141420" stroke="#00f0ff" strokeWidth="1.4" />
        <circle cx="43.4" cy="27" r="1.2" fill="#ff6b00" />
      </svg>
      <span
        className={cn(
          "min-w-0 truncate font-display font-extrabold uppercase leading-none tracking-tight",
          s.text
        )}
      >
        Astro<span className="text-accent">Skate</span>
        <span
          className={cn(
            "ml-1 align-top font-mono font-normal tracking-[0.25em] text-muted-foreground",
            s.shop
          )}
        >
          SHOP
        </span>
      </span>
    </span>
  );
}
