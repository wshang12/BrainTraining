"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { achievementManager, Achievement } from "@/lib/achievements";
import { aiCoach } from "@/lib/ai/services";
import type { GamePerformance } from "@/lib/ai/services";

interface GameResultProps {
  gameId: string;
  gameName: string;
  score: number;
  accuracy: number;
  reactionTime?: number;
  difficulty: number;
  personalBest?: number;
  onPlayAgain: () => void;
  extraStats?: Record<string, any>;
}

export default function GameResult({
  gameId,
  gameName,
  score,
  accuracy,
  reactionTime,
  difficulty,
  personalBest,
  onPlayAgain,
  extraStats
}: GameResultProps) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 检查成就
    const achievements = achievementManager.checkAchievements({
      type: 'game_complete',
      gameId,
      score,
      accuracy,
      reactionTime,
      data: extraStats
    });
    setUnlockedAchievements(achievements);

    // 获取 AI 分析
    analyzePerformance();

    // 保存游戏统计
    saveGameStats();
  }, []);

  const analyzePerformance = async () => {
    try {
      const performance: GamePerformance = {
        gameId,
        score,
        accuracy,
        reactionTime: reactionTime || 1000,
        difficulty,
        timestamp: new Date()
      };

      // 获取历史数据（简化版）
      const history: GamePerformance[] = [performance];

      const analysis = await aiCoach.analyzePerformance(performance, history);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI 分析失败:', error);
      setAiAnalysis(getDefaultAnalysis());
    } finally {
      setAnalyzing(false);
    }
  };

  const saveGameStats = () => {
    const stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
    
    if (!stats[gameId]) {
      stats[gameId] = {
        highScore: score,
        lastPlayed: new Date(),
        totalPlays: 1,
        avgAccuracy: accuracy
      };
    } else {
      stats[gameId].highScore = Math.max(stats[gameId].highScore, score);
      stats[gameId].lastPlayed = new Date();
      stats[gameId].totalPlays++;
      stats[gameId].avgAccuracy = (stats[gameId].avgAccuracy * (stats[gameId].totalPlays - 1) + accuracy) / stats[gameId].totalPlays;
    }

    localStorage.setItem('gameStats', JSON.stringify(stats));
  };

  const getDefaultAnalysis = (): string => {
    if (accuracy > 0.9) {
      return "出色的表现！你的准确率非常高，说明专注力很棒。试试提高游戏难度来挑战自己。";
    } else if (accuracy > 0.7) {
      return "不错的成绩！保持这个水平，逐步提高准确率。记住，准确比速度更重要。";
    } else {
      return "继续加油！建议降低难度，先专注于提高准确率。熟练后再追求速度。";
    }
  };

  const getRatingStars = (): number => {
    if (accuracy >= 0.95 && (!personalBest || score > personalBest)) return 3;
    if (accuracy >= 0.85) return 2;
    if (accuracy >= 0.70) return 1;
    return 0;
  };

  const stars = getRatingStars();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden animate-float">
        {/* 结果头部 */}
        <div className={`
          p-6 text-center text-white
          ${stars === 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
            stars === 2 ? 'bg-gradient-to-br from-genius-400 to-genius-600' :
            stars === 1 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
            'bg-gradient-to-br from-gray-400 to-gray-600'}
        `}>
          <h2 className="text-2xl font-bold mb-2">
            {stars === 3 ? '完美表现！' :
             stars === 2 ? '表现出色！' :
             stars === 1 ? '继续努力！' :
             '再接再厉！'}
          </h2>
          
          {/* 星级评价 */}
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`text-3xl ${i <= stars ? 'opacity-100' : 'opacity-30'}`}>
                ⭐
              </span>
            ))}
          </div>

          {/* 分数展示 */}
          <div className="text-5xl font-bold mb-1">{score}</div>
          <div className="text-white/80 text-sm">
            {personalBest && score > personalBest && '新纪录！'}
          </div>
        </div>

        {/* 详细数据 */}
        <div className="p-6 space-y-4">
          {/* 核心指标 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-foreground/5">
              <div className="text-2xl font-bold text-genius-600">
                {(accuracy * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-foreground/60">准确率</div>
            </div>
            {reactionTime && (
              <div className="text-center p-3 rounded-xl bg-foreground/5">
                <div className="text-2xl font-bold text-fire-600">
                  {reactionTime}ms
                </div>
                <div className="text-sm text-foreground/60">反应时间</div>
              </div>
            )}
          </div>

          {/* 成就解锁 */}
          {unlockedAchievements.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 space-y-2">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                🎉 解锁 {unlockedAchievements.length} 个成就！
              </h3>
              {unlockedAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-xs text-foreground/60">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI 分析 */}
          <div className="space-y-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
            >
              <span className="font-medium">AI 教练分析</span>
              <span className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showDetails && (
              <div className="p-4 rounded-xl bg-genius-50 dark:bg-genius-900/20">
                {analyzing ? (
                  <div className="flex items-center gap-2 text-genius-600">
                    <div className="w-4 h-4 border-2 border-genius-600 border-t-transparent rounded-full animate-spin" />
                    <span>分析中...</span>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{aiAnalysis}</p>
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onPlayAgain}
              className="btn btn-primary py-3"
            >
              再来一局
            </button>
            <Link
              href="/today"
              className="btn py-3 bg-foreground/10 text-center"
            >
              返回首页
            </Link>
          </div>

          {/* 分享按钮 */}
          <button className="w-full py-3 text-sm text-genius-600 hover:text-genius-700">
            分享成绩 →
          </button>
        </div>
      </div>
    </div>
  );
}