import Link from "next/link";
import { cn } from "@/lib/utils";
import { Price } from "@/components/ui/price";
import { QuickAdd } from "@/components/product/quick-add";
import { HeartButton } from "@/components/product/heart-button";
import { ProductImage } from "@/components/ui/product-image";
import type { ProductDTO } from "@/lib/types";

export function ProductCard({
  product,
  className,
}: {
  product: ProductDTO;
  className?: string;
}) {
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const outOfStock = totalStock === 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
        className
      )}
    >
      {/* Image — slight grayscale, color on hover, translateY */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-card">
        <Link href={`/products/${product.slug}`} className="block h-full" aria-label={product.name}>
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.035]"
          />
        </Link>

        {/* Top actions */}
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

        {/* SKU tag — bottom left */}
        <span className="absolute bottom-3 left-3 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-disabled opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {product.slug}
        </span>

        {/* Quick add — bottom right */}
        {!outOfStock && (
          <div className="absolute bottom-3 right-3 z-10 translate-y-2 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <QuickAdd product={product} />
          </div>
        )}

        {/* Sold out overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[2px]">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-disabled">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col gap-1 px-1 pt-3 pb-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground-disabled">
          {product.brand.name}
        </p>
        <h3 className="line-clamp-1 font-display text-sm font-bold uppercase leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <Price
            amount={product.price}
            className="text-sm font-semibold text-foreground"
          />
          {discount > 0 && (
            <>
              <Price
                amount={product.compareAtPrice!}
                className="text-xs text-foreground-disabled line-through"
              />
              <span className="text-xs font-medium text-cta">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
