"use client";
import { useEffect, useState } from "react";

type PlanItem = { gameId: string; label: string; suggestedDifficulty: number };

type PlanResp = { plan: PlanItem[] };

export default function AIPage() {
  const [plan, setPlan] = useState<PlanItem[] | null>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/ai/plan", { method: "POST" });
      const data: PlanResp = await res.json();
      setPlan(data.plan);
    })();
  }, []);
  return (
    <main className="p-4 pb-24">
      <h1 className="text-2xl font-semibold mb-2">AI</h1>
      <p className="text-gray-600 mb-3">AI教练建议的今日训练处方：</p>
      {plan && (
        <div className="space-y-2">
          {plan.map((p, i) => (
            <div key={i} className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{i + 1}. {p.label}</div>
                <div className="text-xs text-gray-500">难度 {p.suggestedDifficulty.toFixed(1)}</div>
              </div>
              <a href={`/games/${p.gameId}`} className="px-3 py-2 rounded-md bg-sky-600 text-white">开始</a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}