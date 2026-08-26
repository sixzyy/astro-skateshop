import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { session: null, response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session, response: null };
}
