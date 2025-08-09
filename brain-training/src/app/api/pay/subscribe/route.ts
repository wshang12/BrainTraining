export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  await kv.set(`entitlement:${uid}`, "subscription", { ex: 60 * 60 * 24 * 30 });
  return NextResponse.json({ ok: true });
}