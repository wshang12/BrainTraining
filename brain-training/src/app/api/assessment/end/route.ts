export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  const body = await req.json().catch(() => ({}));
  const { type = "quick", scores = { attention: 50, memory: 50, logic: 50, spatial: 50, speed: 50 } } = body ?? {};
  await kv.set(`assess:${uid}:latest`, JSON.stringify({ type, scores, ts: Date.now() }), { ex: 60 * 60 * 24 * 14 });
  return NextResponse.json({ ok: true });
}