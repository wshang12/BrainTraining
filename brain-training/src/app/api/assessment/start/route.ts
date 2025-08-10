export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  const id = randomUUID();
  await kv.set(`assess:${uid}:${id}:start`, Date.now(), { ex: 60 * 60 });
  return NextResponse.json({ ok: true, assessId: id, startedAt: Date.now() });
}