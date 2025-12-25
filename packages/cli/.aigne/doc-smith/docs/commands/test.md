# test - 运行测试

`aigne test` 命令用于在指定的 Agent 目录中运行测试，支持单元测试和集成测试。

## 命令格式

```bash
aigne test [options]
```

## 参数说明

### 选项

- **`--path <path>`**：Agent 目录路径或项目 URL
  - 默认值：`.`（当前目录）
  - 别名：`--url`
- **`--aigne-hub-url <url>`**：自定义 AIGNE Hub 服务 URL
  - 用于获取远程 Agent 定义或模型

## 使用示例

### 基本用法

在当前目录运行测试：

```bash
aigne test
```

该命令会：
1. 加载当前目录的 AIGNE 配置
2. 查找测试文件
3. 使用 Node.js 测试运行器执行测试

### 指定路径

测试指定目录的 Agent：

```bash
# 相对路径
aigne test --path ./my-agent

# 绝对路径
aigne test --path /path/to/my-agent
```

### 使用自定义 Hub

指定自定义 AIGNE Hub URL：

```bash
aigne test --aigne-hub-url https://custom-hub.example.com
```

这在以下场景很有用：
- 使用企业内部 Hub
- 测试 Hub 新版本
- 在开发环境使用不同配置

## 测试文件

### 测试文件位置

AIGNE CLI 使用 Node.js 内置测试运行器，会自动发现以下位置的测试文件：

```
my-agent/
├── test/
│   ├── agent.test.js
│   └── tools.test.js
├── tests/
│   └── integration.test.js
└── **/*.test.js        # 任何位置的 .test.js 文件
```

### 测试文件命名规范

测试文件应遵循以下命名规范：
- `*.test.js`：JavaScript 测试文件
- `*.test.ts`：TypeScript 测试文件
- 建议将测试文件放在 `test/` 或 `tests/` 目录

### 示例测试文件

```javascript
// test/agent.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Agent Tests', () => {
  it('should respond correctly', async () => {
    // 测试代码
    const response = await agent.chat('Hello');
    assert.ok(response);
  });
});
```

## 测试执行流程

<!-- afs:image id="img-005" key="test-command-flow" desc="Test command execution flow: load AIGNE config → locate test files → run tests with Node.js test runner → report results" -->

`aigne test` 命令的执行流程：

1. **加载配置**：读取 `aigne.yaml` 和环境变量
2. **初始化 AIGNE**：创建 AIGNE 实例
3. **定位测试文件**：查找项目中的测试文件
4. **运行测试**：使用 Node.js `--test` 标志执行测试
5. **输出结果**：显示测试结果和统计信息

## 测试类型

### 单元测试

测试单个函数或模块：

```javascript
// test/utils.test.js
import { describe, it } from 'node:test';
import { parseMessage } from '../src/utils.js';

describe('Utils', () => {
  it('parseMessage should extract text', () => {
    const result = parseMessage({ content: 'Hello' });
    assert.equal(result, 'Hello');
  });
});
```

### 集成测试

测试 Agent 的完整交互：

```javascript
// test/integration.test.js
import { describe, it } from 'node:test';
import { createAIGNE } from '@aigne/core';

describe('Agent Integration', () => {
  it('should handle conversation', async () => {
    const aigne = await createAIGNE({ /* config */ });
    const agent = aigne.agents.chatbot;
    
    const response = await agent.chat('What is AIGNE?');
    assert.ok(response.includes('framework'));
  });
});
```

### 工具测试

测试 Agent 使用的工具：

```javascript
// test/tools.test.js
import { describe, it } from 'node:test';
import { searchTool } from '../src/tools/search.js';

describe('Search Tool', () => {
  it('should return search results', async () => {
    const results = await searchTool({ query: 'test' });
    assert.ok(Array.isArray(results));
  });
});
```

## 环境配置

### 测试环境变量

为测试创建单独的环境配置：

```
my-agent/
├── .env              # 开发环境配置
├── .env.test         # 测试环境配置
└── test/
```

