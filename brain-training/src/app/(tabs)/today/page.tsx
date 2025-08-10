"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type PlanItem = { gameId: string; label: string; suggestedDifficulty: number };

// 游戏元数据 - 每个游戏都有独特的个性
const GAME_META = {
  tracklight: {
    icon: "🎯",
    gradient: "from-genius-400 to-genius-600",
    description: "追踪移动目标，锻炼专注力",
    difficulty: { easy: "悠闲模式", medium: "挑战模式", hard: "极限模式" }
  },
  pairmaster: {
    icon: "🧩",
    gradient: "from-wisdom-400 to-wisdom-600",
    description: "记忆配对，提升工作记忆",
    difficulty: { easy: "入门 2x3", medium: "进阶 4x4", hard: "大师 6x6" }
  },
  fastmatch: {
    icon: "⚡",
    gradient: "from-fire-400 to-fire-600",
    description: "快速判断，训练反应速度",
    difficulty: { easy: "慢速", medium: "标准", hard: "闪电" }
  }
};

// 激励文案池 - 根据时间和状态动态选择
const MOTIVATIONS = {
  morning: ["唤醒沉睡的大脑", "今天，从挑战开始", "晨练让思维更敏锐"],
  afternoon: ["午后充能时刻", "保持专注，战胜困倦", "激活你的潜能"],
  evening: ["睡前最后的挑战", "今天的最后一次突破", "为明天储备能量"],
  streak: ["连续{days}天，你太棒了！", "保持势头，延续传奇", "习惯的力量正在显现"]
};

