"use client";
import { useEffect, useState } from "react";
import { aiCoach } from "@/lib/ai/services";
import type { UserProfile, GamePerformance } from "@/lib/ai/services";

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // 初始化用户资料（实际应从API获取）
    const mockProfile: UserProfile = {
      userId: "mock-user",
      trainingDays: 7,
      totalSessions: 21,
      strengths: ["专注力", "反应速度"],
      weaknesses: ["工作记忆"],
      recentPerformances: [
        {
          gameId: "tracklight",
          score: 850,
          accuracy: 0.82,
          reactionTime: 680,
          difficulty: 0.7,
          timestamp: new Date()
        }
      ]
    };
    setUserProfile(mockProfile);

    // 初始欢迎消息
    setMessages([{
      role: 'assistant',
      content: '👋 你好！我是你的AI认知教练。我可以帮你分析训练表现、制定个性化计划，或者回答任何关于大脑训练的问题。今天想聊什么？',
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading || !userProfile) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let aiResponse = "";

      // 根据用户输入类型选择合适的AI功能
      if (input.includes("建议") || input.includes("训练")) {
        aiResponse = await aiCoach.getTrainingAdvice(userProfile);
      } else if (input.includes("分析") || input.includes("表现")) {
        const latestPerformance = userProfile.recentPerformances[0];
        aiResponse = await aiCoach.analyzePerformance(
          latestPerformance,
          userProfile.recentPerformances
        );
      } else if (input.includes("激励") || input.includes("加油")) {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        aiResponse = await aiCoach.getMotivation({
          streak: userProfile.trainingDays,
          improvement: true,
          timeOfDay
        });
      } else {
        // 通用对话
        const { aiClient } = await import('@/lib/ai/client');
        const response = await aiClient.chatCompletion({
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: input }
          ],
          systemPromptType: 'coach',
          temperature: 0.8
        });
        aiResponse = response.content;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('AI 对话错误:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我现在有点困惑。让我们换个话题吧，你最近的训练感觉如何？',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "今日训练建议", prompt: "给我今天的训练建议" },
    { label: "分析我的表现", prompt: "分析一下我最近的游戏表现" },
    { label: "如何提升记忆力", prompt: "我想提升工作记忆，有什么建议？" },
    { label: "激励一下", prompt: "给我一些激励吧" }
  ];

  return (
    <main className="flex flex-col h-[calc(100vh-72px)]">
      {/* 标题栏 */}
      <header className="p-4 border-b bg-background/95 backdrop-blur">
        <h1 className="text-2xl font-bold hero-gradient">AI 认知教练</h1>
        <p className="text-sm text-foreground/60 mt-1">你的专属大脑训练顾问</p>
      </header>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] p-4 rounded-2xl space-y-2
                ${message.role === 'user' 
                  ? 'bg-genius-500 text-white' 
                  : 'card-interactive'
                }
              `}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <time className={`text-xs ${
                message.role === 'user' ? 'text-white/70' : 'text-foreground/50'
              }`}>
                {message.timestamp.toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </time>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="card-interactive p-4 rounded-2xl">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-genius-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-genius-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-genius-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 快速操作 */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-sm text-foreground/60 mb-2">快速开始：</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.prompt)}
                className="p-3 text-sm card-interactive text-left hover:bg-genius-50 dark:hover:bg-genius-900/20"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4 border-t bg-background/95 backdrop-blur">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="问我任何关于大脑训练的问题..."
            disabled={loading}
            className="
              flex-1 px-4 py-3 rounded-xl
              bg-foreground/5 border border-foreground/10
              focus:outline-none focus:border-genius-500 focus:ring-2 focus:ring-genius-500/20
              disabled:opacity-50
              transition-all
            "
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="
              btn btn-primary px-6 py-3
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            发送
          </button>
        </form>
        
        <p className="text-xs text-foreground/40 mt-2 text-center">
          AI 教练基于你的训练数据提供个性化建议
        </p>
      </div>
    </main>
  );
}