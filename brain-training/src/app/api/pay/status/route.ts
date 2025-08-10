export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  const ent = (await kv.get<string>(`entitlement:${uid}`)) ?? null;
  return NextResponse.json({ entitlement: ent });
}