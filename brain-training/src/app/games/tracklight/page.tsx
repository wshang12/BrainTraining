"use client";
import { useEffect, useRef, useState } from "react";
import { getDifficulty, adjustDifficulty } from "@/lib/difficulty";
import GameResult from "@/components/GameResult";

type Dot = { x: number; y: number; vx: number; vy: number; color: string; target?: boolean };

const COLORS = ["#ff3b30", "#34c759", "#ffcc00", "#0a84ff", "#ff9f0a", "#bf5af2"];

export default function Tracklight() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30_000);
  const [acc, setAcc] = useState(1);
  const [rtMean, setRtMean] = useState(1000);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const [difficulty, setDifficulty] = useState(0.7);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);

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
    setDifficulty(diff);
    const targetCount = Math.round(1 + diff * 2);
    const speed = 60 + diff * 160;
    const distractors = Math.round(10 + diff * 20);

    const targetColor = COLORS[0];

    // 加载个人最佳
    const stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
    if (stats.tracklight?.highScore) {
      setPersonalBest(stats.tracklight.highScore);
    }

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
      ...Array(targetCount).fill(0).map(() => randomDot(true)),
      ...Array(distractors).fill(0).map(() => randomDot(false)),
    ];

    let animId: number;
    let lastTime = performance.now();
    let startTime = lastTime;
    let clicks = 0;
    let hits = 0;
    const reactionTimes: number[] = [];
    let lastClickTime = 0;

    function update(time: number) {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      
      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      dots.forEach((dot) => {
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        dot.x = Math.max(0, Math.min(width, dot.x));
        dot.y = Math.max(0, Math.min(height, dot.y));

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.target ? 15 : 12, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        
        // 添加光晕效果
        if (dot.target) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = dot.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      const elapsed = time - startTime;
      const remaining = Math.max(0, 30_000 - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        cancelAnimationFrame(animId);
        endGame();
      } else {
        animId = requestAnimationFrame(update);
      }
    }

    function handleClick(e: MouseEvent) {
      if (!running) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      clicks++;
      const clickTime = performance.now();
      if (lastClickTime > 0) {
        reactionTimes.push(clickTime - lastClickTime);
      }
      lastClickTime = clickTime;

      let hit = false;
      dots.forEach((dot) => {
        const dx = x - dot.x;
        const dy = y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20 && dot.target) {
          hit = true;
          hits++;
          // 重新生成目标点
          Object.assign(dot, randomDot(true));
        }
      });

      if (!hit) {
        // 点击错误，添加视觉反馈
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    function endGame() {
      setRunning(false);
      const accuracy = clicks > 0 ? hits / clicks : 0;
      const rtAvg = reactionTimes.length > 0 
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
        : 1000;
      
      setAcc(accuracy);
      setRtMean(rtAvg);
      
      const finalScore = Math.round(hits * 100 + accuracy * 500 - rtAvg * 0.1);
      setScore(finalScore);
      
      const nextDiff = adjustDifficulty("tracklight", accuracy, rtAvg);
      
      // 显示结果
      setShowResult(true);
    }

    if (running && ctx) {
      canvas.addEventListener("click", handleClick);
      animId = requestAnimationFrame(update);
      return () => {
        canvas.removeEventListener("click", handleClick);
        cancelAnimationFrame(animId);
      };
    }
  }, [running]);

  useEffect(() => {
    // 检查是否第一次玩
    const played = localStorage.getItem('hasPlayed_tracklight');
    if (!played) {
      setShowTutorial(true);
    } else {
      setHasPlayedBefore(true);
    }
  }, []);

  const startGame = () => {
    setRunning(true);
    setTimeLeft(30_000);
    setScore(0);
    setAcc(1);
    setRtMean(1000);
    setShowResult(false);
    
    // 标记已经玩过
    localStorage.setItem('hasPlayed_tracklight', 'true');
  };

  const handleStartFromTutorial = () => {
    setShowTutorial(false);
    startGame();
  };

  const playAgain = () => {
    setShowResult(false);
    startGame();
  };

  return (
    <main className="p-4 pb-24 max-w-4xl mx-auto space-y-4">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          <span className="hero-gradient">专注追光</span>
        </h1>
        <p className="text-foreground/60">点击红色的移动光点，避开其他颜色</p>
      </header>

      <div className="card-interactive rounded-2xl overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[500px] cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm space-y-1">
          <div>时间: {(timeLeft / 1000).toFixed(1)}秒</div>
          <div>准确率: {(acc * 100).toFixed(0)}%</div>
          <div>难度: {difficulty.toFixed(1)}</div>
        </div>
        
        {!running && !showResult && !showTutorial && (
          <button onClick={startGame} className="btn btn-primary px-8 py-3">
            开始游戏
          </button>
        )}
      </div>

      {/* 新手教程 */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-background rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-float">
            <div className="bg-gradient-to-br from-genius-400 to-genius-600 p-6 text-white text-center">
              <span className="text-5xl mb-4 block">🎯</span>
              <h2 className="text-2xl font-bold mb-2">游戏教程</h2>
              <p className="text-white/90">30秒快速上手</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-semibold">点击红色光点</h3>
                    <p className="text-sm text-foreground/70">这是你的目标，快速准确地点击它们</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">避开其他颜色</h3>
                    <p className="text-sm text-foreground/70">点击错误会扣分，保持专注</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">⏱️</span>
                  <div>
                    <h3 className="font-semibold">30秒挑战</h3>
                    <p className="text-sm text-foreground/70">在有限时间内获得最高分</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-genius-50 dark:bg-genius-900/20 rounded-xl p-4">
                <p className="text-sm text-center">
                  <span className="font-medium">小技巧：</span>
                  准确率比速度更重要，宁可慢一点也要点准确！
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="btn py-3 bg-foreground/10"
                >
                  稍后再玩
                </button>
                <button
                  onClick={handleStartFromTutorial}
                  className="btn btn-primary py-3"
                >
                  开始游戏
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 游戏说明 */}
      {!running && !showResult && !showTutorial && (
        <section className="card-interactive p-5 space-y-3">
          <h3 className="font-semibold">游戏说明</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li>• 点击红色光点得分</li>
            <li>• 避免点击其他颜色的光点</li>
            <li>• 游戏时长30秒</li>
            <li>• 准确率越高，得分越高</li>
          </ul>
          
          {hasPlayedBefore && (
            <div className="pt-2 border-t">
              <p className="text-sm text-foreground/60">
                个人最佳: <span className="font-medium text-genius-600">{personalBest}</span> 分
              </p>
            </div>
          )}
        </section>
      )}

      {/* 游戏结果 */}
      {showResult && (
        <GameResult
          gameId="tracklight"
          gameName="专注追光"
          score={score}
          accuracy={acc}
          reactionTime={Math.round(rtMean)}
          difficulty={difficulty}
          personalBest={personalBest}
          onPlayAgain={playAgain}
        />
      )}
    </main>
  );
}