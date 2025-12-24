# 概览

## 简介

`@aigne/cli` 是 [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 的官方命令行工具，专为简化 AIGNE 应用的开发、测试和部署流程而设计。它提供了一套完整的命令，帮助开发者快速创建项目、运行代理、测试代码以及部署应用。

## 核心特性

### 🚀 项目创建
快速创建新的 AIGNE 项目，包含预定义的文件结构和配置模板，让您在几秒钟内开始开发。

### 🤖 代理运行
轻松运行和测试 AIGNE 代理，支持本地目录和远程 URL，提供交互式对话界面。

### 🧪 测试支持
内置测试命令，支持单元测试和集成测试，确保代理质量。

### 🌐 MCP 服务器
支持将代理作为 MCP（Model Context Protocol）服务器运行，方便与外部系统集成。

### 📊 可观察性
内置可观察性服务器，实时监控代理运行状态和性能指标。

### 🎨 优美界面
提供精美的命令行界面，直观的用户体验，让开发过程更加愉悦。

### 🔌 多模型支持
支持多种 AI 模型提供商，包括 OpenAI、Claude、XAI 等，灵活选择适合的模型。

## 使用场景

`@aigne/cli` 适用于以下场景：

- **快速原型开发**：使用模板快速创建和验证代理想法
- **本地开发测试**：在本地环境中开发和调试代理
- **远程代理运行**：直接从 URL 运行托管的代理
- **集成开发**：将代理作为 MCP 服务暴露给其他应用
- **生产部署**：部署代理到生产环境
- **性能评估**：评估和优化代理性能
- **监控调试**：使用可观察性工具监控代理运行

## 技术信息

- **版本**: 1.59.0-beta.3
- **许可证**: Elastic-2.0
- **仓库**: [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework)
- **包管理器**: npm / yarn / pnpm
- **Node.js 支持**: 需要 Node.js 环境

## 架构概览

`@aigne/cli` 基于 yargs 构建，提供模块化的命令结构：

```
aigne
├── create      # 创建新项目
├── run         # 运行代理
├── test        # 运行测试
├── serve-mcp   # 启动 MCP 服务器
├── observe     # 启动可观察性服务
├── deploy      # 部署应用
├── hub         # AIGNE Hub 集成
└── eval        # 评估代理
```

## 生态系统

`@aigne/cli` 是 AIGNE 生态系统的一部分：

- **@aigne/core**: 核心框架
- **@aigne/agent-library**: 代理库
- **@aigne/afs**: 代理文件系统
- **@aigne/observability-api**: 可观察性 API
- **@aigne/aigne-hub**: AIGNE Hub 服务

## 下一步

- 查看 [快速开始](/getting-started.md) 了解如何安装和使用
- 浏览 [命令参考](/commands.md) 了解所有可用命令
- 探索 [使用场景](/use-cases.md) 查看实际应用示例

---

**相关链接：**
- [GitHub 仓库](https://github.com/AIGNE-io/aigne-framework)
- [NPM 包](https://www.npmjs.com/package/@aigne/cli)
- [官方网站](https://www.aigne.io/cli)
