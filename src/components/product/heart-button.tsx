"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { cn } from "@/lib/utils";

interface Props {
  product: { id: string; slug: string; name: string; price: number; image?: string | null };
  className?: string;
}

export function HeartButton({ product, className }: Props) {
  const items = useWishlistStore((s) => s.items);
  const toggle = useWishlistStore((s) => s.toggle);
  const [pop, setPop] = useState(false);
  const active = items.some((i) => i.id === product.id);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image ?? null,
    });
    setPop(true);
    setTimeout(() => setPop(false), 350);
  }

  return (
    <button
      onClick={onClick}
      aria-label={active ? "Quitar de wishlist" : "Agregar a wishlist"}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background-secondary/80 backdrop-blur transition-all hover:border-foreground/30 hover:text-foreground",
        active && "border-cta text-cta",
        pop && "scale-125",
        className
      )}
    >
      <Heart className={cn("h-4 w-4 transition-colors", active && "fill-cta")} />
    </button>
  );
}
