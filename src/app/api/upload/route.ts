import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/api-auth";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

/**
 * Uploads an image to public/uploads (dev-friendly local storage).
 * NOTE: on Vercel this filesystem is ephemeral — switch to a blob store
 * (e.g. @vercel/blob or S3) for production persistence.
 */
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjunta un archivo de imagen." }, { status: 400 });
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Formato no permitido (usa JPG, PNG, WebP o AVIF)." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen pesa más de 4 MB." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