`.env.test` 示例：

```env
# 测试专用的 API 密钥
OPENAI_API_KEY=test-key

# 使用测试 Hub
AIGNE_HUB_API_URL=https://test-hub.example.com

# 其他测试配置
NODE_ENV=test
```

### 加载测试配置

AIGNE CLI 会自动加载 `.env.test` 文件（如果存在）。

## 测试输出

### 成功输出

```
✔ Agent Tests > should respond correctly (15ms)
✔ Utils > parseMessage should extract text (2ms)
✔ Search Tool > should return search results (120ms)

3 tests passed
0 tests failed
Total time: 137ms
```

### 失败输出

```
✔ Agent Tests > should respond correctly (15ms)
✖ Utils > parseMessage should extract text (2ms)
  AssertionError: Expected 'Hello' but got undefined
  
✔ Search Tool > should return search results (120ms)

2 tests passed
1 test failed
Total time: 137ms
```

## 测试覆盖率

虽然 `aigne test` 命令本身不提供覆盖率报告，但您可以直接使用 Node.js 测试运行器的覆盖率功能：

```bash
# 在项目目录运行
node --test --experimental-test-coverage
```

或在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "test": "node --test",
    "test:coverage": "node --test --experimental-test-coverage"
  }
}
```

## 调试测试

### 启用详细日志

```bash
aigne test --verbose
```

### 使用 Node.js 调试器

```bash
node --inspect-brk --test
```

然后在 Chrome 浏览器中打开 `chrome://inspect` 进行调试。

### 查看 Agent 日志

在测试代码中设置日志级别：

```javascript
import { logger } from '@aigne/core';

logger.level = 'debug';
```

## 常见测试场景

### 测试 Agent 响应

```javascript
describe('Chatbot Agent', () => {
  it('should greet users', async () => {
    const response = await agent.chat('Hello');
    assert.ok(response.includes('Hi') || response.includes('Hello'));
  });
});
```

### 测试工具调用

```javascript
describe('Agent Tools', () => {
  it('should call calculator tool', async () => {
    const response = await agent.chat('What is 2 + 2?');
    assert.ok(response.includes('4'));
  });
});
```

### 测试上下文记忆

```javascript
describe('Agent Memory', () => {
  it('should remember previous messages', async () => {
    await agent.chat('My name is Alice');
    const response = await agent.chat('What is my name?');
    assert.ok(response.includes('Alice'));
  });
});
```

## 持续集成

### GitHub Actions 示例

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g @aigne/cli
      - run: npm install
      - run: aigne test
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## 常见问题

### 测试未找到

**问题**：运行 `aigne test` 时提示没有测试

**解决方案**：
- 确认测试文件使用正确的命名规范（`*.test.js`）
- 检查测试文件是否在项目目录中
- 确认测试文件包含有效的测试用例

### API 密钥问题

**问题**：测试时 API 调用失败

**解决方案**：
- 创建 `.env.test` 文件并配置测试用的 API 密钥
- 使用模拟（mock）替代真实的 API 调用
- 考虑使用测试专用的 API 密钥（额度较低）

### 测试超时

**问题**：测试运行时间过长

**解决方案**：
- 使用模拟减少实际 API 调用
- 增加测试超时时间
- 优化测试代码，减少不必要的等待

## 最佳实践

1. **隔离测试**：每个测试应该独立运行，不依赖其他测试
2. **使用模拟**：避免在测试中调用真实的外部 API
3. **快速反馈**：保持测试运行时间短，快速获得反馈
4. **清晰的断言**：使用明确的断言消息，便于理解失败原因
5. **测试边界情况**：不仅测试正常情况，也要测试异常和边界情况

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 相关主题

- [run 命令](./run.md) - 运行 Agent 进行手动测试
- [eval 命令](./eval.md) - 使用数据集进行性能评估

### 下一步

- [eval 命令](./eval.md) - 评估 Agent 性能
- [observe 命令](./observe.md) - 监控测试运行
