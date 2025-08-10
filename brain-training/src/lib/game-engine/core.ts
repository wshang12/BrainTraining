/**
 * 游戏引擎核心
 * 
 * 这不是一个简单的基类，而是一个完整的游戏运行时环境
 * 它管理着游戏的生命周期、性能监控、数据收集和状态同步
 */

import { EventEmitter } from 'events';

export interface GameConfig {
  id: string;
  name: string;
  category: 'attention' | 'memory' | 'speed' | 'logic' | 'spatial';
  minDuration: number; // 最短游戏时长（毫秒）
  maxDuration: number; // 最长游戏时长
  targetFPS?: number; // 目标帧率，默认 60
}

export interface GameState {
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ending' | 'ended';
  score: number;
  level: number;
  timeElapsed: number;
  difficulty: number;
  accuracy: number;
  reactionTimes: number[];
  errors: number;
  customMetrics?: Record<string, any>;
}

export interface GamePerformance {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
  updateTime: number;
}

export interface GameResult {
  score: number;
  accuracy: number;
  averageReactionTime: number;
  difficulty: number;
  timeSpent: number;
  improvements: string[];
  achievements?: string[];
  performanceData: GamePerformance;
  customData?: Record<string, any>;
}

export abstract class GameEngine extends EventEmitter {
  protected config: GameConfig;
  protected state: GameState;
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;
  
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000;
  private lastFpsUpdate: number = 0;
  private performance: GamePerformance = {
    fps: 60,
    frameTime: 16.67,
    renderTime: 0,
    updateTime: 0
  };

  constructor(config: GameConfig) {
    super();
    this.config = config;
    this.state = this.createInitialState();
  }

  /**
   * 创建初始游戏状态
   */
  protected createInitialState(): GameState {
    return {
      status: 'idle',
      score: 0,
      level: 1,
      timeElapsed: 0,
      difficulty: 0.5,
      accuracy: 1,
      reactionTimes: [],
      errors: 0
    };
  }

  /**
   * 初始化游戏
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }

    this.state.status = 'loading';
    this.emit('statusChange', 'loading');

    try {
      // 调用子类的资源加载方法
      await this.loadResources();
      
      // 设置画布尺寸
      this.resizeCanvas();
      window.addEventListener('resize', this.handleResize);
      
      // 添加交互事件监听
      this.setupEventListeners();
      
      this.state.status = 'ready';
      this.emit('statusChange', 'ready');
      this.emit('initialized');
    } catch (error) {
      this.state.status = 'idle';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 开始游戏
   */
  start(): void {
    if (this.state.status !== 'ready' && this.state.status !== 'paused') {
      console.warn('游戏当前状态无法开始:', this.state.status);
      return;
    }

    this.state.status = 'playing';
    this.state.timeElapsed = 0;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = this.lastFrameTime;
    
    this.emit('statusChange', 'playing');
    this.emit('gameStart');
    
    // 调用子类的游戏开始逻辑
    this.onGameStart();
    
    // 开始游戏循环
    this.gameLoop();
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    if (this.state.status !== 'playing') return;
    
    this.state.status = 'paused';
    this.emit('statusChange', 'paused');
    this.emit('gamePause');
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 恢复游戏
   */
  resume(): void {
    if (this.state.status !== 'paused') return;
    
    this.state.status = 'playing';
    this.lastFrameTime = performance.now();
    this.emit('statusChange', 'playing');
    this.emit('gameResume');
    
    this.gameLoop();
  }

  /**
   * 结束游戏
   */
  end(): void {
    if (this.state.status === 'ended' || this.state.status === 'ending') return;
    
    this.state.status = 'ending';
    this.emit('statusChange', 'ending');
    
    // 停止游戏循环
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // 计算游戏结果
    const result = this.calculateResult();
    
    this.state.status = 'ended';
    this.emit('statusChange', 'ended');
    this.emit('gameEnd', result);
    
    // 调用子类的清理逻辑
    this.onGameEnd(result);
  }

  /**
   * 销毁游戏实例
   */
  destroy(): void {
    this.end();
    window.removeEventListener('resize', this.handleResize);
    this.removeEventListeners();
    this.removeAllListeners();
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 游戏主循环
   */
  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 更新 FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.performance.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
      this.performance.frameTime = deltaTime;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
      this.emit('performanceUpdate', this.performance);
    }

    // 更新游戏状态
    const updateStart = performance.now();
    this.update(deltaTime);
    this.performance.updateTime = performance.now() - updateStart;

    // 渲染游戏画面
    const renderStart = performance.now();
    this.render();
    this.performance.renderTime = performance.now() - renderStart;

    // 更新游戏时间
    this.state.timeElapsed += deltaTime;

    // 检查游戏是否应该结束
    if (this.shouldEndGame()) {
      this.end();
      return;
    }

    // 继续下一帧
    if (this.state.status === 'playing') {
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  };

  /**
   * 计算游戏结果
   */
  protected calculateResult(): GameResult {
    const avgReactionTime = this.state.reactionTimes.length > 0
      ? this.state.reactionTimes.reduce((a, b) => a + b, 0) / this.state.reactionTimes.length
      : 0;

    return {
      score: this.state.score,
      accuracy: this.state.accuracy,
      averageReactionTime: avgReactionTime,
      difficulty: this.state.difficulty,
      timeSpent: this.state.timeElapsed,
      improvements: this.generateImprovements(),
      performanceData: { ...this.performance },
      customData: this.state.customMetrics
    };
  }

  /**
   * 生成改进建议
   */
  protected generateImprovements(): string[] {
    const improvements: string[] = [];
    
    if (this.state.accuracy < 0.7) {
      improvements.push('提高准确率：放慢节奏，专注于正确性');
    }
    
    if (this.state.reactionTimes.length > 0) {
      const avgRT = this.state.reactionTimes.reduce((a, b) => a + b, 0) / this.state.reactionTimes.length;
      if (avgRT > 1000) {
        improvements.push('提升反应速度：多练习可以提高反应时间');
      }
    }
    
    return improvements;
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize = (): void => {
    this.resizeCanvas();
    this.emit('resize');
  };

  /**
   * 调整画布尺寸
   */
  protected resizeCanvas(): void {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  /**
   * 记录反应时间
   */
  protected recordReactionTime(time: number): void {
    this.state.reactionTimes.push(time);
    this.emit('reactionTime', time);
  }

  /**
   * 更新分数
   */
  protected updateScore(delta: number): void {
    this.state.score += delta;
    this.emit('scoreUpdate', this.state.score);
  }

  /**
   * 更新准确率
   */
  protected updateAccuracy(correct: boolean): void {
    const total = this.state.reactionTimes.length;
    const currentCorrect = Math.round(this.state.accuracy * Math.max(1, total - 1));
    const newCorrect = currentCorrect + (correct ? 1 : 0);
    this.state.accuracy = newCorrect / total;
    
    if (!correct) {
      this.state.errors++;
    }
    
    this.emit('accuracyUpdate', this.state.accuracy);
  }

  /**
   * 调整难度
   */
  protected adjustDifficulty(delta: number): void {
    this.state.difficulty = Math.max(0, Math.min(1, this.state.difficulty + delta));
    this.emit('difficultyChange', this.state.difficulty);
  }

  // 抽象方法，子类必须实现
  protected abstract loadResources(): Promise<void>;
  protected abstract setupEventListeners(): void;
  protected abstract removeEventListeners(): void;
  protected abstract update(deltaTime: number): void;
  protected abstract render(): void;
  protected abstract onGameStart(): void;
  protected abstract onGameEnd(result: GameResult): void;
  protected abstract shouldEndGame(): boolean;
}