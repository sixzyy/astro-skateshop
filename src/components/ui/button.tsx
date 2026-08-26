import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "destructive" | "accent-outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "btn-glow-cta bg-cta text-zinc-950 font-bold hover:bg-cta-strong active:scale-[0.98] transition-all",
  outline:
    "border border-accent/50 bg-transparent text-accent hover:bg-accent/10 hover:border-accent transition-colors",
  ghost: "hover:bg-muted transition-colors",
  destructive: "bg-red-600 text-white hover:bg-red-500 transition-colors",
  "accent-outline":
    "btn-glow-cyan border border-accent/60 text-accent hover:bg-accent hover:text-zinc-950 font-semibold transition-colors",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-display uppercase tracking-wide disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
