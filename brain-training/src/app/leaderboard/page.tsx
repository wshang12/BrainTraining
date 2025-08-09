"use client";
import { useEffect, useState } from "react";

type Entry = { userId: string; score: number };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/leaderboard?scope=week&group_key=all", { cache: "no-store" });
      const data = await res.json();
      setEntries(data.entries ?? []);
    })();
  }, []);
  return (
    <main className="p-4 pb-24 space-y-4">
      <h1 className="text-2xl font-semibold">周榜</h1>
      <div className="rounded-xl border divide-y">
        {entries.map((e, i) => (
          <div key={e.userId} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-6 text-right">{i + 1}</div>
              <div className="font-medium">用户 {e.userId.slice(0, 6)}</div>
            </div>
            <div className="text-sm text-gray-600">{e.score}</div>
          </div>
        ))}
        {entries.length === 0 && <div className="p-4 text-gray-500">暂无数据</div>}
      </div>
    </main>
  );
}