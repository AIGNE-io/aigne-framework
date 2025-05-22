# @aigne/core

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

[English](./README.md) | **中文**

[AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 的核心库，用于构建 AI 驱动的应用程序。

## 简介

`@aigne/core` 是 [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) 的基础组件，提供构建 AI 驱动应用程序所需的核心模块和工具。该包实现了框架的核心功能，包括代理系统、aigne 环境、模型集成和工作流模式支持。

## 特性

* **多 AI 模型支持**：内置支持 OpenAI、Gemini、Claude、Nova 等主流 AI 模型，可轻松扩展支持其他模型
* **代理系统**：强大的代理抽象，支持 AI 代理、功能代理、MCP 代理等
* **AIGNE 环境**：灵活处理代理之间的通信和工作流执行
* **工作流模式**：支持顺序、并发、路由、交接等多种工作流模式
* **MCP 协议集成**：通过模型上下文协议与外部系统无缝集成
* **TypeScript 支持**：全面的类型定义，提供出色的开发体验

## 安装

### 使用 npm

```bash
npm install @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/core
```

### 使用 pnpm

```bash
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
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// AIGNE: AIGNE Framework 的主要执行引擎
const aigne = new AIGNE({ model });

// 使用 AIGNE 调用代理
const userAgent = await aigne.invoke(agent);

// 向代理发送消息
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

## 许可证

Elastic-2.0
