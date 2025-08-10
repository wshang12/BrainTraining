/**
 * 成就系统
 * 激励用户持续训练，创造成就感
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'skill' | 'dedication' | 'exploration' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  condition: AchievementCondition;
  unlockedAt?: Date;
  progress?: number;
}

export interface AchievementCondition {
  type: 'count' | 'streak' | 'score' | 'accuracy' | 'speed' | 'special';
  target: number;
  gameId?: string;
  params?: Record<string, any>;
}

// 成就定义
export const ACHIEVEMENTS: Achievement[] = [
  // 里程碑成就
  {
    id: 'first_step',
    name: '初次尝试',
    description: '完成你的第一个游戏',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    points: 10,
    condition: { type: 'count', target: 1 }
  },
  {
    id: 'getting_started',
    name: '新手上路',
    description: '完成10个游戏',
    icon: '🚀',
    category: 'milestone',
    rarity: 'common',
    points: 20,
    condition: { type: 'count', target: 10 }
  },
  {
    id: 'centurion',
    name: '百战勇士',
    description: '完成100个游戏',
    icon: '💯',
    category: 'milestone',
    rarity: 'rare',
    points: 50,
    condition: { type: 'count', target: 100 }
  },
  {
    id: 'master_trainer',
    name: '训练大师',
    description: '完成1000个游戏',
    icon: '🏆',
    category: 'milestone',
    rarity: 'epic',
    points: 100,
    condition: { type: 'count', target: 1000 }
  },

  // 连续训练成就
  {
    id: 'week_warrior',
    name: '周末战士',
    description: '连续训练7天',
    icon: '🔥',
    category: 'dedication',
    rarity: 'common',
    points: 30,
    condition: { type: 'streak', target: 7 }
  },
  {
    id: 'monthly_master',
    name: '月度达人',
    description: '连续训练30天',
    icon: '📅',
    category: 'dedication',
    rarity: 'rare',
    points: 80,
    condition: { type: 'streak', target: 30 }
  },
  {
    id: 'yearly_legend',
    name: '年度传奇',
    description: '连续训练365天',
    icon: '👑',
    category: 'dedication',
    rarity: 'legendary',
    points: 500,
    condition: { type: 'streak', target: 365 }
  },

  // 技能成就
  {
    id: 'sharp_eye',
    name: '鹰眼',
    description: '在追光游戏中达到90%准确率',
    icon: '👁️',
    category: 'skill',
    rarity: 'rare',
    points: 40,
    condition: { type: 'accuracy', target: 0.9, gameId: 'tracklight' }
  },
  {
    id: 'memory_palace',
    name: '记忆宫殿',
    description: '在配对大师6x6模式中无错误完成',
    icon: '🧠',
    category: 'skill',
    rarity: 'epic',
    points: 60,
    condition: { type: 'special', target: 1, gameId: 'pairmaster', params: { gridSize: 36, mistakes: 0 } }
  },
  {
    id: 'lightning_fast',
    name: '闪电侠',
    description: '在快速匹配中平均反应时间低于300ms',
    icon: '⚡',
    category: 'skill',
    rarity: 'epic',
    points: 70,
    condition: { type: 'speed', target: 300, gameId: 'fastmatch' }
  },

  // 探索成就
  {
    id: 'curious_mind',
    name: '好奇心',
    description: '尝试所有类型的游戏',
    icon: '🔍',
    category: 'exploration',
    rarity: 'common',
    points: 25,
    condition: { type: 'special', target: 5, params: { uniqueGames: 5 } }
  },
  {
    id: 'night_owl',
    name: '夜猫子',
    description: '在凌晨2点到5点之间训练',
    icon: '🦉',
    category: 'exploration',
    rarity: 'rare',
    points: 30,
    condition: { type: 'special', target: 1, params: { timeRange: '02:00-05:00' } }
  },
  {
    id: 'early_bird',
    name: '早起鸟',
    description: '在早上5点到7点之间训练',
    icon: '🐦',
    category: 'exploration',
    rarity: 'rare',
    points: 30,
    condition: { type: 'special', target: 1, params: { timeRange: '05:00-07:00' } }
  },

  // 社交成就
  {
    id: 'friendly_rival',
    name: '友好对手',
    description: '完成10场对战',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    points: 20,
    condition: { type: 'count', target: 10, params: { mode: 'battle' } }
  },
  {
    id: 'top_performer',
    name: '榜上有名',
    description: '进入任意排行榜前10名',
    icon: '🥇',
    category: 'social',
    rarity: 'rare',
    points: 50,
    condition: { type: 'special', target: 1, params: { leaderboardRank: 10 } }
  }
];

/**
 * 成就管理器
 */
export class AchievementManager {
  private achievements: Map<string, Achievement>;
  private userProgress: Map<string, any>;

