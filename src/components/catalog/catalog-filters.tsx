"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { BrandDTO, CategoryDTO } from "@/lib/types";

interface Props {
  categories: CategoryDTO[];
  brands: BrandDTO[];
}

export function CatalogFilters({ categories, brands }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min", minPrice);
    else params.delete("min");
    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const currentCategory = searchParams.get("category");
  const currentBrand = searchParams.get("brand");
  const inStockOnly = searchParams.get("stock") === "1";
  const sort = searchParams.get("sort") ?? "newest";

  return (
    <aside className="space-y-6">
      <div className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest">
        <SlidersHorizontal className="h-4 w-4 text-accent" /> Filtros
      </div>

      <FilterBlock title="Categoría">
        <FilterRow label="Todas" active={!currentCategory} onClick={() => updateParam("category", null)} />
        {categories.map((c) => (
          <FilterRow
            key={c.id}
            label={c.name}
            active={currentCategory === c.slug}
            onClick={() => updateParam("category", c.slug)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Marca">
        <FilterRow label="Todas" active={!currentBrand} onClick={() => updateParam("brand", null)} />
        {brands.map((b) => (
          <FilterRow
            key={b.id}
            label={b.name}
            active={currentBrand === b.slug}
            onClick={() => updateParam("brand", b.slug)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Precio (MXN)">
        <form onSubmit={applyPrice} className="flex items-center gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            inputMode="numeric"
            placeholder="Mín"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-accent"
          />
          <span className="text-muted-foreground">—</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            inputMode="numeric"
            placeholder="Máx"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="h-9 shrink-0 rounded-md bg-accent px-3 font-display text-xs font-bold uppercase text-zinc-950 cursor-pointer hover:bg-accent-strong"
          >
            OK
          </button>
        </form>
      </FilterBlock>

      <FilterBlock title="Disponibilidad">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam("stock", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Solo productos en stock
        </label>
      </FilterBlock>

      <FilterBlock title="Ordenar por">
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value === "newest" ? null : e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm outline-none focus:border-accent cursor-pointer"
        >
          <option value="newest">Más recientes</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
      </FilterBlock>
    </aside>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-widest">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterRow({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm transition-colors cursor-pointer ${
        active ? "font-display font-bold text-accent" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
