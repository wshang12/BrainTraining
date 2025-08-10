/**
 * AI 服务客户端
 * 实现自动故障转移、重试和负载均衡
 */

import { AI_PROVIDERS, AIProvider, AI_REQUEST_CONFIG, RETRY_CONFIG, SYSTEM_PROMPTS } from './config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  systemPromptType?: keyof typeof SYSTEM_PROMPTS;
}

export interface ChatCompletionResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class AIClient {
  private providers: AIProvider[];
  private providerStatus: Map<string, { failures: number; lastFailure: number }> = new Map();

  constructor() {
    this.providers = [...AI_PROVIDERS].sort((a, b) => a.priority - b.priority);
  }

  /**
   * 发送聊天完成请求，自动故障转移
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('所有 AI 服务提供商都不可用');
    }

    // 添加系统提示词
    const messages = this.prepareMessages(request);

    // 尝试每个可用的提供商
    for (const provider of availableProviders) {
      try {
        console.log(`尝试使用 ${provider.name} 提供商...`);
        const response = await this.callProvider(provider, messages, request);
        
        // 成功后重置该提供商的失败计数
        this.providerStatus.delete(provider.name);
        
        return response;
      } catch (error) {
        console.error(`${provider.name} 请求失败:`, error);
        this.recordFailure(provider.name);
        
        // 如果是最后一个提供商，抛出错误
        if (provider === availableProviders[availableProviders.length - 1]) {
          throw new Error(`所有 AI 服务请求失败: ${error}`);
        }
      }
    }

    throw new Error('AI 服务请求失败');
  }

  /**
   * 调用特定提供商
   */
  private async callProvider(
    provider: AIProvider,
    messages: ChatMessage[],
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const maxRetries = provider.maxRetries || 1;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), provider.timeout || 30000);

        const response = await fetch(`${provider.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify({
            model: provider.model,
            messages,
            temperature: request.temperature ?? AI_REQUEST_CONFIG.defaultTemperature,
            max_tokens: request.maxTokens ?? AI_REQUEST_CONFIG.defaultMaxTokens,
            top_p: request.topP ?? AI_REQUEST_CONFIG.defaultTopP,
            stream: request.stream ?? false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        
        return {
          content: data.choices[0].message.content,
          provider: provider.name,
          model: provider.model,
          usage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          console.log(`重试 ${provider.name} (${attempt + 1}/${maxRetries}) 在 ${delay}ms 后...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * 准备消息（添加系统提示词）
   */
  private prepareMessages(request: ChatCompletionRequest): ChatMessage[] {
    const messages = [...request.messages];
    
    // 如果指定了系统提示词类型，添加到消息开头
    if (request.systemPromptType && SYSTEM_PROMPTS[request.systemPromptType]) {
      const hasSystemMessage = messages.some(m => m.role === 'system');
      
      if (!hasSystemMessage) {
        messages.unshift({
          role: 'system',
          content: SYSTEM_PROMPTS[request.systemPromptType]
        });
      }
    }

    return messages;
  }

  /**
   * 获取可用的提供商（基于失败历史）
   */
  private getAvailableProviders(): AIProvider[] {
    const now = Date.now();
    const cooldownPeriod = 60000; // 1分钟冷却期

    return this.providers.filter(provider => {
      const status = this.providerStatus.get(provider.name);
      
      if (!status) return true;
      
      // 如果失败次数过多，检查冷却期
      if (status.failures >= 3) {
        return now - status.lastFailure > cooldownPeriod;
      }
      
      return true;
    });
  }

  /**
   * 记录失败
   */
  private recordFailure(providerName: string): void {
    const status = this.providerStatus.get(providerName) || { failures: 0, lastFailure: 0 };
    status.failures++;
    status.lastFailure = Date.now();
    this.providerStatus.set(providerName, status);
  }

  /**
   * 计算重试延迟
   */
  private calculateRetryDelay(attempt: number): number {
    const baseDelay = RETRY_CONFIG.retryDelay;
    const multiplier = RETRY_CONFIG.backoffMultiplier;
    const maxDelay = RETRY_CONFIG.maxRetryDelay;
    
    let delay = Math.min(baseDelay * Math.pow(multiplier, attempt), maxDelay);
    
    // 添加随机抖动
    if (RETRY_CONFIG.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取提供商状态（用于监控）
   */
  getProvidersStatus(): Array<{ name: string; available: boolean; failures: number }> {
    const now = Date.now();
    const cooldownPeriod = 60000;

    return this.providers.map(provider => {
      const status = this.providerStatus.get(provider.name);
      const available = !status || 
        (status.failures < 3 || now - status.lastFailure > cooldownPeriod);
      
      return {
        name: provider.name,
        available,
        failures: status?.failures || 0
      };
    });
  }
}

// 导出单例
export const aiClient = new AIClient();