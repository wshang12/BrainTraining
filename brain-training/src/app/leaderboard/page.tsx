"use client";
import { useEffect, useState } from "react";
import { cloudinary } from "@/lib/cloudinary";
import { mockAuth } from "@/lib/auth";

type LeaderboardEntry = {
  rank: number;
  uid: string;
  name: string;
  avatar: string;
  score: number;
  level: number;
  change: 'up' | 'down' | 'same' | 'new';
};

type LeaderboardType = 'weekly' | 'monthly' | 'allTime' | 'friends';

const MOCK_USERS = [
  { uid: 'ai_001', name: '智慧大师', avatar: 'master', score: 12580, level: 15, change: 'same' as const },
  { uid: 'ai_002', name: '记忆专家', avatar: 'expert', score: 11200, level: 14, change: 'up' as const },
  { uid: 'ai_003', name: '反应之王', avatar: 'king', score: 10890, level: 13, change: 'down' as const },
  { uid: 'ai_004', name: '逻辑达人', avatar: 'logic', score: 9760, level: 12, change: 'up' as const },
  { uid: 'ai_005', name: '专注高手', avatar: 'focus', score: 8920, level: 11, change: 'new' as const },
  { uid: 'ai_006', name: '训练新秀', avatar: 'rookie', score: 7650, level: 10, change: 'up' as const },
  { uid: 'ai_007', name: '思维战士', avatar: 'warrior', score: 6890, level: 9, change: 'same' as const },
  { uid: 'ai_008', name: '大脑教练', avatar: 'coach', score: 5920, level: 8, change: 'down' as const },
  { uid: 'ai_009', name: '认知探索者', avatar: 'explorer', score: 4870, level: 7, change: 'new' as const },
  { uid: 'ai_010', name: '潜力之星', avatar: 'star', score: 3920, level: 6, change: 'up' as const },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadLeaderboard();
    const user = mockAuth.getCurrentUser();
    setCurrentUser(user);
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 根据不同榜单类型调整分数
      const multiplier = activeTab === 'weekly' ? 1 : 
                        activeTab === 'monthly' ? 3 : 
                        activeTab === 'allTime' ? 10 : 0.8;
      
      const mockEntries = MOCK_USERS.map((user, index) => ({
        rank: index + 1,
        uid: user.uid,
        name: user.name,
        avatar: cloudinary.getAvatarUrl(user.avatar, 60),
        score: Math.floor(user.score * multiplier),
        level: user.level,
        change: user.change
      }));

      // 如果用户已登录，添加到排行榜
      const currentUser = mockAuth.getCurrentUser();
      if (currentUser) {
        const userScore = Math.floor(2500 * multiplier);
        const userEntry: LeaderboardEntry = {
          rank: 15,
          uid: currentUser.id,
          name: currentUser.name,
          avatar: cloudinary.getAvatarUrl(currentUser.id, 60),
          score: userScore,
          level: currentUser.metadata?.level || 1,
          change: 'new'
        };
        
        // 插入到合适的位置
        const insertIndex = mockEntries.findIndex(e => e.score < userScore);
        if (insertIndex !== -1) {
          mockEntries.splice(insertIndex, 0, userEntry);
          // 重新计算排名
          mockEntries.forEach((entry, index) => {
            entry.rank = index + 1;
          });
          setUserRank(insertIndex + 1);
        } else {
          mockEntries.push(userEntry);
          setUserRank(mockEntries.length);
        }
      }

      setEntries(activeTab === 'friends' ? mockEntries.slice(0, 5) : mockEntries.slice(0, 10));
    } catch (error) {
      console.error('加载排行榜失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTabConfig = () => {
    return [
      { key: 'weekly' as const, label: '本周', icon: '📅' },
      { key: 'monthly' as const, label: '本月', icon: '📆' },
      { key: 'allTime' as const, label: '总榜', icon: '🏆' },
      { key: 'friends' as const, label: '好友', icon: '👥' }
    ];
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-amber-500' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600' };
    return { icon: rank.toString(), color: 'text-foreground/60' };
  };

  const getChangeIcon = (change: LeaderboardEntry['change']) => {
    switch (change) {
      case 'up': return <span className="text-growth-500">↑</span>;
      case 'down': return <span className="text-fire-500">↓</span>;
      case 'new': return <span className="text-genius-500">★</span>;
      default: return <span className="text-foreground/30">—</span>;
    }
  };

  return (
    <main className="min-h-screen pb-24">
      {/* 顶部背景渐变 */}
      <div className="relative h-48 bg-gradient-to-br from-genius-400 via-wisdom-500 to-fire-500">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-4 pt-8 text-white">
          <h1 className="text-3xl font-bold mb-2">排行榜</h1>
          <p className="text-white/80">与全球玩家一较高下</p>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex p-2 max-w-2xl mx-auto">
          {getTabConfig().map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all
                ${activeTab === tab.key 
                  ? 'bg-genius-500 text-white shadow-lg' 
                  : 'text-foreground/60 hover:bg-foreground/5'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 排行榜内容 */}
      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const isCurrentUser = currentUser && entry.uid === currentUser.id;
              const rankDisplay = getRankDisplay(entry.rank);
              
              return (
                <div
                  key={entry.uid}
                  className={`
                    card-interactive p-4 flex items-center gap-4
                    ${isCurrentUser ? 'ring-2 ring-genius-500 bg-genius-50 dark:bg-genius-900/20' : ''}
                    ${index === 0 ? 'animate-glow' : ''}
                  `}
                >
                  {/* 排名 */}
                  <div className={`w-10 text-center font-bold text-lg ${rankDisplay.color}`}>
                    {rankDisplay.icon}
                  </div>

                  {/* 变化指示器 */}
                  <div className="w-4">
                    {getChangeIcon(entry.change)}
                  </div>

                  {/* 用户信息 */}
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {entry.name}
                      {isCurrentUser && <span className="text-xs text-genius-600">(你)</span>}
                    </div>
                    <div className="text-sm text-foreground/60">
                      Lv.{entry.level}
                    </div>
                  </div>

                  {/* 分数 */}
                  <div className="text-right">
                    <div className="font-bold text-lg">{entry.score.toLocaleString()}</div>
                    <div className="text-xs text-foreground/50">积分</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 用户排名提示 */}
        {userRank && userRank > 10 && (
          <div className="mt-6 p-4 rounded-xl bg-genius-50 dark:bg-genius-900/20 text-center">
            <p className="text-sm text-genius-700 dark:text-genius-400">
              你的排名：第 {userRank} 名
            </p>
            <p className="text-xs text-foreground/60 mt-1">
              继续努力，冲击前十！
            </p>
          </div>
        )}

        {/* 统计信息 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-genius-600">
              {entries.length > 0 ? entries[0].score.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-foreground/60">最高分</div>
          </div>
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-wisdom-600">
              {entries.length}
            </div>
            <div className="text-xs text-foreground/60">参与人数</div>
          </div>
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-fire-600">
              {Math.floor(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)}
            </div>
            <div className="text-xs text-foreground/60">平均分</div>
          </div>
        </div>

        {/* 激励文案 */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-genius-100 to-wisdom-100 dark:from-genius-900/20 dark:to-wisdom-900/20 text-center space-y-2">
          <h3 className="font-semibold text-lg">挑战自我，超越极限</h3>
          <p className="text-sm text-foreground/70">
            每天坚持训练，你也能登上榜首！
          </p>
          {!currentUser && (
            <a 
              href="/me" 
              className="inline-block mt-3 px-6 py-2 bg-genius-500 text-white rounded-lg font-medium"
            >
              登录参与排名
            </a>
          )}
        </div>
      </div>
    </main>
  );
}