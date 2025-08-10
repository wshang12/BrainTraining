export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

const LIST_KEY = "analytics:events";
const MAX_LEN = 2000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  await kv.lpush(LIST_KEY, JSON.stringify(body));
  await kv.ltrim(LIST_KEY, 0, MAX_LEN - 1);
  return NextResponse.json({ ok: true });
}