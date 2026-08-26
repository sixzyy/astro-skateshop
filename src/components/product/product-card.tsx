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
        "group relative flex h-full flex-col",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background-secondary">
        <Link href={`/products/${product.slug}`} className="block h-full" aria-label={product.name}>
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </Link>

        {/* Top actions */}
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

        {/* Quick add */}
        {!outOfStock && (
          <div className="absolute bottom-3 right-3 z-10 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <QuickAdd product={product} />
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-cta px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            -{discount}%
          </span>
        )}

        {/* Sold out */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[2px]">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col gap-0.5 px-1 pt-3 pb-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-foreground-disabled">
          {product.brand.name}
        </p>
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-accent">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <Price amount={product.price} className="text-sm font-semibold text-foreground" />
          {discount > 0 && (
            <>
              <Price amount={product.compareAtPrice!} className="text-xs text-foreground-muted line-through" />
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
