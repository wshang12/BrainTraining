"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cloudinary } from "@/lib/cloudinary";

interface Game {
  id: string;
  name: string;
  description: string;
  category: 'attention' | 'memory' | 'speed' | 'logic' | 'spatial';
  icon: string;
  gradient: string;
  difficulty: {
    min: number;
    max: number;
    current: number;
  };
  stats?: {
    highScore: number;
    lastPlayed: Date;
    totalPlays: number;
    avgAccuracy: number;
  };
  isPro?: boolean;
}

const GAMES: Game[] = [
  {
    id: 'tracklight',
    name: '专注追光',
    description: '追踪移动的光点，训练视觉注意力和手眼协调',
    category: 'attention',
    icon: '🎯',
    gradient: 'from-genius-400 to-genius-600',
    difficulty: { min: 0.2, max: 1.8, current: 0.7 }
  },
  {
    id: 'pairmaster',
    name: '配对大师',
    description: '翻转卡片找到匹配的配对，增强工作记忆',
    category: 'memory',
    icon: '🧩',
    gradient: 'from-wisdom-400 to-wisdom-600',
    difficulty: { min: 0.2, max: 1.8, current: 0.7 }
  },
  {
    id: 'fastmatch',
    name: '快速匹配',
    description: '极速判断图形是否相同，提升反应速度',
    category: 'speed',
    icon: '⚡',
    gradient: 'from-fire-400 to-fire-600',
    difficulty: { min: 0.2, max: 1.8, current: 0.7 },
    isPro: true
  },
  {
    id: 'logicpuzzle',
    name: '逻辑谜题',
    description: '解决数字和图形谜题，锻炼逻辑推理能力',
    category: 'logic',
    icon: '🔢',
    gradient: 'from-purple-400 to-purple-600',
    difficulty: { min: 0.2, max: 1.8, current: 0.5 },
    stats: undefined // 即将推出
  },
  {
    id: 'spatialrotation',
    name: '空间旋转',
    description: '心像旋转3D物体，提升空间想象力',
    category: 'spatial',
    icon: '🎲',
    gradient: 'from-emerald-400 to-emerald-600',
    difficulty: { min: 0.2, max: 1.8, current: 0.6 },
    stats: undefined // 即将推出
  }
];

const CATEGORY_INFO = {
  attention: { name: '专注力', color: 'text-genius-600', bg: 'bg-genius-50' },
  memory: { name: '记忆力', color: 'text-wisdom-600', bg: 'bg-wisdom-50' },
  speed: { name: '反应速度', color: 'text-fire-600', bg: 'bg-fire-50' },
  logic: { name: '逻辑思维', color: 'text-purple-600', bg: 'bg-purple-50' },
  spatial: { name: '空间感知', color: 'text-emerald-600', bg: 'bg-emerald-50' }
};

