# 基本工作流程

> **前置条件**: [快速开始](./getting-started.md) - 确保已安装 AIGNE CLI 并创建了第一个项目

本文档介绍使用 AIGNE CLI 进行 AI agent 开发的典型工作流程，涵盖从项目创建到部署的完整过程。

## 工作流程概览

```
1. 创建项目
   ↓
2. 配置环境
   ↓
3. 开发 Agent
   ↓
4. 本地测试
   ↓
5. 运行与调试
   ↓
6. 性能评估
   ↓
7. 部署上线
```

## 1. 创建项目

使用 `create` 命令初始化新项目：

```bash
aigne create my-agent-project
cd my-agent-project
```

系统会提示选择项目模板，通常选择 `default` 模板即可开始。

**相关命令**: [`create`](./commands/create.md)

## 2. 配置环境

### 设置 API 密钥

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

根据使用的模型提供商配置相应的 API 密钥：

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
```

### 配置项目设置

编辑 `aigne.config.yml` 或 agent 配置文件，设置：

- 默认模型
- Agent 名称和描述
- 工具和插件
- 内存配置

## 3. 开发 Agent

### 创建 Agent 配置

在 `agents/` 目录下创建或编辑 agent 配置文件（`.yml` 或 `.yaml`）：

```yaml
name: myAgent
description: 我的第一个 AI agent
model: openai:gpt-4
tools:
  - calculator
  - web-search
memory:
  type: default
```

### 定义工具

如需自定义工具，在项目中创建工具实现：

```typescript
export const myTool = {
  name: 'my-tool',
  description: '我的自定义工具',
  parameters: {
    // 参数定义
  },
  execute: async (params) => {
    // 工具逻辑
  }
};
```

### 编写提示词

在 agent 配置中定义系统提示词和用户提示词，指导 agent 的行为。

## 4. 本地测试

### 编写测试用例

在 `agents/` 目录下创建测试文件：

```typescript
// agents/__tests__/myAgent.test.ts
import { test } from '@aigne/test-utils';

test('myAgent should respond correctly', async () => {
  const response = await agent.run({
    message: '你好'
  });

  expect(response).toContain('你好');
});
```

### 运行测试

```bash
aigne test
```

查看测试结果，确保所有测试通过：

```bash
# 运行特定测试
aigne test --path agents/__tests__/myAgent.test.ts

# 查看详细输出
aigne test --verbose
```

**相关命令**: [`test`](./commands/test.md)

## 5. 运行与调试

### 启动 Agent

```bash
# 运行默认 agent
aigne run

# 运行指定 agent
aigne run myAgent

# 使用特定模型
aigne run --model openai:gpt-4o-mini
```

### 交互式调试

在聊天循环中测试 agent 的响应：

```bash
aigne run --chat
```

输入消息与 agent 对话，观察其行为和输出。

### 启用详细日志

调试时启用详细日志输出：

```bash
aigne run --verbose
```

这将显示：
- API 调用详情
- 工具执行日志
- 内存操作记录
- 错误堆栈信息

**相关命令**: [`run`](./commands/run.md)

## 6. 性能评估

### 运行评估

使用 `eval` 命令评估 agent 性能：

```bash
aigne eval --path agents/myAgent.yml
```

### 配置评估指标

创建评估配置文件，定义评估标准：

```yaml
# eval-config.yml
metrics:
  - accuracy
  - response_time
  - cost
test_cases:
  - input: "测试输入1"
    expected: "期望输出1"
  - input: "测试输入2"
    expected: "期望输出2"
```

### 查看评估结果

评估完成后，查看生成的报告，包括：
- 准确率
- 响应时间
- API 调用成本
- 各项指标的详细分析

**相关命令**: [`eval`](./commands/eval.md)

## 7. 部署上线

### 连接到 AIGNE Hub

如使用 AIGNE Hub 进行部署，首先连接到 Hub：

```bash
aigne hub connect
```

输入 Hub 地址和凭证。

### 部署 Agent

将 agent 部署到生产环境：

```bash
aigne deploy --path agents/myAgent.yml
```

指定部署目标：

```bash
aigne deploy --endpoint https://my-deployment.example.com
```

### 作为 MCP 服务部署

将 agent 作为 MCP 服务器部署，便于集成：

```bash
aigne serve-mcp --port 3000
```

服务将在指定端口启动，外部系统可通过 MCP 协议访问 agent。

**相关命令**:
- [`deploy`](./commands/deploy.md)
- [`hub`](./commands/hub.md)
- [`serve-mcp`](./commands/serve-mcp.md)

## 可观测性

### 启动监控

在开发和生产环境中启动可观测性服务器：

```bash
aigne observe --port 7890
```

### 监控指标

通过监控界面查看：
- Agent 运行状态
- API 调用统计
- 错误日志
- 性能指标
- 成本分析

访问 `http://localhost:7890` 打开监控界面。

**相关命令**: [`observe`](./commands/observe.md)

## 团队协作

### 使用 AIGNE Hub

1. **共享 Agent**：将开发好的 agent 上传到 Hub
2. **版本管理**：管理不同版本的 agent
3. **权限控制**：设置团队成员访问权限
4. **远程运行**：从 Hub 加载并运行 agent

```bash
# 列出 Hub 中的 agents
aigne hub list

# 从 Hub 运行 agent
aigne run --url https://hub.example.com/agents/myAgent
```

### 环境管理

使用不同的环境配置：

```bash
# 开发环境
NODE_ENV=development aigne run

# 生产环境
NODE_ENV=production aigne run
```

**相关命令**: [`hub`](./commands/hub.md)

## 最佳实践

### 1. 版本控制

- 使用 Git 管理项目代码
- 将 `.env` 文件添加到 `.gitignore`
- 提交有意义的 commit 信息

### 2. 测试策略

- 为每个 agent 编写单元测试
- 创建集成测试验证工具交互
- 定期运行性能评估

### 3. 安全性

- 不要在代码中硬编码 API 密钥
- 使用环境变量管理敏感信息
- 定期轮换 API 密钥

### 4. 性能优化

- 使用合适的模型（不要总是用最贵的）
- 优化提示词以减少 token 使用
- 缓存频繁使用的结果

### 5. 监控和日志

- 在生产环境启用可观测性
- 设置告警规则
- 定期查看日志和指标

## 故障排查

### Agent 无响应

1. 检查 API 密钥是否有效
2. 验证网络连接
3. 查看日志输出（使用 `--verbose`）

### 测试失败

1. 确认测试用例的期望值正确
2. 检查 agent 配置
3. 验证工具实现

### 部署错误

1. 检查部署目标是否可达
2. 验证凭证和权限
3. 查看部署日志

## 下一步

- [命令参考](./commands.md) - 查看所有命令的详细文档
- [配置](./configuration.md) - 深入了解配置选项

## 相关文档

- [概述](./overview.md) - AIGNE CLI 核心功能
- [快速开始](./getting-started.md) - 安装和初始设置
- [命令参考](./commands.md) - 完整命令列表
