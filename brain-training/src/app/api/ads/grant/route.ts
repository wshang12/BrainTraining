export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { dayKey } from "@/lib/kvKeys";

const COOLDOWN = 60 * 10; // 10 minutes

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";

  const adsKey = dayKey(uid, "adsLeft");
  let adsLeft = (await kv.get<number>(adsKey)) ?? 0;
  const cooldownKey = `u:${uid}:adCooldown`;
  const ttl = await kv.ttl(cooldownKey);
  if (ttl > 0) return NextResponse.json({ ok: false, reason: "cooldown", cooldownSec: ttl }, { status: 429 });
  if (adsLeft <= 0) return NextResponse.json({ ok: false, reason: "limit" }, { status: 403 });

  adsLeft -= 1;
  await kv.set(adsKey, adsLeft);
  await kv.set(cooldownKey, 1, { ex: COOLDOWN });
  return NextResponse.json({ ok: true, adsLeft, cooldownSec: COOLDOWN });
}