  constructor() {
    this.achievements = new Map(ACHIEVEMENTS.map(a => [a.id, { ...a }]));
    this.loadUserProgress();
  }

  /**
   * 加载用户进度
   */
  private loadUserProgress(): void {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('achievementProgress');
    if (saved) {
      this.userProgress = new Map(Object.entries(JSON.parse(saved)));
    } else {
      this.userProgress = new Map();
    }
  }

  /**
   * 保存用户进度
   */
  private saveUserProgress(): void {
    if (typeof window === 'undefined') return;
    
    const progress = Object.fromEntries(this.userProgress);
    localStorage.setItem('achievementProgress', JSON.stringify(progress));
  }

  /**
   * 检查并更新成就进度
   */
  checkAchievements(event: {
    type: 'game_complete' | 'streak_update' | 'battle_complete' | 'profile_update';
    gameId?: string;
    score?: number;
    accuracy?: number;
    reactionTime?: number;
    streak?: number;
    data?: any;
  }): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (achievement.unlockedAt) return; // 已解锁

      const progress = this.checkCondition(achievement.condition, event);
      
      if (progress >= 1) {
        // 解锁成就！
        achievement.unlockedAt = new Date();
        achievement.progress = 1;
        newlyUnlocked.push(achievement);
        
        // 播放解锁动画和声音
        this.celebrateUnlock(achievement);
      } else if (progress > (achievement.progress || 0)) {
        // 更新进度
        achievement.progress = progress;
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveUserProgress();
    }

    return newlyUnlocked;
  }

  /**
   * 检查条件进度
   */
  private checkCondition(condition: AchievementCondition, event: any): number {
    const key = `${condition.type}_${condition.gameId || 'global'}`;
    let currentValue = this.userProgress.get(key) || 0;

    switch (condition.type) {
      case 'count':
        if (event.type === 'game_complete' && (!condition.gameId || condition.gameId === event.gameId)) {
          currentValue++;
          this.userProgress.set(key, currentValue);
        }
        return Math.min(1, currentValue / condition.target);

      case 'streak':
        if (event.type === 'streak_update' && event.streak) {
          return Math.min(1, event.streak / condition.target);
        }
        break;

      case 'accuracy':
        if (event.type === 'game_complete' && event.gameId === condition.gameId && event.accuracy) {
          return event.accuracy >= condition.target ? 1 : event.accuracy / condition.target;
        }
        break;

      case 'speed':
        if (event.type === 'game_complete' && event.gameId === condition.gameId && event.reactionTime) {
          return event.reactionTime <= condition.target ? 1 : condition.target / event.reactionTime;
        }
        break;

      case 'score':
        if (event.type === 'game_complete' && event.gameId === condition.gameId && event.score) {
          const highScore = Math.max(currentValue, event.score);
          this.userProgress.set(key, highScore);
          return Math.min(1, highScore / condition.target);
        }
        break;

      case 'special':
        // 特殊条件需要自定义逻辑
        return this.checkSpecialCondition(condition, event);
    }

    return 0;
  }

  /**
   * 检查特殊条件
   */
  private checkSpecialCondition(condition: AchievementCondition, event: any): number {
    // 这里处理各种特殊成就条件
    if (condition.params?.timeRange) {
      const now = new Date();
      const hour = now.getHours();
      const [start, end] = condition.params.timeRange.split('-').map((t: string) => parseInt(t));
      
      if (hour >= start && hour < end) {
        return 1;
      }
    }

    // 其他特殊条件...
    return 0;
  }

  /**
   * 庆祝解锁
   */
  private celebrateUnlock(achievement: Achievement): void {
    // 显示解锁通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 成就解锁！', {
        body: `${achievement.name}: ${achievement.description}`,
        icon: '/icons/icon-192.png'
      });
    }

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('achievementUnlocked', {
      detail: achievement
    }));
  }

  /**
   * 获取所有成就
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * 获取已解锁的成就
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlockedAt);
  }

  /**
   * 获取成就统计
   */
  getStats(): {
    total: number;
    unlocked: number;
    points: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
  } {
    const all = this.getAllAchievements();
    const unlocked = this.getUnlockedAchievements();

    const stats = {
      total: all.length,
      unlocked: unlocked.length,
      points: unlocked.reduce((sum, a) => sum + a.points, 0),
      byCategory: {} as Record<string, number>,
      byRarity: {} as Record<string, number>
    };

    unlocked.forEach(a => {
      stats.byCategory[a.category] = (stats.byCategory[a.category] || 0) + 1;
      stats.byRarity[a.rarity] = (stats.byRarity[a.rarity] || 0) + 1;
    });

    return stats;
  }
}

// 导出单例
export const achievementManager = new AchievementManager();