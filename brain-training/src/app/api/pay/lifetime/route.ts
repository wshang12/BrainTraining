export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  await kv.set(`entitlement:${uid}`, "lifetime");
  return NextResponse.json({ ok: true });
}