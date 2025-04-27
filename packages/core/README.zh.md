# @aigne/core

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

[English](README.md) | **中文**

[AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)的核心库，用于构建 AI 驱动的应用程序。

## 简介

`@aigne/core` 是 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)的基础核心组件，提供了构建 AI 驱动应用程序所需的基本模块和工具。该包实现了框架的核心功能，包括代理系统、执行引擎、模型集成以及工作流模式支持等。

## 特性

- **多种 AI 模型支持**：内置支持 OpenAI、Gemini、Claude 等主流 AI 模型，可轻松扩展支持其他模型
- **代理系统**：强大的代理抽象，支持 AI 代理、函数代理、MCP 代理等多种类型
- **执行引擎**：灵活的执行引擎，处理代理之间的通信和工作流执行
- **工作流模式**：支持顺序、并发、路由、交接等多种工作流模式
- **MCP 协议集成**：通过模型上下文协议（Model Context Protocol）实现与外部系统的无缝集成
- **TypeScript 支持**：完善的类型定义，提供良好的开发体验

## 安装

```bash
# 使用 npm
npm install @aigne/core

# 使用 yarn
yarn add @aigne/core

# 使用 pnpm
pnpm add @aigne/core
```

## 基本用法

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 创建 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// 创建 AI 代理
const agent = AIAgent.from({
  name: "助手",
  instructions: "你是一个有帮助的助手。",
});

// 创建执行引擎
const aigne = new AIGNE({ model });

// 使用执行引擎调用代理
const userAgent = await aigne.call(agent);

// 向代理发送消息
const response = await userAgent.call("你好，能帮我写一篇短文吗？");
console.log(response);
```

## 模块结构

- `agents/`: 代理相关的实现，包括 AI 代理、函数代理、MCP 代理等
- `aigne/`: AIGNE 提供 Agents 执行环境
- `loader/`: 加载器相关功能
- `models/`: 各种 AI 模型的集成
- `prompt/`: 提示词处理相关功能
- `utils/`: 工具函数和辅助方法

## 文档

更多详细的 API 文档，请参考：

- [Agent API](../../docs/apis/agent-api.zh.md)
- [AI Agent API](../../docs/apis/ai-agent-api.zh.md)
- [Function Agent API](../../docs/apis/function-agent-api.zh.md)
- [MCP Agent API](../../docs/apis/mcp-agent-api.zh.md)
- [AIGNE API](../../docs/apis/aigne-api.zh.md)
- [服务器/客户端 API](../../docs/apis/server-client-api.zh.md)

## 协议

Elastic-2.0
