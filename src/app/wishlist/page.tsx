"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { Heart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Mi Wishlist</h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          {items.length === 0 ? "Tu lista esta vacia." : `${items.length} producto${items.length === 1 ? "" : "s"} guardado${items.length === 1 ? "" : "s"}`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-dashed border-border px-6 py-20 text-center">
          <Heart className="h-10 w-10 text-foreground-disabled" />
          <p className="max-w-sm text-sm text-foreground-disabled">
            Toca el corazon en cualquier producto para guardarlo aqui.
          </p>
          <Link href="/products" className="border border-border px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide transition-colors hover:border-border-active">
            Explorar la tienda
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="group relative flex gap-4 border border-border bg-background-secondary/50 p-4 transition-colors hover:border-border-active">
              <Link
                href={`/products/${item.slug}`}
                className="relative block h-24 w-24 shrink-0 overflow-hidden border border-border bg-background-secondary"
              >
                {item.image && (
                  <ProductImage src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="line-clamp-2 font-semibold transition-colors hover:text-foreground">
                  {item.name}
                </Link>
                <p className="mt-2 font-display text-lg font-bold">{formatPrice(item.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="bg-cta px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-cta-hover"
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Quitar ${item.name}`}
                    className="p-1.5 text-foreground-disabled transition-colors hover:text-error cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
