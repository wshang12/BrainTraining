export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, startedAt: Date.now() });
}