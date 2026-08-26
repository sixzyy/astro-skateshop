import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import type { BrandDTO, CategoryDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  let categories: CategoryDTO[] = [];
  let brands: BrandDTO[] = [];
  try {
    [categories, brands] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-accent">
          ← Productos
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight">Nuevo producto</h1>
      </header>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
