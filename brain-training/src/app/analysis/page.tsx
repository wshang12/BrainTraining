"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/stores/user-store";
import { useGameStore } from "@/lib/stores/game-store";
import { gameSessionRepository } from "@/lib/data/repositories/game-session";
import Link from "next/link";

// 能力维度配置
const ABILITY_DIMENSIONS = [
  { key: 'attention', label: '专注力', color: '#3B82F6' },
  { key: 'memory', label: '记忆力', color: '#8B5CF6' },
  { key: 'speed', label: '反应速度', color: '#EF4444' },
  { key: 'logic', label: '逻辑思维', color: '#F59E0B' },
  { key: 'spatial', label: '空间感知', color: '#10B981' }
];

export default function AnalysisPage() {
  const user = useUserStore(state => state.user);
  const abilities = useGameStore(state => state.abilities);
  const stats = useGameStore(state => state.stats);
  const updateAbilities = useGameStore(state => state.updateAbilities);
  
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [selectedDays, setSelectedDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedDays]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 更新能力数据
      await updateAbilities(user.id);
      
      // 加载每日数据
      const daily = await gameSessionRepository.getDailyStats(user.id, selectedDays);
      setDailyData(daily);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 绘制雷达图
  const drawRadarChart = () => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    const angleStep = (Math.PI * 2) / ABILITY_DIMENSIONS.length;

    // 计算顶点位置
    const points = ABILITY_DIMENSIONS.map((dim, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const value = abilities[dim.key as keyof typeof abilities] as number || 0;
      const r = (value / 100) * radius;
      
      return {
        x: center + Math.cos(angle) * r,
        y: center + Math.sin(angle) * r,
        labelX: center + Math.cos(angle) * (radius + 20),
        labelY: center + Math.sin(angle) * (radius + 20),
        dimension: dim
      };
    });

    // 生成多边形路径
    const polygonPath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ') + ' Z';

    return (
      <svg width={size} height={size} className="mx-auto">
        {/* 背景网格 */}
        {[20, 40, 60, 80, 100].map((level) => {
          const r = (level / 100) * radius;
          const gridPoints = ABILITY_DIMENSIONS.map((_, index) => {
            const angle = angleStep * index - Math.PI / 2;
            return {
              x: center + Math.cos(angle) * r,
              y: center + Math.sin(angle) * r
            };
          });
          
          const gridPath = gridPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ') + ' Z';
          
          return (
            <path
              key={level}
              d={gridPath}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray={level === 100 ? "0" : "2,2"}
            />
          );
        })}

        {/* 轴线 */}
        {ABILITY_DIMENSIONS.map((_, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const x2 = center + Math.cos(angle) * radius;
          const y2 = center + Math.sin(angle) * radius;
          
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据多边形 */}
        <path
          d={polygonPath}
          fill="url(#radarGradient)"
          fillOpacity="0.3"
          stroke="#3B82F6"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={point.dimension.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* 标签 */}
        {points.map((point, index) => {
          const dim = point.dimension;
          const value = abilities[dim.key as keyof typeof abilities] as number || 0;
          
          return (
            <g key={index}>
              <text
                x={point.labelX}
                y={point.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-gray-700"
              >
                {dim.label}
              </text>
              <text
                x={point.labelX}
                y={point.labelY + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-500"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* 渐变定义 */}
        <defs>
          <radialGradient id="radarGradient">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
    );
  };

  // 绘制进步曲线
  const drawProgressChart = () => {
    if (dailyData.length === 0) return null;

    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 计算数据范围
    const maxScore = Math.max(...dailyData.map(d => d.avgScore), 100);
    const maxGames = Math.max(...dailyData.map(d => d.games), 5);

    // 生成路径
    const scorePath = dailyData
      .map((d, i) => {
        const x = padding.left + (i / (dailyData.length - 1)) * chartWidth;
        const y = padding.top + (1 - d.avgScore / maxScore) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="w-full">
        {/* 背景网格 */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding.top + (1 - percent / 100) * chartHeight;
          return (
            <g key={percent}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-500"
              >
                {Math.round(percent * maxScore / 100)}
              </text>
            </g>
          );
        })}

        {/* 分数曲线 */}
        <path
          d={scorePath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {dailyData.map((d, i) => {
          const x = padding.left + (i / (dailyData.length - 1)) * chartWidth;
          const y = padding.top + (1 - d.avgScore / maxScore) * chartHeight;
          
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
              />
              {/* 游戏次数标记 */}
              {d.games > 0 && (
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {d.games}
                </text>
              )}
            </g>
          );
        })}

        {/* X轴标签 */}
        {dailyData.filter((_, i) => i % Math.ceil(dailyData.length / 7) === 0).map((d, i, arr) => {
          const index = dailyData.indexOf(d);
          const x = padding.left + (index / (dailyData.length - 1)) * chartWidth;
          const date = new Date(d.date);
          
          return (
            <text
              key={index}
              x={x}
              y={height - 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {date.getMonth() + 1}/{date.getDate()}
            </text>
          );
        })}

        {/* 图例 */}
        <g transform={`translate(${width - 100}, 20)`}>
          <rect x="0" y="0" width="12" height="12" fill="#3B82F6" rx="2" />
          <text x="16" y="10" className="text-xs fill-gray-600">平均分数</text>
        </g>
      </svg>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先登录查看数据分析</p>
          <Link href="/me" className="btn btn-primary">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      {/* 页面标题 */}
      <div className="bg-gradient-to-br from-genius-500 to-wisdom-600 text-white p-6">
        <Link href="/me" className="inline-flex items-center gap-2 text-white/80 mb-4">
          ← 返回
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">数据分析</h1>
        <p className="text-white/80">深入了解你的认知能力发展</p>
      </div>

      {loading ? (
        <div className="p-6 space-y-6">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-interactive p-4 text-center">
              <div className="text-2xl font-bold text-genius-600">{stats.todayGames}</div>
              <div className="text-sm text-foreground/60">今日训练</div>
            </div>
            <div className="card-interactive p-4 text-center">
              <div className="text-2xl font-bold text-fire-600">{stats.currentStreak}</div>
              <div className="text-sm text-foreground/60">连续天数</div>
            </div>
            <div className="card-interactive p-4 text-center">
              <div className="text-2xl font-bold text-wisdom-600">
                {Math.floor(stats.weekTime / 60000)}
              </div>
              <div className="text-sm text-foreground/60">本周时长(分)</div>
            </div>
            <div className="card-interactive p-4 text-center">
              <div className="text-2xl font-bold text-growth-600">{stats.weekGames}</div>
              <div className="text-sm text-foreground/60">本周场次</div>
            </div>
          </div>

          {/* 能力雷达图 */}
          <section className="card-interactive p-6">
            <h2 className="text-xl font-semibold mb-4">认知能力分布</h2>
            <div className="flex justify-center">
              {drawRadarChart()}
            </div>
            <p className="text-sm text-foreground/60 text-center mt-4">
              基于你的游戏表现综合评估
            </p>
          </section>

          {/* 进步曲线 */}
          <section className="card-interactive p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">进步趋势</h2>
              <div className="flex gap-2">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setSelectedDays(days)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedDays === days
                        ? 'bg-genius-500 text-white'
                        : 'bg-foreground/5 hover:bg-foreground/10'
                    }`}
                  >
                    {days}天
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              {dailyData.length > 0 ? (
                drawProgressChart()
              ) : (
                <div className="h-64 flex items-center justify-center text-foreground/40">
                  暂无数据
                </div>
              )}
            </div>
          </section>

          {/* 训练建议 */}
          <section className="card-interactive p-6 bg-gradient-to-br from-genius-50 to-wisdom-50 dark:from-genius-900/20 dark:to-wisdom-900/20">
            <h3 className="text-lg font-semibold mb-3">AI 训练建议</h3>
            <div className="space-y-3">
              {Object.entries(abilities).map(([key, value]) => {
                if (key === 'lastUpdated') return null;
                const dimension = ABILITY_DIMENSIONS.find(d => d.key === key);
                if (!dimension || typeof value !== 'number') return null;
                
                if (value < 50) {
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="font-medium">{dimension.label}需要加强</p>
                        <p className="text-sm text-foreground/60">
                          建议多练习{dimension.label}相关的游戏，每天至少15分钟
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              
              {stats.currentStreak < 3 && (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-medium">保持训练频率</p>
                    <p className="text-sm text-foreground/60">
                      连续训练能够更好地提升认知能力，建议每天至少完成3个游戏
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}