"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const FEATURES = [
  {
    icon: "♾️",
    title: "无限训练次数",
    description: "告别等待，随时随地训练",
    free: "每日3次",
    pro: "无限制"
  },
  {
    icon: "🎯",
    title: "全部游戏解锁",
    description: "20+ 专业认知训练游戏",
    free: "3个基础游戏",
    pro: "全部游戏"
  },
  {
    icon: "📊",
    title: "深度数据分析",
    description: "AI驱动的个性化报告",
    free: "基础统计",
    pro: "完整分析"
  },
  {
    icon: "🏆",
    title: "全球排行榜",
    description: "与世界各地的高手竞技",
    free: "❌",
    pro: "✅"
  },
  {
    icon: "🎨",
    title: "专属定制",
    description: "个性化训练计划和主题",
    free: "❌",
    pro: "✅"
  },
  {
    icon: "🚫",
    title: "无广告体验",
    description: "专注训练，不受打扰",
    free: "包含广告",
    pro: "无广告"
  }
];

const TESTIMONIALS = [
  {
    name: "张明",
    age: 28,
    role: "软件工程师",
    avatar: "👨‍💻",
    content: "使用3个月后，我的工作效率提升了30%。专注力训练让我能更长时间保持深度工作状态。",
    improvement: "+42% 专注力"
  },
  {
    name: "李薇",
    age: 35,
    role: "产品经理",
    avatar: "👩‍💼",
    content: "每天15分钟的训练，让我在会议中思维更敏捷。记忆力游戏帮我轻松记住所有项目细节。",
    improvement: "+38% 记忆力"
  },
  {
    name: "王强",
    age: 45,
    role: "企业高管",
    avatar: "👨‍💼",
    content: "年龄增长但思维依然敏锐。这个APP帮我保持大脑活力，决策更快更准确。",
    improvement: "+35% 反应速度"
  }
];

