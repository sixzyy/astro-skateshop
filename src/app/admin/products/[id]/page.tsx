import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { parseImages, parseSpecs, type BrandDTO, type CategoryDTO, type VariantDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  let product = null;
  let categories: CategoryDTO[] = [];
  let brands: BrandDTO[] = [];

  try {
    [product, categories, brands] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        include: { variants: true },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {}

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-accent">
          ← Productos
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight">Editar producto</h1>
      </header>

      <ProductForm
        categories={categories}
        brands={brands}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? null,
          images: parseImages(product.images),
          specs: parseSpecs(product.specs),
          featured: product.featured,
          published: product.published,
          publishedAt: product.publishedAt,
          categoryId: product.categoryId,
          brandId: product.brandId,
          variants: product.variants as unknown as VariantDTO[],
        }}
      />
    </div>
  );
}
