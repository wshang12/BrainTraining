"use client";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/components/ThemeProvider";
import { mockAuth } from "@/lib/auth";
import { achievementManager } from "@/lib/achievements";
import { cloudinary } from "@/lib/cloudinary";
import Link from "next/link";
import type { User } from "@/lib/auth";

interface UserStats {
  totalGames: number;
  totalTime: number;
  favoriteGame: string;
  currentStreak: number;
  bestStreak: number;
  achievementPoints: number;
}

export default function MePage() {
  const theme = useContext(ThemeContext);
  const [lt, setLt] = useState(false);
  const [hc, setHc] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginInput, setLoginInput] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLt(theme.largeText);
    setHc(theme.highContrast);
    
    // 检查登录状态
    const currentUser = mockAuth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserStats();
    }
  }, [theme.largeText, theme.highContrast]);

  const loadUserStats = () => {
    // 从本地存储加载统计数据
    const gameStats = JSON.parse(localStorage.getItem('gameStats') || '{}');
    let totalGames = 0;
    let favoriteGame = '';
    let maxPlays = 0;

    Object.entries(gameStats).forEach(([gameId, stats]: [string, any]) => {
      totalGames += stats.totalPlays || 0;
      if (stats.totalPlays > maxPlays) {
        maxPlays = stats.totalPlays;
        favoriteGame = gameId;
      }
    });

    const achievementStats = achievementManager.getStats();

    setStats({
      totalGames,
      totalTime: Math.floor(totalGames * 3), // 假设每局3分钟
      favoriteGame: favoriteGame || 'tracklight',
      currentStreak: Math.floor(Math.random() * 7) + 1, // 模拟数据
      bestStreak: Math.floor(Math.random() * 30) + 7,
      achievementPoints: achievementStats.points
    });
  };

  const handleLogin = async () => {
    if (step === 'input') {
      setLoading(true);
      try {
        await mockAuth.sendVerificationCode(loginInput, loginMethod);
        setStep('verify');
      } catch (error) {
        console.error('发送验证码失败:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const isValid = await mockAuth.verifyCode(loginInput, verifyCode);
        if (isValid) {
          const session = await mockAuth.login(loginMethod, loginInput);
          setUser(session.user);
          setShowLoginModal(false);
          loadUserStats();
        } else {
          alert('验证码错误');
        }
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await mockAuth.logout();
    setUser(null);
    setStats(null);
  };

  const formatGameName = (gameId: string): string => {
    const names: Record<string, string> = {
      tracklight: '专注追光',
      pairmaster: '配对大师',
      fastmatch: '快速匹配'
    };
    return names[gameId] || gameId;
  };

  if (!user) {
    return (
      <main className="p-4 pb-24 space-y-6">
        <h1 className="text-3xl font-bold">
          <span className="hero-gradient">个人中心</span>
        </h1>

        <div className="card-interactive p-8 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-foreground/10 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold">登录解锁完整体验</h2>
          <p className="text-sm text-foreground/60">
            登录后可以保存进度、查看成就、参与排行榜
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="btn btn-primary px-8 py-3"
          >
            立即登录
          </button>
        </div>

        {/* 登录弹窗 */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-center">快速登录</h3>
              
              {step === 'input' ? (
                <>
                  <div className="flex gap-2 p-1 bg-foreground/5 rounded-xl">
                    <button
                      onClick={() => setLoginMethod('phone')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        loginMethod === 'phone' ? 'bg-background shadow' : ''
                      }`}
                    >
                      手机号
                    </button>
                    <button
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        loginMethod === 'email' ? 'bg-background shadow' : ''
                      }`}
                    >
                      邮箱
                    </button>
                  </div>

                  <input
                    type={loginMethod === 'phone' ? 'tel' : 'email'}
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder={loginMethod === 'phone' ? '请输入手机号' : '请输入邮箱'}
                    className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-genius-500"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-center text-foreground/60">
                    验证码已发送至 {loginInput}
                  </p>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="请输入验证码"
                    className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-genius-500"
                  />
                  <p className="text-xs text-center text-foreground/50">
                    测试验证码：123456
                  </p>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-3 rounded-xl bg-foreground/10"
                >
                  取消
                </button>
                <button
                  onClick={handleLogin}
                  disabled={loading || !loginInput || (step === 'verify' && !verifyCode)}
                  className="flex-1 btn btn-primary disabled:opacity-50"
                >
                  {loading ? '处理中...' : step === 'input' ? '获取验证码' : '登录'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 设置部分 */}
        <section className="rounded-xl border p-4 space-y-3">
          <div className="font-medium">显示与无障碍</div>
          <label className="flex items-center justify-between">
            <span>大字模式</span>
            <input
              type="checkbox"
              checked={lt}
              onChange={(e) => {
                setLt(e.target.checked);
                theme.updateLargeText(e.target.checked);
              }}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>高对比主题</span>
            <input
              type="checkbox"
              checked={hc}
              onChange={(e) => {
                setHc(e.target.checked);
                theme.updateHighContrast(e.target.checked);
              }}
              className="w-5 h-5"
            />
          </label>
        </section>
      </main>
    );
  }

  // 已登录状态
  return (
    <main className="p-4 pb-24 space-y-6">
      {/* 用户信息卡片 */}
      <section className="card-interactive p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={cloudinary.getAvatarUrl(user.id, 80)}
            alt={user.name}
            className="w-20 h-20 rounded-full"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-foreground/60">
              {user.phone || user.email || `ID: ${user.id.slice(0, 8)}`}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm">
                <span className="font-semibold text-genius-600">Lv.{user.metadata?.level || 1}</span>
              </span>
              <span className="text-sm text-foreground/60">
                {user.metadata?.xp || 0} XP
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            退出
          </button>
        </div>

        {/* 经验条 */}
        <div>
          <div className="flex justify-between text-xs text-foreground/60 mb-1">
            <span>等级进度</span>
            <span>{((user.metadata?.xp || 0) % 1000)} / 1000 XP</span>
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-genius-400 to-genius-600 transition-all"
              style={{ width: `${((user.metadata?.xp || 0) % 1000) / 10}%` }}
            />
          </div>
        </div>
      </section>

      {/* 训练统计 */}
      {stats && (
        <section className="grid grid-cols-2 gap-4">
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-genius-600">{stats.totalGames}</div>
            <div className="text-sm text-foreground/60">总训练次数</div>
          </div>
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-fire-600">{stats.currentStreak}</div>
            <div className="text-sm text-foreground/60">连续天数</div>
          </div>
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-wisdom-600">{stats.totalTime}</div>
            <div className="text-sm text-foreground/60">训练时长(分)</div>
          </div>
          <div className="card-interactive p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.achievementPoints}</div>
            <div className="text-sm text-foreground/60">成就点数</div>
          </div>
        </section>
      )}

      {/* 快捷入口 */}
      <section className="space-y-3">
        <Link href="/achievements" className="card-interactive p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-medium">我的成就</div>
              <div className="text-sm text-foreground/60">
                已解锁 {achievementManager.getStats().unlocked} / {achievementManager.getStats().total}
              </div>
            </div>
          </div>
          <span className="text-foreground/40 group-hover:text-foreground transition-colors">→</span>
        </Link>

        <Link href="/analysis" className="card-interactive p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium">数据分析</div>
              <div className="text-sm text-foreground/60">查看能力雷达图和进步曲线</div>
            </div>
          </div>
          <span className="text-foreground/40 group-hover:text-foreground transition-colors">→</span>
        </Link>

        <Link href="/friends" className="card-interactive p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <div className="font-medium">好友排行</div>
              <div className="text-sm text-foreground/60">邀请好友一起训练</div>
            </div>
          </div>
          <span className="text-foreground/40 group-hover:text-foreground transition-colors">→</span>
        </Link>

        <Link href="/subscribe" className="card-interactive p-4 flex items-center justify-between group bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="font-medium">升级 Pro</div>
              <div className="text-sm text-foreground/60">解锁全部游戏和功能</div>
            </div>
          </div>
          <span className="text-amber-600 group-hover:text-amber-700 transition-colors">→</span>
        </Link>
      </section>

      {/* 设置 */}
      <section className="card-interactive p-4 space-y-3">
        <div className="font-medium">设置</div>
        
        <label className="flex items-center justify-between py-2">
          <span>大字模式</span>
          <input
            type="checkbox"
            checked={lt}
            onChange={(e) => {
              setLt(e.target.checked);
              theme.updateLargeText(e.target.checked);
            }}
            className="w-5 h-5"
          />
        </label>
        
        <label className="flex items-center justify-between py-2">
          <span>高对比主题</span>
          <input
            type="checkbox"
            checked={hc}
            onChange={(e) => {
              setHc(e.target.checked);
              theme.updateHighContrast(e.target.checked);
            }}
            className="w-5 h-5"
          />
        </label>

        <div className="pt-2 border-t border-foreground/10">
          <Link href="/settings" className="flex items-center justify-between py-2 text-foreground/60 hover:text-foreground">
            <span>更多设置</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 底部信息 */}
      <footer className="text-center text-xs text-foreground/40 space-y-1">
        <p>版本 1.0.0</p>
        <p>© 2024 脑力训练</p>
      </footer>
    </main>
  );
}