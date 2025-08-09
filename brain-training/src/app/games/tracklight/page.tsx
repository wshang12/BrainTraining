"use client";
import { useEffect, useRef, useState } from "react";
import { getDifficulty, adjustDifficulty } from "@/lib/difficulty";

type Dot = { x: number; y: number; vx: number; vy: number; color: string; target?: boolean };

const COLORS = ["#ff3b30", "#34c759", "#ffcc00", "#0a84ff", "#ff9f0a", "#bf5af2"];

export default function Tracklight() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30_000);
  const [acc, setAcc] = useState(1);
  const [rtMean, setRtMean] = useState(1000);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    let dots: Dot[] = [];
    const diff = getDifficulty("tracklight", 0.7);
    const targetCount = Math.round(1 + diff * 2);
    const speed = 60 + diff * 160;
    const distractors = Math.round(10 + diff * 20);

    const targetColor = COLORS[0];

    function randomDot(target = false): Dot {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        color: target ? targetColor : COLORS[1 + Math.floor(Math.random() * (COLORS.length - 1))],
        target,
      };
    }

    dots = [
      ...Array.from({ length: targetCount }, () => randomDot(true)),
      ...Array.from({ length: distractors }, () => randomDot(false)),
    ];

    let correct = 0;
    let total = 0;
    const rts: number[] = [];
    let lastClickAt = 0;

    function step() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const dt = 1 / 60; // approx
      for (const d of dots) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.target ? 10 : 8, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      }
      if (running) requestAnimationFrame(step);
    }

    const raf = requestAnimationFrame(step);

    function onClick(ev: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      let hit = false;
      for (const d of dots) {
        const dx = d.x - mx;
        const dy = d.y - my;
        if (dx * dx + dy * dy <= (d.target ? 100 : 64)) {
          total += 1;
          const now = performance.now();
          const rt = lastClickAt ? now - lastClickAt : 1000;
          lastClickAt = now;
          if (d.target) {
            correct += 1;
            rts.push(rt);
            setScore((s) => s + 10);
          }
          hit = true;
          break;
        }
      }
      if (!hit) total += 1;
      const accuracy = total ? correct / total : 1;
      setAcc(accuracy);
      const meanRt = rts.length ? Math.max(250, Math.min(2000, rts.reduce((a, b) => a + b, 0) / rts.length)) : 1000;
      setRtMean(meanRt);
    }

    canvas.addEventListener("click", onClick);
    setRunning(true);

    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1000)), 1000);

    return () => {
      setRunning(false);
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (timeLeft === 0) {
      const next = adjustDifficulty("tracklight", acc, rtMean);
      void fetch("/api/games/tracklight/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, acc, rtMean, nextDifficulty: next }),
      });
    }
  }, [timeLeft, acc, rtMean, score]);

  return (
    <main className="min-h-dvh p-4 space-y-3">
      <div className="flex items-center justify-between">
        <a href="/today" className="px-3 py-2 rounded-md border">返回</a>
        <div className="text-lg font-semibold">专注追光</div>
        <div className="text-sm text-gray-600">{(timeLeft / 1000).toFixed(0)}s</div>
      </div>
      <canvas ref={canvasRef} className="w-full h-[500px] rounded-xl border bg-black/5" />
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <div>分数 {score}</div>
        <div>正确率 {(acc * 100).toFixed(0)}%</div>
        <div>平均RT {rtMean.toFixed(0)}ms</div>
      </div>
    </main>
  );
}