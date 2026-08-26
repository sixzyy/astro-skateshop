import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

function csvCell(value: string | number) {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const status = req.nextUrl.searchParams.get("status");
  const orders = await prisma.order.findMany({
    where: status && status !== "ALL" && ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)
      ? { status: status as never }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: { items: { select: { productName: true, variantTitle: true, quantity: true } } },
  });

  const header = ["Numero", "Fecha", "Estado", "Cliente", "Email", "Ciudad", "Articulos", "Subtotal", "Descuento", "Envio", "Total", "Cupon"];
  const lines = [header.join(",")];
  for (const o of orders) {
    const items = o.items.map((i) => `${i.quantity}x ${i.productName}${i.variantTitle ? ` (${i.variantTitle})` : ""}`).join(" | ");
    lines.push(
      [
        o.number,
        o.createdAt.toISOString(),
        ORDER_STATUS_LABELS[o.status] ?? o.status,
        o.name,
        o.email,
        `${o.city}, ${o.state}`,
        items,
        (o.subtotal - o.discount).toFixed(2),
        o.discount.toFixed(2),
        o.shipping.toFixed(2),
        o.total.toFixed(2),
        o.couponCode ?? "",
      ]
        .map(csvCell)
        .join(",")
    );
  }

  return new NextResponse("\uFEFF" + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ordenes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
