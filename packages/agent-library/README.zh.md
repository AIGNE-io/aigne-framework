# @aigne/agent-library

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/agent-library)](https://www.npmjs.com/package/@aigne/agent-library)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/agent-library)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

[English](README.md) | **中文**

[AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)的代理库集合，提供预构建的代理实现。

## 简介

`@aigne/agent-library` 是 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)的代理库集合，为开发者提供预构建的代理实现。该库是基于 [@aigne/core](https://github.com/AIGNE-io/aigne-framework/tree/main/packages/core) 构建的，扩展了核心功能，使复杂工作流的编排更加简便。

## 特性

- **编排代理**：提供 OrchestratorAgent 实现，用于协调多个代理之间的工作流
- **任务并发**：支持并行执行多个任务，提高处理效率
- **计划与执行**：自动生成执行计划并逐步执行
- **结果合成**：智能合成多个步骤和任务的结果
- **TypeScript 支持**：完整的类型定义，提供优秀的开发体验

## 安装

```bash
# 使用 npm
npm install @aigne/agent-library @aigne/core

# 使用 yarn
yarn add @aigne/agent-library @aigne/core

# 使用 pnpm
pnpm add @aigne/agent-library @aigne/core
```

## 基本用法

```typescript
import { ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator";

// 创建 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 创建执行引擎
const engine = new ExecutionEngine({ model });

// 创建编排代理
const orchestrator = new OrchestratorAgent({
  name: "主编排器",
  instructions: "你是一个任务编排器，负责协调多个专业代理完成复杂任务。",
  // 配置子代理和工具...
});

// 执行编排任务
const userAgent = await engine.call(orchestrator);
const result = await userAgent.call("分析这篇文章并生成摘要和关键词");
console.log(result);
```

## 提供的代理类型

该库目前提供了一种专业化的代理实现：

- **编排代理（OrchestratorAgent）**：负责协调多个代理之间的工作，管理复杂工作流。它能够自动规划任务步骤，并在多个代理之间分配和执行任务，最后合成结果。

## 高级用法

### 创建编排工作流

```typescript
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 创建专业子代理
const researchAgent = AIAgent.from({
  name: "研究员",
  instructions: "你是一位专业研究员，负责收集和分析信息。",
  outputKey: "research",
});

const writerAgent = AIAgent.from({
  name: "作家",
  instructions: "你是一位专业作家，负责创作高质量内容。",
  outputKey: "content",
});

const editorAgent = AIAgent.from({
  name: "编辑",
  instructions: "你是一位严格的编辑，负责检查内容质量和格式。",
  outputKey: "edited",
});

// 创建编排代理
const orchestrator = new OrchestratorAgent({
  name: "工作流编排器",
  instructions: "你负责协调研究、写作和编辑流程。",
  tools: [researchAgent, writerAgent, editorAgent],
  // 可选配置
  maxIterations: 30,      // 最大迭代次数
  tasksConcurrency: 5,    // 任务并发数
});

// 使用编排代理
const engine = new ExecutionEngine({ model });
const userAgent = await engine.call(orchestrator);
const result = await userAgent.call("关于人工智能在医疗领域的应用");
console.log(result);
```

## 文档

更多详细的 API 文档和使用指南，请参考：

- [代理开发指南](../../docs/agent-development.zh.md)
- [Agent API](../../docs/apis/agent-api.zh.md)
- [AI Agent API](../../docs/apis/ai-agent-api.zh.md)

## 协议

Elastic-2.0
