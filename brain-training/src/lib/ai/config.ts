/**
 * AI 服务配置
 * 支持多提供商故障转移和负载均衡
 */

export interface AIProvider {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  priority: number; // 优先级，数字越小优先级越高
  timeout?: number; // 超时时间（毫秒）
  maxRetries?: number; // 最大重试次数
}

// AI 提供商配置
export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'cerebras',
    baseUrl: 'https://crhidybdmoau.ap-northeast-1.clawcloudrun.com/proxy/cerebras/v1',
    model: 'gpt-oss-120b',
    apiKey: process.env.AI_API_KEY || 'whshang',
    priority: 1,
    timeout: 30000,
    maxRetries: 2
  },
  {
    name: 'gemini',
    baseUrl: 'https://crhidybdmoau.ap-northeast-1.clawcloudrun.com/proxy/gemini/v1beta/openai',
    model: 'gemini-2.5-flash',
    apiKey: process.env.AI_API_KEY || 'whshang',
    priority: 2,
    timeout: 25000,
    maxRetries: 2
  },
  // 可以继续添加更多备选提供商
  {
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY || '',
    priority: 3,
    timeout: 20000,
    maxRetries: 1
  }
].filter(p => p.apiKey); // 过滤掉没有 API Key 的提供商

// 系统提示词配置
export const SYSTEM_PROMPTS = {
  coach: `你是一个专业的认知训练教练。你的任务是：
1. 分析用户的训练数据和表现
2. 提供个性化的训练建议
3. 用鼓励和科学的方式激励用户
4. 回答要简洁、实用、充满正能量
5. 适时引用认知科学研究支持你的建议`,

  analyzer: `你是一个认知能力分析专家。基于用户的游戏表现数据，你需要：
1. 识别用户的认知强项和弱项
2. 解释表现背后的认知机制
3. 预测最适合的训练方向
4. 用通俗易懂的语言解释专业概念`,

  motivator: `你是一个充满活力的激励教练。你的风格是：
1. 永远保持积极乐观
2. 善于发现用户的每一个小进步
3. 用生动的比喻和故事激励用户
4. 创造有趣的挑战目标
5. 让用户感受到训练的乐趣而不是压力`
};

// 请求配置
export const AI_REQUEST_CONFIG = {
  defaultTemperature: 0.7,
  defaultMaxTokens: 500,
  defaultTopP: 0.9,
  streamEnabled: true
};

// 错误重试配置
export const RETRY_CONFIG = {
  retryDelay: 1000, // 基础重试延迟（毫秒）
  backoffMultiplier: 2, // 退避乘数
  maxRetryDelay: 10000, // 最大重试延迟
  jitter: true // 是否添加随机抖动
};