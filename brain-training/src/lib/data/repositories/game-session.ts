/**
 * 游戏会话数据仓库
 * 
 * 管理所有游戏的历史记录
 */

import { BaseRepository } from './base';

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  category: 'attention' | 'memory' | 'speed' | 'logic' | 'spatial';
  
  // 游戏数据
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: number;
  duration: number;
  
  // 性能数据
  avgFps: number;
  minFps: number;
  maxFps: number;
  
  // 详细数据
  clickData: Array<{
    timestamp: number;
    x: number;
    y: number;
    correct: boolean;
    reactionTime: number;
  }>;
  
  // 改进建议
  improvements: string[];
  achievements: string[];
  
  // 时间戳
  startedAt: Date;
  endedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class GameSessionRepository extends BaseRepository<GameSession> {
  protected storageKey = 'brain-training:game-sessions';
  
  /**
   * 获取用户的游戏历史
   */
  async findByUserId(userId: string, options?: {
    gameId?: string;
    limit?: number;
    offset?: number;
  }): Promise<GameSession[]> {
    const query: any = { userId };
    
    if (options?.gameId) {
      query.gameId = options.gameId;
    }
    
    return this.findMany({
      where: query,
      orderBy: 'endedAt',
      orderDirection: 'desc',
      limit: options?.limit,
      offset: options?.offset
    });
  }
  
  /**
   * 获取用户在特定游戏的最高分
   */
  async getHighScore(userId: string, gameId: string): Promise<number> {
    const sessions = await this.findByUserId(userId, { gameId });
    
    if (sessions.length === 0) return 0;
    
    return Math.max(...sessions.map(s => s.score));
  }
  
  /**
   * 获取用户的游戏统计
   */
  async getUserStats(userId: string, gameId?: string): Promise<{
    totalGames: number;
    totalTime: number;
    avgScore: number;
    avgAccuracy: number;
    avgReactionTime: number;
    bestScore: number;
    worstScore: number;
    trend: 'improving' | 'stable' | 'declining';
  }> {
    const sessions = await this.findByUserId(userId, { gameId });
    
    if (sessions.length === 0) {
      return {
        totalGames: 0,
        totalTime: 0,
        avgScore: 0,
        avgAccuracy: 0,
        avgReactionTime: 0,
        bestScore: 0,
        worstScore: 0,
        trend: 'stable'
      };
    }
    
    const totalGames = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalGames;
    const avgAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalGames;
    const avgReactionTime = sessions.reduce((sum, s) => sum + s.reactionTime, 0) / totalGames;
    const bestScore = Math.max(...sessions.map(s => s.score));
    const worstScore = Math.min(...sessions.map(s => s.score));
    
    // 计算趋势（最近5场 vs 之前5场）
    const recent = sessions.slice(0, 5);
    const previous = sessions.slice(5, 10);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recent.length >= 3 && previous.length >= 3) {
      const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
      const previousAvg = previous.reduce((sum, s) => sum + s.score, 0) / previous.length;
      
      if (recentAvg > previousAvg * 1.1) {
        trend = 'improving';
      } else if (recentAvg < previousAvg * 0.9) {
        trend = 'declining';
      }
    }
    
    return {
      totalGames,
      totalTime,
      avgScore,
      avgAccuracy,
      avgReactionTime,
      bestScore,
      worstScore,
      trend
    };
  }
  
  /**
   * 获取每日游戏数据（用于图表）
   */
  async getDailyStats(userId: string, days: number = 30): Promise<Array<{
    date: string;
    games: number;
    avgScore: number;
    totalTime: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sessions = await this.findMany({
      where: { userId },
      orderBy: 'endedAt',
      orderDirection: 'asc'
    });
    
    // 按日期分组
    const dailyData = new Map<string, GameSession[]>();
    
    sessions.forEach(session => {
      const date = new Date(session.endedAt);
      if (date >= startDate && date <= endDate) {
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, []);
        }
        
        dailyData.get(dateKey)!.push(session);
      }
    });
    
    // 生成每日统计
    const result = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const daySessions = dailyData.get(dateKey) || [];
      
      result.push({
        date: dateKey,
        games: daySessions.length,
        avgScore: daySessions.length > 0
          ? daySessions.reduce((sum, s) => sum + s.score, 0) / daySessions.length
          : 0,
        totalTime: daySessions.reduce((sum, s) => sum + s.duration, 0)
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return result;
  }
  
  /**
   * 获取能力分布（用于雷达图）
   */
  async getAbilityDistribution(userId: string): Promise<{
    attention: number;
    memory: number;
    speed: number;
    logic: number;
    spatial: number;
  }> {
    const sessions = await this.findByUserId(userId);
    
    const categories = ['attention', 'memory', 'speed', 'logic', 'spatial'] as const;
    const abilities: Record<string, number> = {};
    
    for (const category of categories) {
      const categorySessions = sessions.filter(s => s.category === category);
      
      if (categorySessions.length === 0) {
        abilities[category] = 0;
      } else {
        // 综合考虑准确率和分数
        const avgAccuracy = categorySessions.reduce((sum, s) => sum + s.accuracy, 0) / categorySessions.length;
        const avgNormalizedScore = categorySessions.reduce((sum, s) => {
          // 假设每个游戏的满分是 10000
          return sum + (s.score / 10000);
        }, 0) / categorySessions.length;
        
        abilities[category] = (avgAccuracy * 0.6 + avgNormalizedScore * 0.4) * 100;
      }
    }
    
    return abilities as any;
  }
}

// 导出单例
export const gameSessionRepository = new GameSessionRepository();