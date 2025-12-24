# AIGNE CLI 概述

## 简介

AIGNE CLI 是 [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 的官方命令行工具，旨在简化 AI agent 的开发、测试和部署流程。它为开发者提供了一套强大而直观的命令，帮助快速创建项目、运行 agents、执行测试并部署应用。

<p align="center">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" alt="AIGNE Logo" width="400" />
</p>

## 核心功能

### 项目创建
快速创建新的 AIGNE 项目，包含预定义的文件结构和配置。使用交互式界面选择项目模板，自动生成必要的配置文件。

### Agent 运行
轻松运行和测试 AIGNE agents。支持：
- 本地 agent 运行
- 从远程 URL 加载和运行 agent
- 交互式聊天循环
- 指定特定 agent 运行

### 测试支持
内置测试命令，支持单元测试和集成测试。帮助确保 agent 的质量和可靠性。

### MCP 服务
将 agents 作为 MCP (Model Context Protocol) 服务器提供，便于与外部系统集成。支持自定义端口和路径配置。

### 多模型支持
支持多种 AI 模型提供商：
- OpenAI (GPT-4, GPT-4o-mini 等)
- Claude (Claude 3 系列)
- XAI (Grok 系列)
- 其他兼容 OpenAI API 的模型

### 可观测性
内置可观测性服务器，用于监控 agent 的运行数据、性能指标和调试信息。

### Hub 集成
与 AIGNE Hub 集成，支持：
- 连接到远程 Hub
- 管理凭证
- 使用远程 agents
- 切换不同的 Hub 环境

### 部署管理
提供部署命令，将 AIGNE 应用部署到指定的 endpoint，支持生产环境部署。

## 技术特性

### 交互式界面
使用 Inquirer.js 提供美观的命令行交互界面，引导用户完成各种操作。

### 模板系统
基于 Nunjucks 模板引擎，支持自定义项目模板和代码生成。

### 热重载
开发模式下支持代码热重载，提高开发效率。

### 环境配置
支持 dotenv-flow，可根据不同环境加载相应的配置文件。

### 日志系统
内置日志系统，支持多个日志级别，便于调试和问题排查。

## 架构设计

AIGNE CLI 采用模块化架构设计：

```
@aigne/cli
├── commands/          # 命令实现
│   ├── create.ts     # 项目创建
│   ├── run.ts        # Agent 运行
│   ├── test.ts       # 测试执行
│   ├── serve-mcp.ts  # MCP 服务
│   ├── eval.ts       # 性能评估
│   ├── observe.ts    # 可观测性
│   ├── hub.ts        # Hub 管理
│   ├── deploy.ts     # 部署管理
│   └── app/          # 应用管理
├── utils/            # 工具函数
├── templates/        # 项目模板
└── constants.ts      # 常量定义
```

## 适用场景

AIGNE CLI 适用于以下场景：

1. **快速原型开发**：快速创建和测试 AI agent 原型
2. **生产环境部署**：将开发好的 agent 部署到生产环境
3. **团队协作**：通过 AIGNE Hub 共享和管理 agents
4. **持续集成**：集成到 CI/CD 流程中进行自动化测试
5. **性能优化**：使用评估和可观测性工具优化 agent 性能

## 版本信息

- **当前版本**: 1.59.0-beta.3
- **Node.js 要求**: 14.x 及以上
- **许可证**: Elastic-2.0

## 下一步

- [快速开始](./getting-started.md) - 安装 AIGNE CLI 并创建第一个项目
- [基本工作流程](./workflow.md) - 了解使用 AIGNE CLI 的典型开发流程
- [命令参考](./commands.md) - 查看所有可用命令的详细说明

## 相关资源

- [AIGNE Framework 官网](https://www.aigne.io)
- [GitHub 仓库](https://github.com/AIGNE-io/aigne-framework)
- [NPM 包](https://www.npmjs.com/package/@aigne/cli)
- [问题反馈](https://github.com/AIGNE-io/aigne-framework/issues)
