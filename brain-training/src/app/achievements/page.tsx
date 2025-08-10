"use client";
import { useState, useEffect } from "react";
import { achievementManager, Achievement } from "@/lib/achievements";
import Link from "next/link";

const CATEGORY_META = {
  milestone: { name: '里程碑', icon: '🏆', color: 'from-amber-400 to-amber-600' },
  skill: { name: '技能', icon: '⭐', color: 'from-genius-400 to-genius-600' },
  dedication: { name: '坚持', icon: '🔥', color: 'from-fire-400 to-fire-600' },
  exploration: { name: '探索', icon: '🔍', color: 'from-purple-400 to-purple-600' },
  social: { name: '社交', icon: '👥', color: 'from-wisdom-400 to-wisdom-600' }
};

const RARITY_META = {
  common: { name: '普通', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
  rare: { name: '稀有', color: 'text-genius-600', bg: 'bg-genius-100 dark:bg-genius-900/20' },
  epic: { name: '史诗', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  legendary: { name: '传说', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' }
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    const all = achievementManager.getAllAchievements();
    setAchievements(all);
    setStats(achievementManager.getStats());
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const getProgressPercentage = (achievement: Achievement): number => {
    return (achievement.progress || 0) * 100;
  };

  return (
    <main className="min-h-screen pb-24">
      {/* 头部统计 */}
      <div className="bg-gradient-to-br from-genius-500 to-wisdom-600 text-white p-6">
        <Link href="/me" className="inline-flex items-center gap-2 text-white/80 mb-4">
          ← 返回
        </Link>
        
        <h1 className="text-3xl font-bold mb-4">成就系统</h1>
        
        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.unlocked}</div>
              <div className="text-sm text-white/80">已解锁</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-white/80">总成就</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.points}</div>
              <div className="text-sm text-white/80">成就点</div>
            </div>
          </div>
        )}
        
        {/* 进度条 */}
        {stats && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>总体进度</span>
              <span>{Math.round((stats.unlocked / stats.total) * 100)}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 分类筛选 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-genius-500 text-white'
                : 'bg-foreground/5 hover:bg-foreground/10'
            }`}
          >
            全部
          </button>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === key
                  ? 'bg-gradient-to-r text-white ' + meta.color
                  : 'bg-foreground/5 hover:bg-foreground/10'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 成就列表 */}
      <div className="p-4 space-y-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = !!achievement.unlockedAt;
          const progress = getProgressPercentage(achievement);
          const categoryMeta = CATEGORY_META[achievement.category];
          const rarityMeta = RARITY_META[achievement.rarity];

          return (
            <div
              key={achievement.id}
              className={`
                card-interactive p-5 space-y-3 transition-all
                ${isUnlocked ? '' : 'opacity-75'}
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                  ${isUnlocked 
                    ? `bg-gradient-to-br ${categoryMeta.color}` 
                    : 'bg-foreground/10'
                  }
                `}>
                  {achievement.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rarityMeta.bg} ${rarityMeta.color}`}>
                      {rarityMeta.name}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/60">{achievement.description}</p>
                  
                  {/* 进度条 */}
                  {!isUnlocked && progress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-foreground/50 mb-1">
                        <span>进度</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${categoryMeta.color} transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 解锁时间 */}
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-foreground/50 mt-2">
                      解锁于 {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* 成就点数 */}
                <div className="text-center">
                  <div className="text-lg font-bold text-genius-600">
                    {achievement.points}
                  </div>
                  <div className="text-xs text-foreground/50">点数</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🎯</span>
          <p className="text-foreground/60">该分类暂无成就</p>
        </div>
      )}
    </main>
  );
}