export default function TrainPage() {
  const [games, setGames] = useState<Game[]>(GAMES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // 加载游戏统计数据
    loadGameStats();
    checkSubscription();
  }, []);

  const loadGameStats = async () => {
    // 从本地存储或 API 加载游戏统计
    const stats = localStorage.getItem('gameStats');
    if (stats) {
      const parsedStats = JSON.parse(stats);
      setGames(games.map(game => ({
        ...game,
        stats: parsedStats[game.id] || game.stats
      })));
    }
  };

  const checkSubscription = async () => {
    // 检查订阅状态
    try {
      const res = await fetch('/api/pay/status');
      const data = await res.json();
      setIsSubscribed(!!data.entitlement);
    } catch (error) {
      console.error('检查订阅状态失败:', error);
    }
  };

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyLabel = (difficulty: number): string => {
    if (difficulty < 0.6) return '简单';
    if (difficulty < 1.2) return '中等';
    return '困难';
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty < 0.6) return 'text-growth-600';
    if (difficulty < 1.2) return 'text-genius-600';
    return 'text-fire-600';
  };

  return (
    <main className="p-4 pb-24 space-y-6">
      {/* 页面标题 */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          <span className="hero-gradient">训练中心</span>
        </h1>
        <p className="text-foreground/60">选择游戏，开始你的大脑训练之旅</p>
      </header>

      {/* 分类筛选 */}
      <section className="overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-genius-500 text-white'
                : 'bg-foreground/5 hover:bg-foreground/10'
            }`}
          >
            全部
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === key
                  ? `${info.bg} ${info.color}`
                  : 'bg-foreground/5 hover:bg-foreground/10'
              }`}
            >
              {info.name}
            </button>
          ))}
        </div>
      </section>

      {/* 游戏列表 */}
      <section className="grid gap-4">
        {filteredGames.map((game) => {
          const categoryInfo = CATEGORY_INFO[game.category];
          const isLocked = game.isPro && !isSubscribed;
          const isComingSoon = !game.stats && game.id !== 'tracklight' && game.id !== 'pairmaster' && game.id !== 'fastmatch';

          return (
            <div
              key={game.id}
              className={`
                game-card p-5 
                ${!isComingSoon && !isLocked ? 'card-interactive' : 'opacity-75'}
              `}
            >
              {/* 游戏信息 */}
              <div className="flex items-start gap-4">
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                  bg-gradient-to-br ${game.gradient}
                `}>
                  {game.icon}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {game.name}
                        {isLocked && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            Pro
                          </span>
                        )}
                        {isComingSoon && (
                          <span className="text-xs px-2 py-0.5 bg-foreground/10 text-foreground/60 rounded-full">
                            即将推出
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-foreground/60 mt-1">{game.description}</p>
                    </div>
                  </div>

                  {/* 游戏标签和统计 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo.bg} ${categoryInfo.color}`}>
                      {categoryInfo.name}
                    </span>
                    
                    {game.stats && (
                      <>
                        <span className="text-xs text-foreground/50">
                          最高分: {game.stats.highScore}
                        </span>
                        <span className="text-xs text-foreground/50">
                          准确率: {(game.stats.avgAccuracy * 100).toFixed(0)}%
                        </span>
                      </>
                    )}

                    {!isComingSoon && (
                      <span className={`text-xs ${getDifficultyColor(game.difficulty.current)}`}>
                        {getDifficultyLabel(game.difficulty.current)}
                      </span>
                    )}
                  </div>

                  {/* 进度条（如果有历史记录） */}
                  {game.stats && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-foreground/50 mb-1">
                        <span>进度</span>
                        <span>{game.stats.totalPlays} 次练习</span>
                      </div>
                      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${game.gradient} transition-all`}
                          style={{ width: `${Math.min(100, game.stats.totalPlays * 5)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2">
                  {isComingSoon ? (
                    <button
                      disabled
                      className="px-6 py-3 text-sm rounded-xl bg-foreground/10 text-foreground/50 cursor-not-allowed"
                    >
                      敬请期待
                    </button>
                  ) : isLocked ? (
                    <Link
                      href="/subscribe"
                      className="btn btn-primary px-6 py-3 text-sm whitespace-nowrap"
                    >
                      解锁 Pro
                    </Link>
                  ) : (
                    <Link
                      href={`/games/${game.id}`}
                      className={`
                        btn px-6 py-3 text-sm whitespace-nowrap
                        bg-gradient-to-r ${game.gradient} text-white
                      `}
                    >
                      开始训练
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 训练建议 */}
      <section className="card-interactive p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-lg">💡</span>
          训练建议
        </h3>
        <ul className="space-y-2 text-sm text-foreground/70">
          <li className="flex items-start gap-2">
            <span className="text-genius-500 mt-0.5">•</span>
            <span>每天坚持15-20分钟，效果最佳</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-wisdom-500 mt-0.5">•</span>
            <span>轮流练习不同类型的游戏，全面提升认知能力</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-fire-500 mt-0.5">•</span>
            <span>感到疲劳时及时休息，保持最佳状态</span>
          </li>
        </ul>
      </section>
    </main>
  );
}