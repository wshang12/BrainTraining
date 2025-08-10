export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  const raw = await kv.get<string>(`assess:${uid}:latest`);
  const data = raw ? JSON.parse(raw) : null;
  return NextResponse.json(data ?? { scores: { attention: 50, memory: 50, logic: 50, spatial: 50, speed: 50 }, ts: null });
}