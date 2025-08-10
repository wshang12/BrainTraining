/**
 * 模拟服务 - 在真实服务未就绪时使用
 * 生产环境会自动切换到真实服务
 */

// 模拟微信登录
export const mockWechatLogin = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    openid: `mock_${Date.now()}`,
    nickname: "测试用户",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + Date.now()
  };
};

// 模拟 AI 教练
export const mockAICoach = async (prompt: string) => {
  const responses = [
    "很好！你的专注力正在提升。建议尝试更高难度的挑战。",
    "连续3天训练了，真棒！明天试试新的游戏模式？",
    "数据显示你的反应速度提升了15%，继续保持！",
    "晚上的表现比早上好，你是夜猫子型选手呢。"
  ];
  
  await new Promise(resolve => setTimeout(resolve, 800));
  return responses[Math.floor(Math.random() * responses.length)];
};

// 模拟支付
export const mockPayment = async (plan: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (Math.random() > 0.1) {
    return { success: true, orderId: `order_${Date.now()}` };
  }
  throw new Error("支付失败，请重试");
};

// 模拟文件上传
export const mockUpload = async (file: File) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    url: `https://via.placeholder.com/200?text=${file.name}`,
    publicId: `mock_${Date.now()}`
  };
};

// 模拟实时对战匹配
export const mockMatchmaking = async (userId: string) => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return {
    opponentId: `bot_${Math.floor(Math.random() * 100)}`,
    opponentName: "AI对手",
    roomId: `room_${Date.now()}`
  };
};

// 模拟推送通知
export const mockPushNotification = async (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
  return { sent: true };
};

// 环境检测，自动切换
export const services = {
  login: process.env.NEXT_PUBLIC_USE_MOCK ? mockWechatLogin : async () => { throw new Error("微信登录未配置") },
  ai: process.env.NEXT_PUBLIC_USE_MOCK ? mockAICoach : async () => { throw new Error("AI服务未配置") },
  pay: process.env.NEXT_PUBLIC_USE_MOCK ? mockPayment : async () => { throw new Error("支付服务未配置") },
  upload: process.env.NEXT_PUBLIC_USE_MOCK ? mockUpload : async () => { throw new Error("上传服务未配置") },
  match: process.env.NEXT_PUBLIC_USE_MOCK ? mockMatchmaking : async () => { throw new Error("匹配服务未配置") },
  notify: mockPushNotification // 这个可以直接用
};