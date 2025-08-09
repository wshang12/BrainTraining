export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // TODO: validate and persist
  const xp = 120;
  return NextResponse.json({ ok: true, xpAwarded: xp });
}