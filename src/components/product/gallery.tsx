"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/product-image";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
        <ProductImage
          src={images[active] ?? images[0]}
          alt={`${name} — vista ${active + 1}`}
          className="aspect-square w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-md border-2 transition-colors cursor-pointer",
                i === active ? "border-accent" : "border-transparent hover:border-border"
              )}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <ProductImage src={src} alt="" className="h-[72px] w-[72px] object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
