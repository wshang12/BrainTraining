"use client";
import { useEffect, useMemo, useState } from "react";
import { getDifficulty, adjustDifficulty } from "@/lib/difficulty";

type Trial = { left: string; right: string; same: boolean };
const POOL = ["▲","■","●","◆","▶","★","☂","☀","☯","☘"];

export default function Fastmatch() {
  const diff = useMemo(() => getDifficulty("fastmatch", 0.7), []);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [idx, setIdx] = useState(0);
  const [accCount, setAccCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [start, setStart] = useState<number>(0);

  const total = 30;
  const presentMs = Math.max(400, Math.round(1500 - diff * 900));
  const iti = Math.max(300, Math.round(600 - diff * 200));

  useEffect(() => {
    const gens: Trial[] = [];
    for (let i = 0; i < total; i++) {
      const a = POOL[Math.floor(Math.random() * POOL.length)];
      const same = Math.random() < 0.5;
      const b = same ? a : POOL.filter((s) => s !== a)[Math.floor(Math.random() * (POOL.length - 1))];
      gens.push({ left: a, right: b, same });
    }
    setTrials(gens);
    setIdx(0);
  }, [diff]);

  useEffect(() => {
    if (idx >= total) {
      const acc = accCount / total;
      const rtMean = rts.length ? Math.max(250, Math.min(2000, rts.reduce((a, b) => a + b, 0) / rts.length)) : 1000;
      const score = Math.round(acc * 1000 + Math.max(0, (1200 - rtMean)));
      const next = adjustDifficulty("fastmatch", acc, rtMean);
      void fetch("/api/games/fastmatch/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, acc, rtMean, mistakes, nextDifficulty: next }),
      });
      return;
    }
    const t = setTimeout(() => setStart(performance.now()), 50);
    return () => clearTimeout(t);
  }, [idx]);

  function answer(isSame: boolean) {
    if (idx >= total) return;
    const t = performance.now();
    setRts((prev) => [...prev, start ? t - start : 1000]);
    const trial = trials[idx];
    if (trial && trial.same === isSame) setAccCount((v) => v + 1);
    else setMistakes((m) => m + 1);
    setIdx((i) => i + 1);
    setTimeout(() => {}, iti);
  }

  const trial = trials[idx];

  return (
    <main className="min-h-dvh p-4 space-y-4">
      <div className="flex items-center justify-between">
        <a href="/today" className="px-3 py-2 rounded-md border">返回</a>
        <div className="text-lg font-semibold">快速匹配 Pro</div>
        <div className="text-sm text-gray-600">{idx}/{total}</div>
      </div>
      {idx < total ? (
        <div className="rounded-xl border p-6 text-center space-y-6">
          <div className="text-6xl tracking-widest select-none">{trial?.left} {trial?.right}</div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => answer(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-md">相同</button>
            <button onClick={() => answer(false)} className="px-4 py-2 bg-rose-600 text-white rounded-md">不同</button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-6 text-center">
          <div className="mb-2">完成！</div>
          <div>正确 {accCount}/{total}，错误 {mistakes}</div>
        </div>
      )}
    </main>
  );
}