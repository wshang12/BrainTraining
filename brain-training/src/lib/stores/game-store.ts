/**
 * 游戏状态管理
 * 
 * 集中管理游戏相关的所有状态
 */

import { create } from 'zustand';
import { gameSessionRepository, type GameSession } from '@/lib/data/repositories/game-session';
import type { GameResult } from '@/lib/game-engine/core';

interface GameState {
  // 当前游戏状态
  currentGame: {
    id: string;
    name: string;
    status: 'idle' | 'loading' | 'playing' | 'ended';
    startTime: number;
    session?: GameSession;
  } | null;
  
  // 游戏历史
  recentSessions: GameSession[];
  
  // 统计数据
  stats: {
    todayGames: number;
    todayTime: number;
    weekGames: number;
    weekTime: number;
    currentStreak: number;
    bestStreak: number;
  };
  
  // 能力评估
  abilities: {
    attention: number;
    memory: number;
    speed: number;
    logic: number;
    spatial: number;
    lastUpdated: Date | null;
  };
  
  // Actions
  startGame: (gameId: string, gameName: string) => void;
  endGame: (result: GameResult, userId: string) => Promise<void>;
  loadRecentSessions: (userId: string) => Promise<void>;
  loadStats: (userId: string) => Promise<void>;
  updateAbilities: (userId: string) => Promise<void>;
  clearGameState: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  currentGame: null,
  recentSessions: [],
  
  stats: {
    todayGames: 0,
    todayTime: 0,
    weekGames: 0,
    weekTime: 0,
    currentStreak: 0,
    bestStreak: 0
  },
  
  abilities: {
    attention: 0,
    memory: 0,
    speed: 0,
    logic: 0,
    spatial: 0,
    lastUpdated: null
  },
  
  // 开始游戏
  startGame: (gameId, gameName) => {
    set({
      currentGame: {
        id: gameId,
        name: gameName,
        status: 'loading',
        startTime: Date.now()
      }
    });
  },
  
  // 结束游戏
  endGame: async (result, userId) => {
    const currentGame = get().currentGame;
    if (!currentGame) return;
    
    try {
      // 创建游戏会话记录
      const session = await gameSessionRepository.create({
        userId,
        gameId: currentGame.id,
        gameName: currentGame.name,
        category: result.customData?.category || 'attention',
        score: result.score,
        accuracy: result.accuracy,
        reactionTime: result.averageReactionTime,
        difficulty: result.difficulty,
        duration: Date.now() - currentGame.startTime,
        avgFps: result.performanceData.fps,
        minFps: result.customData?.minFps || result.performanceData.fps,
        maxFps: result.customData?.maxFps || result.performanceData.fps,
        clickData: result.customData?.clickData || [],
        improvements: result.improvements,
        achievements: result.achievements || [],
        startedAt: new Date(currentGame.startTime),
        endedAt: new Date()
      } as any);
      
      // 更新当前游戏状态
      set((state) => ({
        currentGame: {
          ...state.currentGame!,
          status: 'ended',
          session
        }
      }));
      
      // 重新加载统计数据
      await get().loadStats(userId);
      await get().loadRecentSessions(userId);
      await get().updateAbilities(userId);
    } catch (error) {
      console.error('Failed to save game session:', error);
    }
  },
  
  // 加载最近的游戏记录
  loadRecentSessions: async (userId) => {
    try {
      const sessions = await gameSessionRepository.findByUserId(userId, { limit: 10 });
      set({ recentSessions: sessions });
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    }
  },
  
  // 加载统计数据
  loadStats: async (userId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      const allSessions = await gameSessionRepository.findByUserId(userId);
      
      // 今日统计
      const todaySessions = allSessions.filter(s => 
        new Date(s.endedAt) >= today
      );
      
      // 本周统计
      const weekSessions = allSessions.filter(s => 
        new Date(s.endedAt) >= weekAgo
      );
      
      // 连续天数计算
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      while (true) {
        const dayHasGame = allSessions.some(s => {
          const sessionDate = new Date(s.endedAt);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === checkDate.getTime();
        });
        
        if (dayHasGame) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      set({
        stats: {
          todayGames: todaySessions.length,
          todayTime: todaySessions.reduce((sum, s) => sum + s.duration, 0),
          weekGames: weekSessions.length,
          weekTime: weekSessions.reduce((sum, s) => sum + s.duration, 0),
          currentStreak,
          bestStreak: Math.max(currentStreak, get().stats.bestStreak)
        }
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },
  
  // 更新能力评估
  updateAbilities: async (userId) => {
    try {
      const abilities = await gameSessionRepository.getAbilityDistribution(userId);
      set({
        abilities: {
          ...abilities,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update abilities:', error);
    }
  },
  
  // 清除游戏状态
  clearGameState: () => {
    set({ currentGame: null });
  }
}));