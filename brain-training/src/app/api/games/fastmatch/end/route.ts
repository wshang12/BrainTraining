export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { dayKey, LB_WEEK_KEY, weekKey } from "@/lib/kvKeys";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  const body = await req.json();
  const { score = 0 } = body ?? {};

  const weekXpKey = weekKey(uid, "xp");
  const xp = await kv.incrby(weekXpKey, Math.max(0, Math.floor(score)));
  const doneKey = dayKey(uid, "trained");
  const done = await kv.get(doneKey);
  if (!done) {
    await kv.set(doneKey, 1, { ex: 60 * 60 * 24 });
    await kv.incr(weekKey(uid, "streak"));
  }
  const streak = (await kv.get<number>(weekKey(uid, "streak"))) ?? 0;
  const scoreWeek = Math.floor(0.8 * xp + 0.2 * streak * 100);
  await kv.zadd(LB_WEEK_KEY("all"), { member: uid, score: scoreWeek });

  return NextResponse.json({ ok: true, scoreWeek, xp, streak });
}