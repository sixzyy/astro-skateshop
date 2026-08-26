import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { productInputSchema } from "@/lib/validators";
import { slugify, extractProxiedImageUrl } from "@/lib/utils";
import { withImagesAll } from "@/lib/types";

function sanitizeImages(images: string[]): string[] {
  return images
    .map((img) => {
      if (img.startsWith("/")) return img;
      const real = extractProxiedImageUrl(img);
      return real || null;
    })
    .filter((img): img is string => img !== null);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const perPage = 12;
  const category = sp.get("category");
  const brand = sp.get("brand");
  const q = sp.get("q");
  const min = Number(sp.get("min"));
  const max = Number(sp.get("max"));
  const sort = sp.get("sort") ?? "newest";

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = { slug: category };
  if (brand) where.brand = { slug: brand };
  if (q) where.OR = [{ name: { contains: q } }, { description: { contains: q } }];
  if (!Number.isNaN(min) && min > 0 || !Number.isNaN(max) && max > 0) {
    where.price = {
      ...(min > 0 ? { gte: min } : {}),
      ...(max > 0 ? { lte: max } : {}),
    };
  }

  const orderBy: Record<string, string> =
    sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, category: true, brand: true },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({ products: withImagesAll(products), total, page, pages: Math.ceil(total / perPage) });
  } catch {
    return NextResponse.json({ products: [], total: 0, page, pages: 0 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const sanitizedImages = sanitizeImages(data.images);
  let slug = slugify(data.name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      images: JSON.stringify(sanitizedImages),
      specs: data.specs ? JSON.stringify(data.specs) : undefined,
      featured: data.featured,
      published: data.published,
      publishedAt: data.publishedAt ?? null,
      categoryId: data.categoryId,
      brandId: data.brandId,
      variants: {
        create: data.variants.map((v, i) => ({
          title: v.title,
          stock: v.stock,
          sku: v.sku || `${slug.toUpperCase().slice(0, 18)}-${i + 1}`,
        })),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
