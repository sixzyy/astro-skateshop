"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  brandName: string;
}

export function LiveSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      let alive = true;
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((json) => {
          if (!alive) return;
          setItems(json.products ?? []);
          setOpen(true);
        })
        .catch(() => null)
        .finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={go}>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Buscar en la galaxia..."
          aria-label="Buscar productos"
          autoComplete="off"
          className="h-9 w-full rounded-md border border-border bg-card pl-8 pr-8 font-mono text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
        />
      </form>
      {loading && (
        <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-accent" />
      )}

      {open && items.length > 0 && (
        <div className="animate-fade-up absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-accent/30 bg-card shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <ul className="max-h-[320px] divide-y divide-border overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/products/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                    {item.image && (
                      <ProductImage src={item.image} alt="" fill sizes="44px" className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {item.brandName}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-sm font-bold text-accent">
                    {formatPrice(item.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={go}
            className="block w-full border-t border-border bg-muted/40 px-3 py-2 text-center font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-muted"
          >
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
}
