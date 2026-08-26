import { prisma } from "@/lib/prisma";

/**
 * Filter for products visible in the storefront:
 * published = true AND (publishedAt is null OR already reached).
 * Drops with a future date are hidden until their launch moment.
 */
export function scheduledFilter() {
  return {
    published: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
  };
}

/** True when a drop is currently scheduled (for the countdown banner). */
export async function nextScheduledDrop() {
  const product = await prisma.product.findFirst({
    where: { published: true, publishedAt: { gt: new Date() } },
    orderBy: { publishedAt: "asc" },
    select: { id: true, name: true, slug: true, images: true, price: true, publishedAt: true },
  });
  return product;
}
