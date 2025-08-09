export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { dayKey } from "@/lib/kvKeys";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  const body = await req.json().catch(() => ({}));

  const freeKey = dayKey(uid, "freePlays");
  const freeLeft = await kv.decr(freeKey).catch(() => null);
  const xp = 120;
  return NextResponse.json({ ok: true, xpAwarded: xp, freePlaysLeft: freeLeft });
}