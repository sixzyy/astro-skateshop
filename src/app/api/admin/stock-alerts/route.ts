import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const alerts = await prisma.stockAlert.findMany({
    where: { notifiedAt: null, variant: { stock: 0 } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      variant: {
        select: {
          id: true,
          title: true,
          sku: true,
          product: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  const grouped = new Map<string, { variant: (typeof alerts)[number]["variant"]; emails: string[]; since: Date }>();
  for (const alert of alerts) {
    const entry = grouped.get(alert.variantId);
    if (entry) {
      entry.emails.push(alert.email);
      if (alert.createdAt < entry.since) entry.since = alert.createdAt;
    } else {
      grouped.set(alert.variantId, {
        variant: alert.variant,
        emails: [alert.email],
        since: alert.createdAt,
      });
    }
  }

  return NextResponse.json({ groups: [...grouped.values()] });
}

export async function DELETE(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const variantId = req.nextUrl.searchParams.get("variantId");
  if (!variantId) return NextResponse.json({ error: "Falta variantId" }, { status: 400 });

  // Mark as notified instead of deleting: keeps history of who was informed.
  await prisma.stockAlert.updateMany({
    where: { variantId, notifiedAt: null },
    data: { notifiedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
