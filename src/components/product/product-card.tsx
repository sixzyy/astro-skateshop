import Link from "next/link";
import { cn } from "@/lib/utils";
import { Price } from "@/components/ui/price";
import { QuickAdd } from "@/components/product/quick-add";
import { HeartButton } from "@/components/product/heart-button";
import { ProductImage } from "@/components/ui/product-image";
import type { ProductDTO } from "@/lib/types";

const TAGS = ["LANZAMIENTO", "ÓRBITA", "MISIÓN"];

function tagFor(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return TAGS[sum % TAGS.length];
}

export function ProductCard({
  product,
  className,
  tag,
}: {
  product: ProductDTO;
  className?: string;
  tag?: string;
}) {
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const lowStock = totalStock > 0 && totalStock <= 3;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;
  const sizes = product.variants
    .slice(0, 4)
    .map((v) => v.title)
    .join(" · ");

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-accent/70 hover:shadow-[0_0_32px_rgba(0,240,255,0.16)]",
        className
      )}
    >
      <div className="img-cosmic relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:animate-glitch"
          />
        </Link>
        <div className="scanlines pointer-events-none absolute inset-0 opacity-40" />
        <div className="absolute right-2 top-2 z-10">
          <HeartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? null,
            }}
          />
        </div>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          <span className="rounded-sm border border-accent/50 bg-background/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent backdrop-blur">
            [{tag ?? tagFor(product.id)}]
          </span>
          {discount > 0 && (
            <span className="rounded-sm bg-cta px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-zinc-950 shadow-[0_0_12px_rgba(255,107,0,0.6)]">
              -{discount}%
            </span>
          )}
        </div>
        <QuickAdd
          product={product}
          className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        />
        {totalStock === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="-rotate-6 rounded border-2 border-white px-4 py-1 font-display text-lg font-bold uppercase tracking-widest text-white">
              Agotado
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[101%] border-t border-accent/30 bg-background/95 p-3 font-mono text-[10px] uppercase leading-relaxed tracking-wide text-muted-foreground backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
          <p className="truncate">
            REF:{product.id.slice(-6)} / {product.category.name}
          </p>
          <p className="truncate">MEDIDAS: {sizes}</p>
          <p>STOCK: {totalStock}U</p>
        </div>
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="flex flex-1 flex-col gap-1 p-4"
      >
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80">
          {product.brand.name}
        </p>
        <h3 className="line-clamp-2 min-h-[2.6rem] font-display text-sm font-extrabold uppercase leading-snug tracking-tight transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <Price amount={product.price} className="font-mono text-sm font-bold text-white" />
          {discount > 0 && (
            <span className="truncate text-xs text-muted-foreground line-through">
              <Price amount={product.compareAtPrice!} />
            </span>
          )}
        </div>
        <p className="mt-auto pt-1.5 font-mono text-[10px] uppercase tracking-widest">
          {totalStock === 0 ? (
            <span className="text-red-400">● Agotado</span>
          ) : lowStock ? (
            <span className="animate-pulse text-cta">▲ ¡Solo quedan {totalStock} en órbita!</span>
          ) : (
            <span className="text-emerald-400 [text-shadow:0_0_8px_rgba(52,211,153,0.55)]">● En stock</span>
          )}
        </p>
      </Link>
    </div>
  );
}
