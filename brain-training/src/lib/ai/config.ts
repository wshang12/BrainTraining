/**
 * AI 服务配置
 * 支持多个 AI 提供商，自动故障转移
 */

export interface AIProvider {
  name: string;
  baseURL: string;
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
    baseURL: 'https://your-api-gateway.com/proxy/cerebras/v1',
    model: 'llama3.1-70b',
    apiKey: process.env.AI_API_KEY_CEREBRAS || process.env.AI_API_KEY || 'your-api-key',
    priority: 1,
    timeout: 30000,
    maxRetries: 2
  },
  {
    name: 'gemini',
    baseURL: 'https://your-api-gateway.com/proxy/gemini/v1beta/openai',
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.AI_API_KEY_GEMINI || process.env.AI_API_KEY || 'your-api-key',
    priority: 2,
    timeout: 30000,
    maxRetries: 2
  },
  {
    name: 'openai',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    apiKey: process.env.AI_API_KEY_OPENAI || 'your-openai-api-key',
    priority: 3,
    timeout: 30000,
    maxRetries: 2
  }
];

// 系统提示词
export const SYSTEM_PROMPTS = {
  trainingAdvice: `你是一位专业的认知训练教练。根据用户的游戏表现数据，提供个性化的训练建议。
请注意：
1. 用温暖鼓励的语气
2. 结合具体数据给出建议
3. 建议要具体可行
4. 每次回复控制在100字以内`,

  performanceAnalysis: `你是一位认知科学专家。分析用户的游戏表现趋势，识别优势和改进空间。
请注意：
1. 基于数据客观分析
2. 突出进步和亮点
3. 委婉指出需要改进的地方
4. 提供科学的解释`,

  motivation: `你是一位充满正能量的激励教练。根据用户状态提供个性化的鼓励。
请注意：
1. 真诚且充满热情
2. 个性化的鼓励语
3. 激发用户继续训练的动力
4. 简短有力，不超过50字`,

  generalChat: `你是脑力训练APP的AI助手。友好地回答用户关于认知训练、游戏技巧、大脑健康等问题。
请注意：
1. 专业但易懂
2. 积极正面
3. 提供实用建议
4. 适时推荐相关训练`
};

// AI 请求配置
export const AI_REQUEST_CONFIG = {
  temperature: 0.7,
  max_tokens: 500,
  stream: false
};

// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 初始重试延迟（毫秒）
  maxRetryDelay: 10000, // 最大重试延迟
  backoffMultiplier: 2 // 指数退避倍数
};