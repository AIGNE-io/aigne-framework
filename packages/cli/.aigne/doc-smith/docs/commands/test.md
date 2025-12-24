# test - 运行测试

`test` 命令用于在指定的代理目录中运行测试，验证代理功能的正确性。

## 语法

```bash
aigne test [path]
```

## 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `path` | string | 否 | `.` | 代理目录路径或 URL |

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--aigne-hub-url` | string | - | 自定义 AIGNE Hub 服务 URL |

## 使用方式

### 基本用法

在当前目录运行测试：

```bash
aigne test
```

指定目录运行测试：

```bash
aigne test ./my-agents
aigne test /path/to/agents
```

### 运行远程项目测试

从 URL 运行测试：

```bash
aigne test --url https://example.com/aigne-project
```

## 测试工作原理

`test` 命令使用 Node.js 内置的测试运行器，在代理项目的根目录执行：

```bash
node --test
```

这意味着项目中所有符合以下命名模式的文件都会被执行：
- `*.test.js`
- `*.test.mjs`
- `*.test.cjs`
- `test/*.js`
- `test/*.mjs`
- `test/*.cjs`

## 编写测试

### 测试文件结构

在项目中创建测试文件：

```
my-aigne-project/
├── agents/
│   └── myAgent.yaml
├── test/
│   ├── agent.test.js
│   └── utils.test.js
└── aigne.yaml
```

### 测试示例

```javascript
// test/agent.test.js
import { test } from 'node:test';
import assert from 'node:assert';

test('代理应该正确响应问候', async (t) => {
  const response = await runAgent('你好');
  assert.ok(response.includes('你好'));
});

test('代理应该处理错误输入', async (t) => {
  const response = await runAgent('');
  assert.ok(response !== null);
});
```

### 使用 AIGNE 测试工具

```javascript
import { test } from 'node:test';
import { loadAIGNE } from '@aigne/core';

test('测试代理功能', async (t) => {
  const aigne = await loadAIGNE({ path: '.' });
  const agent = aigne.agents[0];
  
  // 测试代理
  const result = await agent.run({ input: '测试消息' });
  assert.ok(result.success);
});
```

## 示例

### 示例 1：基本测试流程

```bash
# 创建项目
aigne create test-project
cd test-project

# 添加测试文件
mkdir test
cat > test/example.test.js << 'EOF'
import { test } from 'node:test';
import assert from 'node:assert';

test('示例测试', () => {
  assert.strictEqual(1 + 1, 2);
});
EOF

# 运行测试
aigne test
```

### 示例 2：持续集成

```bash
# 在 CI/CD 脚本中
aigne test || exit 1
```

### 示例 3：测试特定项目

```bash
# 测试多个项目
aigne test ./project1
aigne test ./project2
aigne test ./project3
```

## 测试最佳实践

### 1. 组织测试文件

将测试文件放在 `test/` 目录：

```
project/
├── agents/
├── test/
│   ├── unit/
│   │   ├── agent.test.js
│   │   └── utils.test.js
│   └── integration/
│       └── workflow.test.js
└── aigne.yaml
```

### 2. 使用描述性测试名称

```javascript
test('当用户输入问候语时，代理应该返回友好的回复', async () => {
  // 测试逻辑
});
```

### 3. 模拟外部依赖

```javascript
import { mock } from 'node:test';

test('应该调用 API', async () => {
  const mockFetch = mock.fn(() => Promise.resolve({ ok: true }));
  // 使用 mockFetch
});
```

### 4. 测试边界情况

```javascript
test('应该处理空输入', async () => {
  const result = await processInput('');
  assert.ok(result !== undefined);
});

test('应该处理超长输入', async () => {
  const longInput = 'a'.repeat(10000);
  const result = await processInput(longInput);
  assert.ok(result !== null);
});
```

## 环境配置

### 测试环境变量

创建 `.env.test` 文件用于测试：

```bash
# .env.test
OPENAI_API_KEY=test-key
LOG_LEVEL=silent
NODE_ENV=test
```

### 加载测试配置

```javascript
import { config } from 'dotenv-flow';

// 在测试文件开头加载测试配置
config({ path: '.', pattern: '.env.test' });
```

## 常见问题

### Q: 如何只运行特定的测试文件？

A: 使用 Node.js 的 `--test` 参数指定文件：

```bash
cd my-project
node --test test/specific.test.js
```

### Q: 如何查看测试覆盖率？

A: 使用 Node.js 的覆盖率工具：

```bash
cd my-project
node --test --experimental-test-coverage
```

### Q: 测试失败如何调试？

A: 启用详细日志：

```bash
cd my-project
LOG_LEVEL=debug node --test
```

### Q: 如何跳过某些测试？

A: 使用 `test.skip()`：

```javascript
import { test } from 'node:test';

test.skip('暂时跳过的测试', () => {
  // 这个测试不会运行
});
```

## 持续集成示例

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @aigne/cli
      - run: aigne test
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
test:
  image: node:18
  script:
    - npm install -g @aigne/cli
    - aigne test
  variables:
    OPENAI_API_KEY: $CI_OPENAI_API_KEY
```

## 高级测试技巧

### 异步测试

```javascript
test('异步操作测试', async () => {
  const result = await someAsyncFunction();
  assert.ok(result);
});
```

### 并行测试

Node.js 测试运行器默认并行运行测试，提高速度：

```javascript
test('测试 1', async () => { /* ... */ });
test('测试 2', async () => { /* ... */ });
// 这两个测试会并行运行
```

### 测试超时设置

```javascript
test('应该在 5 秒内完成', { timeout: 5000 }, async () => {
  await longRunningOperation();
});
```

## 下一步

- 查看 [run 命令](/commands/run.md) 了解如何运行代理
- 查看 [eval 命令](/commands/eval.md) 了解如何评估代理性能
- 阅读 AIGNE Framework 测试文档了解更多测试技巧

---

**相关命令：**
- [run](/commands/run.md) - 运行代理
- [eval](/commands/eval.md) - 评估代理性能
