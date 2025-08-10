/**
 * 追光游戏引擎实现
 * 
 * 使用统一的游戏引擎架构重构，带来：
 * 1. 更好的性能监控
 * 2. 统一的生命周期管理
 * 3. 标准化的数据收集
 */

import { GameEngine, GameConfig, GameResult } from '../core';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isTarget: boolean;
  glowIntensity: number;
  id: string;
}

const COLORS = {
  target: '#ff3b30',    // 目标红色
  distractor: [         // 干扰色
    '#34c759',
    '#ffcc00', 
    '#0a84ff',
    '#ff9f0a',
    '#bf5af2'
  ]
};

export class TrackLightEngine extends GameEngine {
  private dots: Dot[] = [];
  private lastClickTime: number = 0;
  private clickPosition: { x: number; y: number } | null = null;
  private clickFeedback: { x: number; y: number; correct: boolean; opacity: number }[] = [];
  
  // 游戏参数（基于难度动态调整）
  private targetCount: number = 1;
  private distractorCount: number = 10;
  private dotSpeed: number = 100;
  private dotRadius: number = 12;

  constructor() {
    super({
      id: 'tracklight',
      name: '专注追光',
      category: 'attention',
      minDuration: 20000,
      maxDuration: 60000,
      targetFPS: 60
    });
  }

  protected async loadResources(): Promise<void> {
    // 追光游戏无需加载额外资源
    return Promise.resolve();
  }

  protected setupEventListeners(): void {
    if (!this.canvas) return;
    
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('touchstart', this.handleTouch);
  }

