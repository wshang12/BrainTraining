/**
 * 模拟认证系统
 * 提供与真实认证系统相同的接口，便于后续无缝切换
 */

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  lastLoginAt: Date;
  metadata?: {
    trainingDays: number;
    totalSessions: number;
    favoriteGame?: string;
    level: number;
    xp: number;
  };
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

class MockAuthService {
  private currentUser: User | null = null;
  private sessionToken: string | null = null;

  constructor() {
    // 从 localStorage 恢复会话
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('mock_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (new Date(session.expiresAt) > new Date()) {
            this.currentUser = session.user;
            this.sessionToken = session.token;
          }
        } catch (e) {
          console.error('恢复会话失败:', e);
        }
      }
    }
  }

  /**
   * 模拟登录
   */
  async login(method: 'phone' | 'email' | 'wechat', credential: string): Promise<Session> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟登录验证
    if (!credential) {
      throw new Error('凭证不能为空');
    }

    // 生成或获取用户
    const userId = `user_${this.hashCode(credential)}`;
    const user: User = {
      id: userId,
      name: this.generateName(userId),
      email: method === 'email' ? credential : undefined,
      phone: method === 'phone' ? credential : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 随机 0-30 天前
      lastLoginAt: new Date(),
      metadata: {
        trainingDays: Math.floor(Math.random() * 30),
        totalSessions: Math.floor(Math.random() * 100),
        favoriteGame: ['tracklight', 'pairmaster', 'fastmatch'][Math.floor(Math.random() * 3)],
        level: Math.floor(Math.random() * 10) + 1,
        xp: Math.floor(Math.random() * 5000)
      }
    };

    const session: Session = {
      user,
      token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
    };

    // 保存会话
    this.currentUser = user;
    this.sessionToken = session.token;
    this.saveSession(session);

    return session;
  }

  /**
   * 模拟登出
   */
  async logout(): Promise<void> {
    this.currentUser = null;
    this.sessionToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_session');
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.sessionToken;
  }

  /**
   * 更新用户信息
   */
  async updateUser(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('未登录');
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    this.currentUser = {
      ...this.currentUser,
      ...updates,
      id: this.currentUser.id // ID 不能修改
    };

    // 更新保存的会话
    if (this.sessionToken) {
      const session: Session = {
        user: this.currentUser,
        token: this.sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      this.saveSession(session);
    }

    return this.currentUser;
  }

  /**
   * 刷新会话
   */
  async refreshSession(): Promise<Session | null> {
    if (!this.currentUser || !this.sessionToken) {
      return null;
    }

    const session: Session = {
      user: this.currentUser,
      token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    this.sessionToken = session.token;
    this.saveSession(session);

    return session;
  }

  /**
   * 模拟发送验证码
   */
  async sendVerificationCode(target: string, type: 'phone' | 'email'): Promise<void> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`验证码已发送到 ${type === 'phone' ? '手机' : '邮箱'}: ${target}`);
    console.log('模拟验证码: 123456');
  }

  /**
   * 模拟验证验证码
   */
  async verifyCode(target: string, code: string): Promise<boolean> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 在实际环境中应该验证真实的验证码
    return code === '123456';
  }

  /**
   * 工具方法：生成哈希码
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 工具方法：生成随机用户名
   */
  private generateName(userId: string): string {
    const adjectives = ['聪明的', '勤奋的', '专注的', '敏锐的', '睿智的', '灵活的'];
    const nouns = ['学习者', '思考者', '探索者', '挑战者', '训练师', '大师'];
    
    const hash = this.hashCode(userId);
    const adj = adjectives[hash % adjectives.length];
    const noun = nouns[(hash >> 8) % nouns.length];
    
    return `${adj}${noun}`;
  }

  /**
   * 保存会话到 localStorage
   */
  private saveSession(session: Session): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_session', JSON.stringify(session));
    }
  }
}

// 导出单例
export const mockAuth = new MockAuthService();