export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { LB_WEEK_KEY } from "@/lib/kvKeys";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupKey = searchParams.get("group_key") ?? "all";
  const key = LB_WEEK_KEY(groupKey);
  const res = await kv.zrange(key, 0, 19, { withScores: true, rev: true });
  const entries = (Array.isArray(res) ? (res as { member: string; score: number }[]) : [])
    .map((e) => ({ userId: e.member, score: e.score }));
  return NextResponse.json({ entries });
}