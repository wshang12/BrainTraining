import { NextResponse } from "next/server";

export async function GET() {
  // Mocked daily plan: easy-hard-easy
  const plan = [
    { gameId: "tracklight", label: "专注追光", suggestedDifficulty: 0.6 },
    { gameId: "pairmaster", label: "配对大师", suggestedDifficulty: 0.9 },
    { gameId: "fastmatch", label: "快速匹配 Pro", suggestedDifficulty: 0.7 },
  ];
  return NextResponse.json({ plan, freePlaysLeft: 3, adsLeft: 3, cooldownSec: 0 });
}