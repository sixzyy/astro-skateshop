import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.approved !== "boolean") {
    return NextResponse.json({ error: "Falta el campo approved" }, { status: 400 });
  }

  try {
    const review = await prisma.review.update({ where: { id }, data: { approved: body.approved } });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Reseña no encontrada." }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.review.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
