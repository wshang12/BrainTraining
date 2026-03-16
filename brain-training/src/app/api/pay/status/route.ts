export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("uid");
  const uid = cookie?.value ?? "guest";
  
  let ent = null;
  if (!USE_MOCK) {
    ent = (await kv.get<string>(`entitlement:${uid}`)) ?? null;
  }
  
  return NextResponse.json({ entitlement: ent });
}