# 命令参考

AIGNE CLI 提供了一系列命令来帮助您开发、测试、部署和管理 AIGNE 应用。本文档提供所有可用命令的概览。

## 命令列表

### 核心命令

| 命令 | 说明 | 详细文档 |
|------|------|---------|
| `create` | 创建新的 AIGNE 项目 | [详细说明](./commands/create.md) |
| `run` | 运行 Agent 并启动聊天界面 | [详细说明](./commands/run.md) |
| `test` | 运行项目中的测试 | [详细说明](./commands/test.md) |

### 服务命令

| 命令 | 说明 | 详细文档 |
|------|------|---------|
| `serve-mcp` | 将 Agent 作为 MCP 服务器启动 | [详细说明](./commands/serve-mcp.md) |
| `observe` | 启动可观测性服务器 | [详细说明](./commands/observe.md) |

### 部署与管理

| 命令 | 说明 | 详细文档 |
|------|------|---------|
| `deploy` | 部署 AIGNE 应用到指定端点 | [详细说明](./commands/deploy.md) |
| `hub` | 管理 AIGNE Hub 连接 | [详细说明](./commands/hub.md) |

### 高级命令

| 命令 | 说明 | 详细文档 |
|------|------|---------|
| `eval` | 使用数据集评估 Agent 性能 | [详细说明](./commands/eval.md) |

## 命令流程图

<!-- afs:image id="img-003" key="commands-flow" desc="AIGNE CLI commands workflow diagram showing typical usage flow: create → run/test → serve-mcp/observe → deploy, with hub management as supporting function" -->

## 全局选项

所有命令都支持以下全局选项：

- `--help`, `-h`：显示命令帮助信息
- `--version`, `-v`：显示 AIGNE CLI 版本号

某些命令还支持：

- `--verbose`：启用详细日志输出，用于调试
- `--log-level <level>`：设置日志级别（如 `debug`、`info`、`warn`、`error`）

## 使用示例

### 基本工作流

典型的开发工作流：

```bash
# 1. 创建项目
aigne create my-agent

# 2. 进入项目目录
cd my-agent

# 3. 运行 Agent
aigne run

# 4. 运行测试
aigne test

# 5. 部署应用
aigne deploy --endpoint https://my-server.com
```

### 开发调试流程

使用可观测性功能进行调试：

```bash
# 1. 启动可观测性服务器
aigne observe

# 2. 在另一个终端运行 Agent
aigne run --verbose

# 3. 在浏览器中查看运行数据
# 访问 http://localhost:7890
```

### Hub 管理流程

连接和管理 AIGNE Hub：

```bash
# 1. 连接到 Hub
aigne hub connect

# 2. 查看连接状态
aigne hub status

# 3. 列出所有 Hub
aigne hub list

# 4. 切换 Hub
aigne hub use
```

## 命令分类

### 按开发阶段分类

**项目初始化**
- [`create`](./commands/create.md)

**开发与测试**
- [`run`](./commands/run.md)
- [`test`](./commands/test.md)
- [`eval`](./commands/eval.md)
- [`observe`](./commands/observe.md)

**部署与运维**
- [`serve-mcp`](./commands/serve-mcp.md)
- [`deploy`](./commands/deploy.md)
- [`hub`](./commands/hub.md)

### 按功能分类

**Agent 运行**
- [`run`](./commands/run.md) - 交互式运行
- [`serve-mcp`](./commands/serve-mcp.md) - 服务化运行

**质量保证**
- [`test`](./commands/test.md) - 单元测试
- [`eval`](./commands/eval.md) - 性能评估
- [`observe`](./commands/observe.md) - 运行监控

**资源管理**
- [`hub`](./commands/hub.md) - Hub 连接管理
- [`deploy`](./commands/deploy.md) - 应用部署

## 获取帮助

对于任何命令，您都可以使用 `--help` 选项查看详细帮助：

```bash
aigne <command> --help
```

例如：

```bash
aigne run --help
aigne hub --help
```

## 导航

### 父主题

- [概述](./overview.md) - 返回 AIGNE CLI 概述

### 相关主题

- [快速开始](./getting-started.md) - 快速入门指南
- [配置说明](./configuration.md) - 配置选项参考

### 子文档

- [create 命令](./commands/create.md) - 创建项目
- [run 命令](./commands/run.md) - 运行 Agent
- [test 命令](./commands/test.md) - 运行测试
- [eval 命令](./commands/eval.md) - 评估 Agent
- [serve-mcp 命令](./commands/serve-mcp.md) - MCP 服务
- [observe 命令](./commands/observe.md) - 可观测性服务
- [deploy 命令](./commands/deploy.md) - 部署应用
- [hub 命令](./commands/hub.md) - Hub 管理
