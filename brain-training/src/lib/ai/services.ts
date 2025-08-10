/**
 * AI 服务层
 * 封装具体的 AI 功能
 */

import { aiClient } from './client';

export interface GamePerformance {
  gameId: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: number;
  timestamp: Date;
}

export interface UserProfile {
  userId: string;
  trainingDays: number;
  totalSessions: number;
  strengths: string[];
  weaknesses: string[];
  recentPerformances: GamePerformance[];
}

/**
 * AI 教练服务
 */
export class AICoachService {
  /**
   * 获取个性化训练建议
   */
  async getTrainingAdvice(profile: UserProfile): Promise<string> {
    const context = this.buildUserContext(profile);
    
    try {
      const response = await aiClient.chatCompletion({
        systemPromptType: 'coach',
        messages: [
          {
            role: 'user',
            content: `${context}\n\n请给我今天的训练建议。`
          }
        ],
        temperature: 0.8,
        maxTokens: 300
      });

      return response.content;
    } catch (error) {
      console.error('AI 教练服务错误:', error);
      return this.getFallbackAdvice(profile);
    }
  }

  /**
   * 分析游戏表现
   */
  async analyzePerformance(performance: GamePerformance, history: GamePerformance[]): Promise<string> {
    const analysis = this.performanceAnalysis(performance, history);
    
    try {
      const response = await aiClient.chatCompletion({
        systemPromptType: 'analyzer',
        messages: [
          {
            role: 'user',
            content: `刚刚完成的游戏表现：${JSON.stringify(analysis)}\n\n请分析我的表现并给出改进建议。`
          }
        ],
        temperature: 0.7,
        maxTokens: 400
      });

      return response.content;
    } catch (error) {
      console.error('AI 分析服务错误:', error);
      return this.getFallbackAnalysis(performance);
    }
  }

  /**
   * 获取激励消息
   */
  async getMotivation(context: { streak: number; improvement: boolean; timeOfDay: string }): Promise<string> {
    try {
      const response = await aiClient.chatCompletion({
        systemPromptType: 'motivator',
        messages: [
          {
            role: 'user',
            content: `连续训练${context.streak}天，${context.improvement ? '有进步' : '保持稳定'}，现在是${context.timeOfDay}。给我一句激励的话。`
          }
        ],
        temperature: 0.9,
        maxTokens: 100
      });

      return response.content;
    } catch (error) {
      console.error('AI 激励服务错误:', error);
      return this.getFallbackMotivation(context);
    }
  }

  /**
   * 实时对战指导
   */
  async getBattleCoaching(currentState: any): Promise<string> {
    try {
      const response = await aiClient.chatCompletion({
        messages: [
          {
            role: 'system',
            content: '你是一个游戏教练，需要给出简短、即时的战术建议。'
          },
          {
            role: 'user',
            content: `当前游戏状态：${JSON.stringify(currentState)}。请给出10字以内的建议。`
          }
        ],
        temperature: 0.5,
        maxTokens: 50
      });

      return response.content;
    } catch (error) {
      return '保持专注！';
    }
  }

  /**
   * 构建用户上下文
   */
  private buildUserContext(profile: UserProfile): string {
    const avgAccuracy = profile.recentPerformances.reduce((sum, p) => sum + p.accuracy, 0) / profile.recentPerformances.length || 0;
    const avgReactionTime = profile.recentPerformances.reduce((sum, p) => sum + p.reactionTime, 0) / profile.recentPerformances.length || 0;

    return `用户已训练${profile.trainingDays}天，完成${profile.totalSessions}次训练。
强项：${profile.strengths.join('、') || '待发现'}
弱项：${profile.weaknesses.join('、') || '待发现'}
最近平均准确率：${(avgAccuracy * 100).toFixed(1)}%
最近平均反应时间：${avgReactionTime.toFixed(0)}ms`;
  }

  /**
   * 表现分析数据
   */
  private performanceAnalysis(current: GamePerformance, history: GamePerformance[]) {
    const recentGames = history.filter(h => h.gameId === current.gameId).slice(-5);
    const avgScore = recentGames.reduce((sum, g) => sum + g.score, 0) / recentGames.length || 0;
    
    return {
      游戏: current.gameId,
      本次得分: current.score,
      历史平均: avgScore.toFixed(0),
      准确率: `${(current.accuracy * 100).toFixed(1)}%`,
      反应时间: `${current.reactionTime}ms`,
      难度等级: current.difficulty.toFixed(1),
      进步幅度: `${((current.score - avgScore) / avgScore * 100).toFixed(1)}%`
    };
  }

  /**
   * 降级方案：基于规则的建议
   */
  private getFallbackAdvice(profile: UserProfile): string {
    if (profile.trainingDays === 0) {
      return '欢迎开始大脑训练之旅！建议从"追光"游戏开始，这能帮助你提升专注力。每天坚持15分钟，4周后你会看到明显进步。';
    }

    if (profile.strengths.includes('记忆')) {
      return '你的记忆力表现出色！今天试试提高"配对大师"的难度，挑战6x6网格。同时别忘了练习反应速度。';
    }

    if (profile.weaknesses.includes('反应速度')) {
      return '反应速度是可以训练的！今天重点练习"快速匹配"，从慢速开始，逐渐提高速度。记住：准确比速度更重要。';
    }

    return '继续保持！建议今天尝试不同的游戏组合，全面锻炼认知能力。记得在疲劳时休息，保持最佳状态。';
  }

  /**
   * 降级方案：基于规则的分析
   */
  private getFallbackAnalysis(performance: GamePerformance): string {
    if (performance.accuracy > 0.9) {
      return '表现出色！你的准确率达到了90%以上。建议增加游戏难度，继续挑战自己的极限。';
    }

    if (performance.reactionTime < 500) {
      return '反应速度非常快！你的反应时间低于500毫秒，这说明你的大脑处理速度很棒。试试在保持速度的同时提高准确率。';
    }

    if (performance.accuracy < 0.7) {
      return '不要着急，准确率比速度更重要。建议降低难度，专注于每个决定的准确性。熟练后再逐步提升速度。';
    }

    return '表现稳定！你正在稳步提升。继续保持专注，注意观察模式，这会帮助你更快地做出正确判断。';
  }

  /**
   * 降级方案：预设激励语
   */
  private getFallbackMotivation(context: { streak: number; improvement: boolean; timeOfDay: string }): string {
    const motivations = {
      morning: [
        '新的一天，新的突破！',
        '晨练大脑，一天都充满活力！',
        '早起的鸟儿有虫吃，早练的大脑更聪明！'
      ],
      afternoon: [
        '午后正是大脑需要激活的时候！',
        '用游戏赶走午后的困倦吧！',
        '下午的挑战，让思维重新活跃起来！'
      ],
      evening: [
        '睡前练练脑，做个好梦！',
        '今天的最后一次提升机会！',
        '晚间训练，让大脑在睡眠中继续成长！'
      ]
    };

    const pool = motivations[context.timeOfDay as keyof typeof motivations] || motivations.morning;
    const base = pool[Math.floor(Math.random() * pool.length)];

    if (context.streak > 3) {
      return `连续${context.streak}天了，${base}`;
    }

    return base;
  }
}

// 导出服务实例
export const aiCoach = new AICoachService();