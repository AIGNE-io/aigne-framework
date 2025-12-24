# test - 运行测试

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令
> - [run](./run.md) - 了解如何运行 agent

## 概述

`test` 命令用于在指定的 agents 目录中运行测试。它基于 Node.js 的内置测试运行器，确保 agent 的功能正确性和稳定性。

## 语法

```bash
aigne test [options]
```

## 选项

### --path, --url

- **类型**: 字符串
- **默认值**: `.` (当前目录)
- **别名**: `--url`
- **描述**: agents 目录的路径或 AIGNE 项目的 URL

支持：
- 本地路径（相对路径或绝对路径）
- HTTP/HTTPS URL

### --aigne-hub-url

- **类型**: 字符串
- **描述**: 自定义 AIGNE Hub 服务 URL
- **用途**: 用于获取远程 agent 定义或模型

## 使用示例

### 基本用法

#### 测试当前目录的 agents

```bash
aigne test
```

在当前目录查找并运行所有测试文件。

#### 测试指定路径的 agents

```bash
aigne test --path path/to/agents
```

#### 测试远程 agent

```bash
aigne test --url https://example.com/aigne-project
```

### 高级用法

#### 使用自定义 Hub

```bash
aigne test --path . --aigne-hub-url https://custom-hub.example.com
```

#### 组合选项

```bash
aigne test --path path/to/agents --aigne-hub-url https://hub.aigne.io
```

## 工作原理

### 测试执行流程

1. **路径解析**: 确定 agents 目录位置
2. **加载 AIGNE**: 加载项目配置和 agents
3. **运行测试**: 使用 Node.js 测试运行器执行测试

### 测试发现

命令会在 agent 根目录下查找测试文件，通常为：

```
agents/
├── __tests__/
│   ├── agent1.test.ts
│   └── agent2.test.ts
└── agent.yml
```

### Node.js 测试运行器

使用 Node.js 内置的 `--test` 标志：

```bash
node --test
```

这会自动发现并运行项目中的所有测试文件。

## 测试文件编写

### 基本测试结构

```typescript
// agents/__tests__/myAgent.test.ts
import { test } from 'node:test';
import assert from 'node:assert';

test('agent should respond correctly', async () => {
  const response = await agent.run({
    message: 'Hello'
  });

  assert.ok(response);
  assert.match(response, /hello/i);
});
```

### 使用 AIGNE 测试工具

```typescript
import { test, expect } from '@aigne/test-utils';

test('myAgent should handle queries', async () => {
  const result = await agent.run({
    message: 'What is 2+2?'
  });

  expect(result).toContain('4');
});
```

### 测试文件命名规范

推荐的测试文件命名：

- `*.test.ts` - TypeScript 测试
- `*.test.js` - JavaScript 测试
- `__tests__/` 目录下的所有文件

## 测试输出

### 成功示例

```bash
$ aigne test
✔ agent should respond correctly (123ms)
✔ agent should handle errors (45ms)
✔ agent should use tools (67ms)

3 tests passed
```

### 失败示例

```bash
$ aigne test
✔ agent should respond correctly (123ms)
✖ agent should handle errors (45ms)
  AssertionError: Expected response to contain 'error'

1 test passed, 1 test failed
```

## 测试场景

### 单元测试

测试单个 agent 的功能：

```typescript
test('calculator agent adds numbers', async () => {
  const result = await calculatorAgent.run({
    message: 'Add 5 and 3'
  });

  expect(result).toContain('8');
});
```

### 集成测试

测试多个 agents 或工具的集成：

```typescript
test('agent uses web search tool', async () => {
  const result = await searchAgent.run({
    message: 'Search for latest news'
  });

  expect(result).toBeDefined();
});
```

### 错误处理测试

```typescript
test('agent handles invalid input', async () => {
  const result = await agent.run({
    message: ''
  });

  expect(result).toContain('error');
});
```

## 持续集成

### 在 CI 中运行

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
          node-version: 18
      - run: npm install -g @aigne/cli
      - run: aigne test
```

### 环境变量配置

在 CI 中设置必要的环境变量：

```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## 常见问题

### 测试未找到

```
Error: No test files found
```

解决方法：
1. 确认测试文件存在
2. 检查文件命名是否符合规范
3. 确保在正确的目录运行命令

### Agent 加载失败

```
Error: Failed to load AIGNE
```

解决方法：
1. 检查 `aigne.yaml` 配置文件
2. 确认 agent 配置正确
3. 验证所有依赖已安装

### API 调用失败

测试中的 API 调用失败时：

1. 检查 API 密钥是否配置
2. 使用 mock 数据避免实际 API 调用
3. 考虑使用测试专用的 API 密钥

## 最佳实践

### 1. 使用 Mock

避免在测试中调用实际的 API：

```typescript
import { mockAgent } from '@aigne/test-utils';

test('agent with mock', async () => {
  const agent = mockAgent({
    response: 'Mocked response'
  });

  const result = await agent.run({ message: 'test' });
  expect(result).toBe('Mocked response');
});
```

### 2. 隔离测试

每个测试应该独立，不依赖其他测试：

```typescript
test('test 1', async () => {
  // 独立的测试逻辑
});

test('test 2', async () => {
  // 不依赖 test 1 的结果
});
```

### 3. 清理资源

在测试后清理创建的资源：

```typescript
import { after } from 'node:test';

after(async () => {
  // 清理测试数据
  await cleanup();
});
```

### 4. 使用描述性名称

测试名称应该清楚说明测试内容：

```typescript
// 好
test('calculator agent correctly adds two positive numbers', async () => {});

// 不好
test('test 1', async () => {});
```

## 调试测试

### 单独运行测试文件

```bash
cd path/to/agents
node --test __tests__/specific.test.ts
```

### 使用 console.log

在测试中添加日志：

```typescript
test('debug test', async () => {
  console.log('Input:', input);
  const result = await agent.run(input);
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

### 使用调试器

```bash
node --inspect-brk --test
```

然后在浏览器中打开 `chrome://inspect` 进行调试。

## 技术细节

### 源码位置

实现文件：`src/commands/test.ts:12`

关键函数：`createTestCommand()`

### 测试运行命令

实际执行的命令：

```typescript
spawnSync('node', ['--test'], {
  cwd: aigne.rootDir,
  stdio: 'inherit'
});
```

## 下一步

测试通过后，可以：

1. [eval](./eval.md) - 评估 agent 性能
2. [deploy](./deploy.md) - 部署到生产环境
3. [observe](./observe.md) - 监控 agent 运行状态

## 相关命令

- [run](./run.md) - 运行 agent 进行手动测试
- [eval](./eval.md) - 性能评估
- [create](./create.md) - 创建包含测试模板的项目

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [基本工作流程](../workflow.md#4-本地测试) - 测试在开发流程中的位置
- [Node.js 测试文档](https://nodejs.org/api/test.html) - Node.js 测试运行器文档
