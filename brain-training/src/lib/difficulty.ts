"use client";

export function getDifficulty(gameId: string, fallback = 0.7): number {
  try {
    const v = localStorage.getItem(`diff:${gameId}`);
    if (!v) return fallback;
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0.2, Math.min(1.8, n));
  } catch {}
  return fallback;
}

export function setDifficulty(gameId: string, value: number) {
  const v = Math.max(0.2, Math.min(1.8, value));
  try { localStorage.setItem(`diff:${gameId}`, String(v)); } catch {}
}

export function adjustDifficulty(gameId: string, acc: number, rtMean: number) {
  // target acc 0.8; rt target ~800ms
  const targetAcc = 0.8;
  const targetRt = 800;
  const accDelta = acc - targetAcc; // positive if too easy
  const rtDelta = (targetRt - rtMean) / targetRt; // positive if faster than target
  const current = getDifficulty(gameId);
  const next = current + 0.4 * accDelta + 0.2 * rtDelta;
  setDifficulty(gameId, next);
  return getDifficulty(gameId);
}