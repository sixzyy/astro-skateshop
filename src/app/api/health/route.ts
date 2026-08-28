import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      uptime: Math.round(process.uptime()),
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", time: new Date().toISOString() },
      { status: 503 }
    );
  }
}