export default function TodayPage() {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [freePlaysLeft, setFreePlaysLeft] = useState<number>(0);
  const [adsLeft, setAdsLeft] = useState<number>(0);
  const [cooldownSec, setCooldownSec] = useState<number>(0);
  const [entitlement, setEntitlement] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("morning");
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 确定时间段
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");

    // 获取数据
    (async () => {
      const [resPlan, resEnt] = await Promise.all([
        fetch("/api/training/today", { cache: "no-store" }),
        fetch("/api/pay/status", { cache: "no-store" }),
      ]);
      const data = await resPlan.json();
      setPlan(data.plan);
      setFreePlaysLeft(data.freePlaysLeft);
      setAdsLeft(data.adsLeft);
      setCooldownSec(data.cooldownSec);
      // 模拟连续天数
      setStreak(Math.floor(Math.random() * 7) + 1);
      
      const ent = await resEnt.json();
      setEntitlement(ent.entitlement ?? null);
      setLoading(false);
    })();
  }, []);

  // 冷却倒计时
  useEffect(() => {
    if (cooldownSec > 0) {
      const timer = setTimeout(() => setCooldownSec(cooldownSec - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSec]);

  const getMotivation = () => {
    if (streak > 2) {
      return MOTIVATIONS.streak[0].replace("{days}", streak.toString());
    }
    const pool = MOTIVATIONS[timeOfDay];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const getDifficultyLabel = (gameId: string, difficulty: number) => {
    const meta = GAME_META[gameId as keyof typeof GAME_META];
    if (!meta) return `难度 ${difficulty.toFixed(1)}`;
    
    if (difficulty < 0.6) return meta.difficulty.easy;
    if (difficulty < 1.2) return meta.difficulty.medium;
    return meta.difficulty.hard;
  };

  if (loading) {
    return (
      <main className="p-4 pb-24 space-y-4">
        {/* 骨架屏 - 让等待不枯燥 */}
        <div className="skeleton h-8 w-32 rounded-lg"></div>
        <div className="skeleton h-48 rounded-2xl"></div>
        <div className="skeleton h-32 rounded-2xl"></div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-24 space-y-6">
      {/* 标题区 - 不只是标题，是情感连接 */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          <span className="hero-gradient">{getMotivation()}</span>
        </h1>
        {streak > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-fire-500 animate-pulse-soft">🔥</span>
            <span className="text-foreground/70">连续训练 {streak} 天</span>
          </div>
        )}
      </header>

      {/* 每日训练卡片 - 核心体验 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">今日挑战</h2>
          <div className="text-sm">
            {freePlaysLeft > 0 ? (
              <span className="text-genius-600">剩余 {freePlaysLeft} 次</span>
            ) : (
              <span className="text-foreground/50">今日已完成</span>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {plan.map((item, idx) => {
            const meta = GAME_META[item.gameId as keyof typeof GAME_META];
            const paywalled = item.gameId === "fastmatch" && !entitlement;
            const canPlay = freePlaysLeft > 0 && !paywalled;

            return (
              <div 
                key={item.gameId} 
                className={`
                  game-card p-5 
                  ${canPlay ? 'card-interactive' : 'opacity-75'}
                  ${idx === 0 && canPlay ? 'animate-glow' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{meta?.icon || "🎮"}</span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {item.label}
                          {paywalled && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                              Pro
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-foreground/60">{meta?.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`
                        px-2 py-1 rounded-full 
                        ${item.suggestedDifficulty < 0.6 ? 'bg-growth-100 text-growth-700' :
                          item.suggestedDifficulty < 1.2 ? 'bg-genius-100 text-genius-700' :
                          'bg-fire-100 text-fire-700'}
                      `}>
                        {getDifficultyLabel(item.gameId, item.suggestedDifficulty)}
                      </span>
                      <span className="text-foreground/50">
                        约 3 分钟
                      </span>
                    </div>
                  </div>

                  {paywalled ? (
                    <Link 
                      href="/subscribe" 
                      className="btn btn-primary px-6 py-3 text-sm whitespace-nowrap"
                    >
                      解锁 Pro
                    </Link>
                  ) : (
                    <Link 
                      href={`/games/${item.gameId}`} 
                      className={`
                        btn px-6 py-3 text-sm whitespace-nowrap touch-target
                        ${canPlay ? 
                          `bg-gradient-to-r ${meta?.gradient || 'from-genius-500 to-genius-600'} text-white` : 
                          'bg-foreground/10 text-foreground/50 cursor-not-allowed'
                        }
                      `}
                      onClick={(e) => !canPlay && e.preventDefault()}
                    >
                      {canPlay ? '开始' : '已完成'}
                    </Link>
                  )}
                </div>

                {/* 进度指示器 - 可视化成就 */}
                {idx === 0 && canPlay && (
                  <div className="mt-4 h-1 bg-foreground/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${meta?.gradient} animate-pulse`}
                      style={{ width: '30%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 次数用尽时的选项 */}
        {freePlaysLeft <= 0 && (
          <div className="card-interactive p-4 space-y-3">
            <p className="text-sm text-foreground/70">今日训练已完成，继续挑战？</p>
            <div className="flex gap-3">
              <button 
                disabled={adsLeft <= 0 || cooldownSec > 0} 
                className="btn flex-1 py-2 bg-foreground/10 disabled:opacity-50"
              >
                {cooldownSec > 0 ? 
                  `冷却中 (${cooldownSec}s)` : 
                  `看广告继续 (${adsLeft})`
                }
              </button>
              <Link 
                href="/subscribe" 
                className="btn btn-primary flex-1 py-2 text-center"
              >
                升级 Pro
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 知识卡片 - 不只是装饰 */}
      <section className="card-interactive p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">💡</span>
            今日知识
          </h3>
          <span className="text-xs text-foreground/50">每日一则</span>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">工作记忆的秘密</h4>
          <p className="text-sm text-foreground/70 leading-relaxed">
            研究表明，工作记忆可以通过训练提升。每天15分钟的专注练习，
            能让你的大脑在4周内产生可测量的改变。
          </p>
          <Link 
            href="/knowledge" 
            className="text-sm text-genius-600 hover:text-genius-700 inline-flex items-center gap-1"
          >
            了解更多 →
          </Link>
        </div>
      </section>

      {/* 快速入口 - 探索更多 */}
      <section className="grid grid-cols-2 gap-4">
        <Link 
          href="/leaderboard" 
          className="card-interactive p-4 text-center space-y-2 group"
        >
          <span className="text-2xl group-hover:animate-float">🏆</span>
          <p className="text-sm font-medium">排行榜</p>
        </Link>
        <Link 
          href="/assess/quick" 
          className="card-interactive p-4 text-center space-y-2 group"
        >
          <span className="text-2xl group-hover:animate-float">📊</span>
          <p className="text-sm font-medium">能力测评</p>
        </Link>
      </section>
    </main>
  );
}