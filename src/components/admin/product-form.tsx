"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { extractProxiedImageUrl, isDirectImageUrl } from "@/lib/utils";
import type { BrandDTO, CategoryDTO, VariantDTO } from "@/lib/types";

interface Props {
  categories: CategoryDTO[];
  brands: BrandDTO[];
  initial?: {
    id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    specs: Record<string, string> | null;
    featured: boolean;
    published: boolean;
    publishedAt: Date | string | null;
    categoryId: string;
    brandId: string;
    variants: VariantDTO[];
  };
}

interface VariantRow {
  id?: string;
  title: string;
  sku: string;
  stock: string;
}

export function ProductForm({ categories, brands, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice ? String(initial.compareAtPrice) : "");
  const [imagesText, setImagesText] = useState(initial ? initial.images.join("\n") : "");
  const [specsText, setSpecsText] = useState(
    initial?.specs ? Object.entries(initial.specs).map(([k, v]) => `${k}: ${v}`).join("\n") : ""
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ? new Date(initial.publishedAt).toISOString().slice(0, 16) : ""
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? brands[0]?.id ?? "");
  const [variants, setVariants] = useState<VariantRow[]>(
    initial
      ? initial.variants.map((v) => ({ id: v.id, title: v.title, sku: v.sku, stock: String(v.stock) }))
      : [{ title: "", sku: "", stock: "0" }]
  );

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const specs: Record<string, string> = {};
    for (const line of specsText.split("\n")) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        if (key) specs[key] = line.slice(idx + 1).trim();
      }
    }

    const rawImages = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);
    let proxyResolved = false;
    const imageList = rawImages.map((u) => {
      if (isDirectImageUrl(u)) return u;
      const inner = extractProxiedImageUrl(u);
      if (inner && isDirectImageUrl(inner)) {
        proxyResolved = true;
        return inner;
      }
      return u;
    });
    const badImage = imageList.find((u) => !isDirectImageUrl(u));
    if (badImage) {
      setError(
        `Esta URL no es una imagen directa: "${badImage}". Abre la foto, clic derecho → "Copiar dirección de la imagen" y pega ese enlace (termina en .jpg, .png o .webp).`
      );
      return;
    }
    if (proxyResolved) {
      setInfo("Detectamos enlaces de proxy (Discord/Brave) y los cambiamos por la imagen original. ✅");
      setImagesText(imageList.join("\n"));
    }

    const payload = {
      name,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      images: imageList,
      specs,
      featured,
      published,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      categoryId,
      brandId,
      variants: variants
        .filter((v) => v.title.trim())
        .map((v) => ({ ...(v.id ? { id: v.id } : {}), title: v.title.trim(), sku: v.sku.trim() || undefined, stock: Number(v.stock || 0) })),
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${initial!.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No se pudo guardar el producto.");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Error de conexión.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">{error}</p>
      )}
      {info && (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm text-accent">{info}</p>
      )}

      <Card title="Información general">
        <Field label="Nombre del producto">
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={3} className={inputCls} placeholder="Tabla Santa Cruz VX..." />
        </Field>
        <Field label="Descripción">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} rows={4} className={inputCls} placeholder="Describe el producto, materiales, uso recomendado..." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio (MXN)">
            <input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" step="0.01" min="1" className={inputCls} />
          </Field>
          <Field label="Precio anterior (opcional, para mostrar descuento)">
            <input value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} type="number" step="0.01" min="0" className={inputCls} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoría">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={`${inputCls} cursor-pointer`}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Marca">
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required className={`${inputCls} cursor-pointer`}>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Publicado en tienda
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Destacado en home
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Drop programado (opcional)
          </span>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={`${inputCls} cursor-pointer`}
          />
          <span className="mt-1.5 block text-[11px] leading-snug text-muted-foreground">
            Oculto del catálogo hasta esa fecha/hora. Su página pública muestra cuenta regresiva y
            se libera sola al llegar la hora — sin tocar nada más. Prepara su stock en Inventario
            antes del lanzamiento.
          </span>
        </label>
      </Card>

      <Card title="Imágenes (una URL por línea)">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Pega el enlace <strong className="text-accent">directo</strong> a la foto (debe terminar en .jpg, .png o
          .webp). Truco: abre la imagen, clic derecho sobre ella → "Copiar dirección de la imagen". Los enlaces de
          búsqueda de Google, Brave o Pinterest no sirven.
        </p>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={4}
          className={inputCls}
          placeholder={"https://ejemplo.com/foto-tabla.jpg\nhttps://i.imgur.com/mi-foto.webp"}
        />
      </Card>

      <Card title='Especificaciones (formato "Clave: valor", una por línea)'>
        <textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={3} className={inputCls} placeholder={"Construcción: Maple 7 capas\nOrigen: EE.UU."} />
      </Card>

      <Card title="Variantes e inventario">
        <div className="space-y-3">
          {variants.map((variant, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-md border border-border p-3">
              <div className="min-w-36 flex-1">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Medida / Talla
                </span>
                <input
                  value={variant.title}
                  onChange={(e) => updateVariant(i, { title: e.target.value })}
                  placeholder='8.0" / M / 54mm'
                  className={inputCls}
                />
              </div>
              <div className="w-32">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">SKU</span>
                <input value={variant.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} placeholder="Auto" className={inputCls} />
              </div>
              <div className="w-24">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stock</span>
                <input value={variant.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} type="number" min="0" className={inputCls} />
              </div>
              <button
                type="button"
                onClick={() => setVariants((rows) => rows.filter((_, idx) => idx !== i))}
                disabled={variants.length === 1}
                className="mb-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 disabled:opacity-30 cursor-pointer"
                aria-label="Quitar variante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVariants((rows) => [...rows, { title: "", sku: "", stock: "0" }])}
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 font-display text-xs font-bold uppercase tracking-wide hover:border-accent hover:text-accent cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar variante
        </button>
      </Card>

      <button
        type="submit"
        disabled={saving}
        className="btn-glow-cta h-12 w-full rounded-md bg-cta font-display text-sm font-bold uppercase tracking-wide text-zinc-950 transition-all hover:bg-cta-strong active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:px-10 cursor-pointer"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-accent";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-5">
      <legend className="px-1 font-display text-xs font-bold uppercase tracking-widest">{title}</legend>
      <div className="space-y-4 pt-1">{children}</div>
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
