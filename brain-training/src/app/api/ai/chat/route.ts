import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai/client";
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  systemPromptType: z.enum(['coach', 'analyzer', 'motivator']).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    const response = await aiClient.chatCompletion(validatedData);

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: '请求参数无效',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: '处理请求时出错',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 健康检查端点
export async function GET() {
  const providersStatus = aiClient.getProvidersStatus();
  
  return NextResponse.json({
    status: 'ok',
    providers: providersStatus,
    timestamp: new Date().toISOString()
  });
}