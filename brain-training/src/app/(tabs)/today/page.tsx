"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type PlanItem = { gameId: string; label: string; suggestedDifficulty: number };

export default function TodayPage() {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [freePlaysLeft, setFreePlaysLeft] = useState<number>(0);
  const [adsLeft, setAdsLeft] = useState<number>(0);
  const [cooldownSec, setCooldownSec] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/training/today", { cache: "no-store" });
      const data = await res.json();
      setPlan(data.plan);
      setFreePlaysLeft(data.freePlaysLeft);
      setAdsLeft(data.adsLeft);
      setCooldownSec(data.cooldownSec);
    })();
  }, []);

  return (
    <main className="p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-semibold">今日</h1>

      <section className="rounded-xl border p-4 bg-white/50 dark:bg-black/20">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">每日训练（3局）</div>
          <div className="text-sm text-gray-500">免费剩余 {freePlaysLeft} 次</div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {plan.map((item, idx) => (
            <div key={item.gameId} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-semibold">{idx + 1}. {item.label}</div>
                <div className="text-xs text-gray-500">建议难度 {item.suggestedDifficulty.toFixed(1)}</div>
              </div>
              <Link href={`/games/${item.gameId}`} className="px-3 py-2 rounded-md bg-sky-600 text-white font-medium">
                开始
              </Link>
            </div>
          ))}
        </div>
        {freePlaysLeft <= 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <button disabled={adsLeft <= 0 || cooldownSec > 0} className="px-3 py-2 rounded-md bg-amber-500 text-white disabled:opacity-50">
              观看广告继续（{adsLeft}）
            </button>
            <Link href="/subscribe" className="text-sky-700 underline">订阅解锁</Link>
          </div>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <div className="font-medium mb-1">知识卡</div>
        <p className="text-sm text-gray-600">每天5分钟，科学提升专注与记忆。</p>
      </section>
    </main>
  );
}