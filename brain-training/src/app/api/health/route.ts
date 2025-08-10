export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { getPrisma } from "@/lib/db";

export async function GET() {
  try {
    // Redis ping via a simple set/get roundtrip
    const pingKey = `ping:${Date.now()}`;
    await kv.set(pingKey, "1", { ex: 10 });
    const ping = await kv.get(pingKey);

    // Prisma simple query (no table required)
    const prisma = await getPrisma();
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ ok: true, redis: ping === "1", db: true, ts: Date.now() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}