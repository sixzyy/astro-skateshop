import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { saveSettings } from "@/lib/settings";
import { settingsInputSchema } from "@/lib/validators";

export async function PUT(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const parsed = settingsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ajustes inválidos" }, { status: 400 });
  }

  await saveSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
