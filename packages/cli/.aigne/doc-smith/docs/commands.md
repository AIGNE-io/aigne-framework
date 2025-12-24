# 命令参考

> **前置条件**:
> - [概述](../overview.md) - 了解 AIGNE CLI 的核心功能
> - [快速开始](../getting-started.md) - 安装并配置 AIGNE CLI

AIGNE CLI 提供了一整套命令来支持 AI agent 的完整开发生命周期，从项目创建、开发测试到部署上线。

## 命令概览

```bash
aigne <command> [options]
```

### 核心命令

| 命令 | 描述 | 快速示例 |
|------|------|---------|
| [`create`](./commands/create.md) | 创建新的 AIGNE 项目 | `aigne create my-project` |
| [`run`](./commands/run.md) | 运行 AIGNE agent | `aigne run` |
| [`test`](./commands/test.md) | 运行测试 | `aigne test` |

### 服务命令

| 命令 | 描述 | 快速示例 |
|------|------|---------|
| [`serve-mcp`](./commands/serve-mcp.md) | 启动 MCP 服务器 | `aigne serve-mcp --port 3000` |
| [`observe`](./commands/observe.md) | 启动可观测性服务器 | `aigne observe` |

### 评估和管理

| 命令 | 描述 | 快速示例 |
|------|------|---------|
| [`eval`](./commands/eval.md) | 评估 agent 性能 | `aigne eval myAgent --dataset data.csv` |
| [`hub`](./commands/hub.md) | 管理 AIGNE Hub 连接 | `aigne hub connect` |
| [`deploy`](./commands/deploy.md) | 部署应用 | `aigne deploy --path . --endpoint https://...` |
| [`app`](./commands/app.md) | 应用管理命令 | `aigne app agent` |

## 全局选项

所有命令都支持以下全局选项：

- `-h, --help` - 显示帮助信息
- `-v, --version` - 显示版本号

## 按功能分类

### 项目生命周期

1. **创建项目**: [`create`](./commands/create.md)
2. **开发调试**: [`run`](./commands/run.md)
3. **测试验证**: [`test`](./commands/test.md)
4. **性能评估**: [`eval`](./commands/eval.md)
5. **部署上线**: [`deploy`](./commands/deploy.md)

### 集成与服务

- **MCP 集成**: [`serve-mcp`](./commands/serve-mcp.md) - 将 agents 作为 MCP 服务提供
- **可观测性**: [`observe`](./commands/observe.md) - 监控和调试工具
- **Hub 管理**: [`hub`](./commands/hub.md) - 连接和管理远程 Hub

### 应用管理

- [`app`](./commands/app.md) - 应用程序管理相关命令集合

## 使用帮助

### 查看命令列表

```bash
aigne --help
```

### 查看特定命令帮助

```bash
aigne <command> --help
```

例如：

```bash
aigne run --help
aigne create --help
```

## 常用工作流

### 快速开始流程

```bash
# 1. 创建项目
aigne create my-agent

# 2. 进入项目目录
cd my-agent

# 3. 运行 agent
aigne run
```

### 开发测试流程

```bash
# 1. 启动可观测性服务器（可选）
aigne observe &

# 2. 运行 agent 进行开发测试
aigne run --verbose

# 3. 运行测试用例
aigne test
```

### 评估部署流程

```bash
# 1. 评估 agent 性能
aigne eval myAgent --dataset test-data.csv

# 2. 连接到 Hub（如需要）
aigne hub connect

# 3. 部署应用
aigne deploy --path . --endpoint https://my-endpoint.com
```

## 环境变量

多数命令支持通过环境变量配置，详见 [配置文档](../configuration.md)。

常用环境变量：

- `OPENAI_API_KEY` - OpenAI API 密钥
- `ANTHROPIC_API_KEY` - Anthropic API 密钥
- `XAI_API_KEY` - XAI API 密钥
- `AIGNE_HUB_API_URL` - AIGNE Hub URL
- `AIGNE_HUB_API_KEY` - AIGNE Hub API 密钥

## 命令详细文档

点击以下链接查看每个命令的详细文档：

### 核心命令
- [create](./commands/create.md) - 创建新的 AIGNE 项目和 agent 配置文件
- [run](./commands/run.md) - 运行指定路径的 AIGNE agent 并启动聊天循环
- [test](./commands/test.md) - 在指定的 agents 目录中运行测试

### 服务命令
- [serve-mcp](./commands/serve-mcp.md) - 将 agents 作为 MCP 服务器提供
- [observe](./commands/observe.md) - 启动可观测性服务器用于监控数据

### 管理命令
- [eval](./commands/eval.md) - 评估指定 agent 的性能和准确性
- [hub](./commands/hub.md) - 管理 AIGNE Hub 连接
- [deploy](./commands/deploy.md) - 将 AIGNE 应用部署到指定的 endpoint
- [app](./commands/app.md) - 应用管理相关命令

## 下一步

- [配置](../configuration.md) - 了解 AIGNE CLI 的配置选项
- [基本工作流程](../workflow.md) - 查看完整的开发工作流程

## 相关资源

- [快速开始](../getting-started.md) - 新手入门指南
- [概述](../overview.md) - AIGNE CLI 功能概览
