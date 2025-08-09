export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { dayKey } from "@/lib/kvKeys";
import { randomUUID } from "crypto";

const FREE_PLAYS_PER_DAY = 3;
const ADS_PER_DAY = 3;

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? randomUUID();

  // init daily counters if missing
  const freeKey = dayKey(uid, "freePlays");
  const adsKey = dayKey(uid, "adsLeft");
  const arr1 = (await kv.mget(freeKey, adsKey)) as (number | null)[];
  let freePlays = arr1[0] as number | null;
  let adsLeft = arr1[1] as number | null;
  if (freePlays == null) await kv.set(freeKey, FREE_PLAYS_PER_DAY, { ex: 60 * 60 * 24 });
  if (adsLeft == null) await kv.set(adsKey, ADS_PER_DAY, { ex: 60 * 60 * 24 });
  const arr2 = (await kv.mget(freeKey, adsKey)) as (number | null)[];
  freePlays = arr2[0] ?? FREE_PLAYS_PER_DAY;
  adsLeft = arr2[1] ?? ADS_PER_DAY;

  const cooldownKey = `u:${uid}:adCooldown`;
  const ttl = await kv.ttl(cooldownKey);
  const cooldownSec = ttl > 0 ? ttl : 0;

  const plan = [
    { gameId: "tracklight", label: "专注追光", suggestedDifficulty: 0.6 },
    { gameId: "pairmaster", label: "配对大师", suggestedDifficulty: 0.9 },
    { gameId: "fastmatch", label: "快速匹配 Pro", suggestedDifficulty: 0.7 },
  ];

  const res = NextResponse.json({ plan, freePlaysLeft: freePlays, adsLeft, cooldownSec });
  if (!cookie) res.cookies.set("uid", uid, { path: "/", httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return res;
}