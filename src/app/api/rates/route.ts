import { NextResponse } from "next/server";
import { BASE_CURRENCY, getRates } from "@/lib/currency";

export async function GET() {
  const { rates, source } = await getRates();
  return NextResponse.json({
    base: BASE_CURRENCY,
    source,
    rates,
    fetchedAt: new Date().toISOString(),
  });
}
