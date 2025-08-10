#!/usr/bin/env node

/**
 * 功能测试脚本
 * 验证核心功能是否正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始功能测试...\n');

// 测试结果
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: '✅ 通过' });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: '❌ 失败', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// 1. 测试游戏引擎文件是否存在
test('游戏引擎核心文件存在', () => {
  const enginePath = path.join(__dirname, '../src/lib/game-engine/core.ts');
  if (!fs.existsSync(enginePath)) {
    throw new Error('GameEngine 核心文件不存在');
  }
});

// 2. 测试 Repository 文件是否存在
test('Repository 基类存在', () => {
  const repoPath = path.join(__dirname, '../src/lib/data/repositories/base.ts');
  if (!fs.existsSync(repoPath)) {
    throw new Error('Repository 基类文件不存在');
  }
});

// 3. 测试 Zustand Store 文件
test('用户状态管理存在', () => {
  const storePath = path.join(__dirname, '../src/lib/stores/user-store.ts');
  if (!fs.existsSync(storePath)) {
    throw new Error('用户 Store 文件不存在');
  }
});

// 4. 测试数据分析页面
test('数据分析页面存在', () => {
  const analysisPath = path.join(__dirname, '../src/app/analysis/page.tsx');
  if (!fs.existsSync(analysisPath)) {
    throw new Error('数据分析页面不存在');
  }
});

// 5. 测试订阅页面
test('订阅页面存在', () => {
  const subscribePath = path.join(__dirname, '../src/app/subscribe/page.tsx');
  if (!fs.existsSync(subscribePath)) {
    throw new Error('订阅页面不存在');
  }
});

// 6. 测试游戏结果组件
test('游戏结果组件包含付费转化', () => {
  const resultPath = path.join(__dirname, '../src/components/GameResult.tsx');
  const content = fs.readFileSync(resultPath, 'utf-8');
  
  if (!content.includes('renderPaymentPrompt')) {
    throw new Error('游戏结果组件未包含付费转化功能');
  }
  
  if (!content.includes('你已经超越了 95% 的玩家')) {
    throw new Error('缺少高分付费提示');
  }
});

// 7. 测试新手教程功能
test('追光游戏包含新手教程', () => {
  const gamePath = path.join(__dirname, '../src/app/games/tracklight/page.tsx');
  const content = fs.readFileSync(gamePath, 'utf-8');
  
  if (!content.includes('showTutorial')) {
    throw new Error('追光游戏未包含新手教程');
  }
});

// 8. 测试环境变量占位符
test('环境变量已使用占位符', () => {
  const envPath = path.join(__dirname, '../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  
  // 检查是否包含真实密钥
  const sensitivePatterns = [
    /sk-[a-zA-Z0-9]{40,}/,  // OpenAI key pattern
    /AIza[a-zA-Z0-9]{35}/,  // Google API key pattern
    /[a-f0-9]{64}/          // Generic API key pattern
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      throw new Error('环境变量文件包含敏感信息，应使用占位符');
    }
  }
  
  if (!content.includes('your-')) {
    throw new Error('环境变量未使用占位符格式');
  }
});

// 9. 测试文档文件
test('更新日志存在', () => {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    throw new Error('CHANGELOG.md 不存在');
  }
});

test('Claude 思考文档存在', () => {
  const claudePath = path.join(__dirname, '../Claude.md');
  if (!fs.existsSync(claudePath)) {
    throw new Error('Claude.md 不存在');
  }
});

// 10. 测试 TypeScript 类型
test('TypeScript 配置正确', () => {
  const tsconfigPath = path.join(__dirname, '../tsconfig.json');
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  
  if (!tsconfig.compilerOptions.strict) {
    throw new Error('TypeScript 未启用严格模式');
  }
});

// 输出测试结果
console.log('\n📊 测试结果汇总:');
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📝 总计: ${results.tests.length}\n`);

if (results.failed > 0) {
  console.log('❌ 失败的测试:');
  results.tests
    .filter(t => t.status.includes('失败'))
    .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
  process.exit(1);
} else {
  console.log('🎉 所有测试通过！');
}

// 功能验证建议
console.log('\n📋 手动测试建议:');
console.log('1. 启动开发服务器: npm run dev');
console.log('2. 访问首页，检查是否正常加载');
console.log('3. 尝试玩一个游戏，查看新手教程');
console.log('4. 完成游戏，查看结果页面的付费提示');
console.log('5. 访问订阅页面，检查价格展示');
console.log('6. 访问数据分析页面（需要先登录）');
console.log('7. 检查 Zustand DevTools 中的状态管理');