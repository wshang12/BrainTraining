# 脑力训练 - 认知能力提升平台

一个革命性的脑力训练应用，通过科学的游戏化设计和 AI 个性化指导，帮助用户提升认知能力。

## ✨ 核心特性

- 🎮 **多样化训练游戏**：专注力、记忆力、反应速度等多维度训练
- 🤖 **AI 个性化教练**：基于表现数据的智能建议和激励
- 🏆 **成就系统**：15+ 成就激励持续训练
- 📊 **数据可视化**：清晰的进步追踪和能力分析
- 👥 **社交竞技**：排行榜和好友 PK
- 🎨 **精美设计**：情感化的视觉体验

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/brain-training.git
cd brain-training
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入实际的配置值
```

4. **数据库初始化**（如果不使用模拟模式）
```bash
# 运行 Prisma 迁移
npx prisma migrate dev

# 生成 Prisma 客户端
npx prisma generate
```

5. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看应用

## 🔧 环境配置

### 必需配置

以下配置是运行应用的最小要求：

```env
# 应用基础配置
NEXT_PUBLIC_APP_NAME=脑力训练
NEXT_PUBLIC_APP_ENV=development

# 模拟模式（开发时推荐开启）
NEXT_PUBLIC_USE_MOCK=true
```

### 生产环境配置

生产环境需要配置以下服务：

1. **数据库**
   - PostgreSQL (推荐 Supabase 或 Neon)
   - Redis (推荐 Upstash)

2. **AI 服务**
   - 支持 OpenAI 兼容的 API
   - 可配置多个提供商实现故障转移

3. **文件存储**
   - Cloudinary（推荐）
   - 阿里云 OSS（备选）

4. **认证服务**（可选）
   - Supabase Auth
   - 微信登录

详细配置请参考 `.env.example` 文件

## 🏗️ 技术架构

- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis (Upstash)
- **AI**: OpenAI 兼容 API
- **文件存储**: Cloudinary
- **部署**: Vercel / Docker

## 📁 项目结构

```
brain-training/
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数和服务
│   │   ├── ai/          # AI 服务封装
│   │   ├── auth/        # 认证相关
│   │   └── ...
│   └── styles/          # 全局样式
├── prisma/              # 数据库模型
├── public/              # 静态资源
└── docs/                # 项目文档
```

## 🎮 游戏列表

1. **专注追光** - 训练视觉注意力和手眼协调
2. **配对大师** - 增强工作记忆
3. **快速匹配** - 提升反应速度
4. **逻辑谜题** - 锻炼逻辑推理（开发中）
5. **空间旋转** - 提升空间想象力（开发中）

## 🚢 部署

### Vercel 部署（推荐）

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署

```bash
vercel
```

### Docker 部署

```bash
# 构建镜像
docker build -t brain-training .

# 运行容器
docker run -p 3000:3000 --env-file .env.local brain-training
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 设计灵感来自 Duolingo 和 Airbnb
- AI 服务支持来自 OpenAI 兼容 API
- 社区贡献者们的宝贵建议

---

**注意**：请确保在部署前将所有 `your-xxx` 占位符替换为实际的配置值。
