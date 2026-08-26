"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

export function ProductRowActions({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();

  async function togglePublished() {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert("No se pudo eliminar el producto (puede tener ventas asociadas).");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={togglePublished}
        title={published ? "Ocultar de la tienda" : "Publicar en la tienda"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted cursor-pointer"
      >
        {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
      </button>
      <Link
        href={`/admin/products/${id}`}
        title="Editar"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={remove}
        title="Eliminar"
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
