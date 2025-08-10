"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDifficulty, adjustDifficulty } from "@/lib/difficulty";

type Card = { id: number; symbol: string; flipped: boolean; matched: boolean };
const SYMBOLS = ["🍎","🍊","🍋","🍉","🍇","🍓","🥝","🍍","🥥","🥑","🫐","🍒","🍑","🍈","🥕","🌽","🍆","🥦"];

export default function Pairmaster() {
  const [cards, setCards] = useState<Card[]>([]);
  const [firstIdx, setFirstIdx] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState<number>(0);

  const diff = useMemo(() => getDifficulty("pairmaster", 0.7), []);
  const grid = useMemo(() => {
    // map diff to grid size: 2x3 .. 6x6
    const size = Math.min(6, Math.max(2, Math.round(2 + diff * 4)));
    const rows = size;
    const cols = size;
    const pairs = Math.floor((rows * cols) / 2);
    return { rows, cols, pairs };
  }, [diff]);

  useEffect(() => {
    const symbols = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, grid.pairs);
    const deck: Card[] = symbols
      .flatMap((s, i) => [{ id: i * 2, symbol: s, flipped: false, matched: false }, { id: i * 2 + 1, symbol: s, flipped: false, matched: false }])
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFirstIdx(null);
    setMistakes(0);
    setMoves(0);
    setStartAt(performance.now());
    // time limit: generous → strict
    const limit = Math.round(120 + (1.2 - diff) * 60); // seconds
    setTimeLimit(limit);
    setDoneAt(null);
  }, [grid.pairs, diff]);

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const totalPairs = grid.pairs;
  const finished = matchedCount === totalPairs || (doneAt != null && doneAt > 0);

  useEffect(() => {
    if (matchedCount === totalPairs && doneAt == null) setDoneAt(performance.now());
  }, [matchedCount, totalPairs, doneAt]);

  useEffect(() => {
    if (!finished) return;
    const durationSec = startAt && doneAt ? Math.max(1, Math.round((doneAt - startAt) / 1000)) : timeLimit;
    const efficiency = totalPairs > 0 ? (totalPairs / Math.max(1, moves / 2)) : 0; // optimal moves is pairs*2 flips
    const acc = Math.max(0, Math.min(1, 1 - mistakes / Math.max(1, moves)));
    const score = Math.round(1000 * efficiency + Math.max(0, (timeLimit - durationSec)) * 5);
    const estRt = Math.max(400, Math.min(2000, (durationSec * 1000) / Math.max(1, moves)));
    const next = adjustDifficulty("pairmaster", acc, estRt);
    void fetch("/api/games/pairmaster/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, mistakes, moves, durationSec, efficiency, acc, rtMean: estRt, nextDifficulty: next }),
    });
  }, [finished, startAt, doneAt, timeLimit, moves, mistakes, totalPairs]);

  useEffect(() => {
    if (timeLimit <= 0 || finished) return;
    const t = setInterval(() => {
      setTimeLimit((s) => {
        if (s <= 1) {
          setDoneAt(performance.now());
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLimit, finished]);

  function onFlip(idx: number) {
    if (finished) return;
    setCards((prev) => {
      const next = [...prev];
      if (next[idx].flipped || next[idx].matched) return prev;
      next[idx] = { ...next[idx], flipped: true };
      return next;
    });
    setMoves((m) => m + 1);
    if (firstIdx == null) {
      setFirstIdx(idx);
    } else {
      const a = cards[firstIdx];
      const b = cards[idx];
      if (!a || !b) return;
      if (a.symbol === b.symbol && a.id !== b.id) {
        // match
        setCards((prev) => prev.map((c) => (c.symbol === a.symbol && c.flipped ? { ...c, matched: true } : c)));
        setFirstIdx(null);
      } else {
        setMistakes((e) => e + 1);
        const toUnflipA = firstIdx;
        const toUnflipB = idx;
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) => (i === toUnflipA || i === toUnflipB ? { ...c, flipped: false } : c)));
        }, 400);
        setFirstIdx(null);
      }
    }
  }

  return (
    <main className="min-h-dvh p-4 space-y-3">
      <div className="flex items-center justify-between">
        <a href="/today" className="px-3 py-2 rounded-md border">返回</a>
        <div className="text-lg font-semibold">配对大师</div>
        <div className="text-sm text-gray-600">{timeLimit}s</div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}>
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onFlip(i)}
            className={`aspect-square rounded-lg border grid place-items-center text-3xl select-none ${
              c.matched ? "bg-green-100" : c.flipped ? "bg-white" : "bg-gray-100"
            }`}
          >
            {c.flipped || c.matched ? c.symbol : "?"}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <div>步数 {moves}</div>
        <div>错误 {mistakes}</div>
        <div>已配对 {matchedCount}/{totalPairs}</div>
      </div>
    </main>
  );
}