const PRICING = [
  {
    id: 'monthly',
    name: '月度会员',
    price: 39,
    originalPrice: 68,
    period: '月',
    save: '',
    popular: false
  },
  {
    id: 'quarterly',
    name: '季度会员',
    price: 99,
    originalPrice: 204,
    period: '季',
    save: '省51%',
    popular: true,
    badge: '最受欢迎'
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: 299,
    originalPrice: 816,
    period: '年',
    save: '省63%',
    popular: false,
    badge: '最超值'
  }
];

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [loading, setLoading] = useState(false);
  
  // 追踪来源
  useEffect(() => {
    if (from) {
      console.log('用户来源:', from);
      // 可以根据来源定制页面内容
    }
  }, [from]);

  const handleSubscribe = async () => {
    setLoading(true);
    // 模拟支付流程
    setTimeout(() => {
      localStorage.setItem('subscription', 'pro');
      window.location.href = '/today?upgraded=true';
    }, 2000);
  };

  return (
    <main className="min-h-screen pb-24">
      {/* 顶部横幅 - 限时优惠 */}
      <div className="bg-gradient-to-r from-fire-500 to-genius-500 text-white p-3 text-center">
        <p className="text-sm font-medium">
          🎉 限时优惠：所有套餐额外8折，仅限今日！
        </p>
      </div>

      {/* 页头 - 价值主张 */}
      <header className="bg-gradient-to-br from-genius-50 to-wisdom-50 dark:from-genius-900/20 dark:to-wisdom-900/20 p-6 pb-12">
        <Link href="/today" className="inline-flex items-center gap-2 text-foreground/60 mb-6">
          ← 返回
        </Link>
        
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold">
            <span className="hero-gradient">解锁大脑的无限潜能</span>
          </h1>
          <p className="text-xl text-foreground/80">
            加入10万+用户，用科学的方法提升认知能力
          </p>
          
          {/* 信任标志 */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-genius-600">4.8⭐</div>
              <div className="text-xs text-foreground/60">应用商店评分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-wisdom-600">100K+</div>
              <div className="text-xs text-foreground/60">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-growth-600">15min</div>
              <div className="text-xs text-foreground/60">每日训练</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* 定价计划 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-center">选择你的训练计划</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {PRICING.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative rounded-2xl p-6 cursor-pointer transition-all
                  ${selectedPlan === plan.id 
                    ? 'ring-2 ring-genius-500 bg-gradient-to-br from-genius-50 to-wisdom-50 dark:from-genius-900/20 dark:to-wisdom-900/20' 
                    : 'bg-white dark:bg-gray-800 hover:shadow-lg'
                  }
                `}
              >
                {plan.badge && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-genius-500 to-wisdom-500 text-white text-xs rounded-full">
                    {plan.badge}
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">¥{plan.price}</span>
                      <span className="text-foreground/60">/{plan.period}</span>
                    </div>
                    <div className="text-sm text-foreground/60 line-through">
                      原价 ¥{plan.originalPrice}
                    </div>
                    {plan.save && (
                      <div className="text-sm font-medium text-green-600">
                        {plan.save}
                      </div>
                    )}
                  </div>
                  
                  {selectedPlan === plan.id && (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-genius-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn btn-primary w-full md:w-auto md:mx-auto md:px-12 py-4 text-lg font-semibold"
          >
            {loading ? '处理中...' : '立即升级 Pro'}
          </button>
          
          <p className="text-center text-sm text-foreground/60">
            支持微信支付、支付宝 · 7天无理由退款 · 自动续费可随时取消
          </p>
        </section>

        {/* 功能对比 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Pro 会员特权</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, index) => (
              <div key={index} className="card-interactive p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-foreground/60">{feature.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 rounded-lg bg-foreground/5">
                    <div className="text-foreground/60">免费版</div>
                    <div className="font-medium">{feature.free}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-genius-50 dark:bg-genius-900/20">
                    <div className="text-genius-700 dark:text-genius-400">Pro版</div>
                    <div className="font-medium">{feature.pro}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 用户评价 */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">10万+用户的选择</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="card-interactive p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{testimonial.avatar}</span>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-foreground/60">
                      {testimonial.age}岁 · {testimonial.role}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed text-foreground/80">
                  "{testimonial.content}"
                </p>
                
                <div className="text-sm font-medium text-genius-600">
                  {testimonial.improvement}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center">常见问题</h2>
          
          <div className="space-y-3">
            <details className="card-interactive p-4">
              <summary className="font-medium cursor-pointer">如何取消订阅？</summary>
              <p className="mt-3 text-sm text-foreground/70">
                您可以随时在"我的-订阅管理"中取消自动续费。取消后，您仍可享受当前订阅期内的所有权益。
              </p>
            </details>
            
            <details className="card-interactive p-4">
              <summary className="font-medium cursor-pointer">是否支持退款？</summary>
              <p className="mt-3 text-sm text-foreground/70">
                我们提供7天无理由退款保证。如果您对服务不满意，可以联系客服申请全额退款。
              </p>
            </details>
            
            <details className="card-interactive p-4">
              <summary className="font-medium cursor-pointer">Pro版真的有效果吗？</summary>
              <p className="mt-3 text-sm text-foreground/70">
                根据我们的数据，持续使用Pro版30天的用户，平均认知能力提升28%。效果因人而异，但坚持是关键。
              </p>
            </details>
          </div>
        </section>

        {/* 底部CTA */}
        <section className="text-center space-y-4 py-8">
          <h3 className="text-2xl font-bold">
            <span className="hero-gradient">开始你的认知提升之旅</span>
          </h3>
          <p className="text-foreground/70">
            加入Pro会员，让每一天都比昨天更聪明
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="btn btn-primary px-8 py-3 text-lg"
          >
            立即开始 →
          </button>
        </section>
      </div>
    </main>
  );
}