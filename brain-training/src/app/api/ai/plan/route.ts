export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  const plan = [
    { gameId: "tracklight", label: "专注追光", suggestedDifficulty: 0.7 },
    { gameId: "fastmatch", label: "快速匹配 Pro", suggestedDifficulty: 0.8 },
    { gameId: "pairmaster", label: "配对大师", suggestedDifficulty: 0.6 },
  ];
  return NextResponse.json({ plan, note: "优先短板 + 难-易-难" });
}