  protected removeEventListeners(): void {
    if (!this.canvas) return;
    
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleTouch);
  }

  protected onGameStart(): void {
    // 根据难度计算游戏参数
    this.updateGameParameters();
    
    // 初始化点
    this.initializeDots();
    
    // 重置状态
    this.lastClickTime = performance.now();
    this.clickFeedback = [];
  }

  protected onGameEnd(result: GameResult): void {
    // 清理资源
    this.dots = [];
    this.clickFeedback = [];
  }

  protected shouldEndGame(): boolean {
    // 基于时间限制
    return this.state.timeElapsed >= this.config.maxDuration;
  }

  private updateGameParameters(): void {
    const diff = this.state.difficulty;
    
    // 目标数量：1-3个
    this.targetCount = Math.floor(1 + diff * 2);
    
    // 干扰物数量：5-25个
    this.distractorCount = Math.floor(5 + diff * 20);
    
    // 移动速度：50-200 像素/秒
    this.dotSpeed = 50 + diff * 150;
    
    // 点大小：15-10 像素（难度越高越小）
    this.dotRadius = 15 - diff * 5;
  }

  private initializeDots(): void {
    this.dots = [];
    
    // 创建目标点
    for (let i = 0; i < this.targetCount; i++) {
      this.dots.push(this.createDot(true));
    }
    
    // 创建干扰点
    for (let i = 0; i < this.distractorCount; i++) {
      this.dots.push(this.createDot(false));
    }
  }

  private createDot(isTarget: boolean): Dot {
    if (!this.canvas) throw new Error('Canvas not initialized');
    
    const angle = Math.random() * Math.PI * 2;
    const speed = this.dotSpeed * (0.8 + Math.random() * 0.4); // ±20% 速度变化
    
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: this.dotRadius,
      color: isTarget ? COLORS.target : COLORS.distractor[Math.floor(Math.random() * COLORS.distractor.length)],
      isTarget,
      glowIntensity: 0,
      id: Math.random().toString(36).substr(2, 9)
    };
  }

  protected update(deltaTime: number): void {
    if (!this.canvas) return;
    
    const dt = deltaTime / 1000; // 转换为秒
    
    // 更新点的位置
    this.dots.forEach(dot => {
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      
      // 边界碰撞检测
      if (dot.x - dot.radius < 0 || dot.x + dot.radius > this.canvas!.width) {
        dot.vx *= -1;
        dot.x = Math.max(dot.radius, Math.min(this.canvas!.width - dot.radius, dot.x));
      }
      
      if (dot.y - dot.radius < 0 || dot.y + dot.radius > this.canvas!.height) {
        dot.vy *= -1;
        dot.y = Math.max(dot.radius, Math.min(this.canvas!.height - dot.radius, dot.y));
      }
      
      // 目标点发光效果
      if (dot.isTarget) {
        dot.glowIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
      }
    });
    
    // 更新点击反馈动画
    this.clickFeedback = this.clickFeedback.filter(feedback => {
      feedback.opacity -= dt * 2; // 0.5秒淡出
      return feedback.opacity > 0;
    });
    
    // 动态难度调整
    if (this.state.timeElapsed > 10000) { // 10秒后开始调整
      const performanceRatio = this.state.accuracy;
      if (performanceRatio > 0.9 && this.state.difficulty < 0.9) {
        this.adjustDifficulty(0.01 * dt);
        this.updateGameParameters();
      } else if (performanceRatio < 0.6 && this.state.difficulty > 0.1) {
        this.adjustDifficulty(-0.01 * dt);
        this.updateGameParameters();
      }
    }
  }

  protected render(): void {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    
    // 清空画布
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制点
    this.dots.forEach(dot => {
      ctx.save();
      
      // 目标点光晕效果
      if (dot.isTarget && dot.glowIntensity > 0) {
        ctx.shadowBlur = 20 + dot.glowIntensity * 10;
        ctx.shadowColor = dot.color;
      }
      
      // 绘制点
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.fill();
      
      // 内部高光
      ctx.beginPath();
      ctx.arc(dot.x - dot.radius * 0.3, dot.y - dot.radius * 0.3, dot.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      
      ctx.restore();
    });
    
    // 绘制点击反馈
    this.clickFeedback.forEach(feedback => {
      ctx.save();
      ctx.globalAlpha = feedback.opacity;
      
      ctx.beginPath();
      ctx.arc(feedback.x, feedback.y, 30, 0, Math.PI * 2);
      ctx.strokeStyle = feedback.correct ? '#34c759' : '#ff3b30';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 正确/错误图标
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = feedback.correct ? '#34c759' : '#ff3b30';
      ctx.fillText(feedback.correct ? '✓' : '✗', feedback.x, feedback.y);
      
      ctx.restore();
    });
    
    // 绘制游戏信息
    this.renderGameInfo();
  }

  private renderGameInfo(): void {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    ctx.save();
    
    // 背景面板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(10, 10, 200, 80);
    
    // 文字样式
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    
    // 分数
    ctx.fillText(`分数: ${this.state.score}`, 20, 30);
    
    // 准确率
    ctx.fillText(`准确率: ${(this.state.accuracy * 100).toFixed(0)}%`, 20, 50);
    
    // 难度
    ctx.fillText(`难度: ${(this.state.difficulty * 100).toFixed(0)}%`, 20, 70);
    
    // 剩余时间
    const remainingTime = Math.max(0, this.config.maxDuration - this.state.timeElapsed) / 1000;
    ctx.fillText(`时间: ${remainingTime.toFixed(1)}s`, 120, 30);
    
    ctx.restore();
  }

  private handleClick = (e: MouseEvent): void => {
    if (this.state.status !== 'playing') return;
    
    const rect = this.canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.processClick(x, y);
  };

  private handleTouch = (e: TouchEvent): void => {
    if (this.state.status !== 'playing') return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas!.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.processClick(x, y);
  };

  private processClick(x: number, y: number): void {
    const clickTime = performance.now();
    const reactionTime = clickTime - this.lastClickTime;
    this.lastClickTime = clickTime;
    
    // 检查是否点击了目标
    let hitTarget = false;
    let hitAny = false;
    
    for (const dot of this.dots) {
      const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
      
      if (distance <= dot.radius + 5) { // 5像素容差
        hitAny = true;
        
        if (dot.isTarget) {
          hitTarget = true;
          
          // 记录反应时间
          this.recordReactionTime(reactionTime);
          
          // 更新分数
          const speedBonus = Math.max(0, 1000 - reactionTime) / 10;
          const difficultyBonus = this.state.difficulty * 50;
          const score = Math.round(100 + speedBonus + difficultyBonus);
          this.updateScore(score);
          
          // 重新生成这个点
          const newDot = this.createDot(true);
          dot.x = newDot.x;
          dot.y = newDot.y;
          dot.vx = newDot.vx;
          dot.vy = newDot.vy;
          
          // 添加正确反馈
          this.clickFeedback.push({ x, y, correct: true, opacity: 1 });
        }
        
        break;
      }
    }
    
    // 更新准确率
    this.updateAccuracy(hitTarget);
    
    // 如果没有点击到任何东西或点击了错误的点
    if (!hitTarget) {
      this.clickFeedback.push({ x, y, correct: false, opacity: 1 });
      
      // 错误惩罚
      this.updateScore(-50);
    }
  }
}