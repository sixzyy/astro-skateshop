import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  PAID: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  SHIPPED: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  DELIVERED: "bg-green-600/15 text-green-500 border-green-600/30",
  CANCELLED: "bg-red-500/15 text-red-500 border-red-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status] ?? "border-border bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-accent px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-zinc-950",
        className
      )}
    >
      {children}
    </span>
  );
}

export function BadgeOutline({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
