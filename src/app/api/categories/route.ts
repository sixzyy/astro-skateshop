import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { categoryInputSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const name = parsed.data.name;
  const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug: slugify(name) }] } });
  if (existing) {
    return NextResponse.json({ error: "La categoría ya existe" }, { status: 409 });
  }

  const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
  return NextResponse.json({ category }, { status: 201 });
}
