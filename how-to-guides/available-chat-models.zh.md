# 可用的聊天模型

AIGNE 框架支持多种聊天模型，允许您选择最适合您应用场景的 AI 能力。本文档提供了所有可用聊天模型的详细信息，包括安装说明、基本用法和特性概述。

## 支持的模型提供商

AIGNE 框架目前支持以下模型提供商的集成：

* [OpenAI](#openai) - GPT 系列模型
* [Anthropic](#anthropic) - Claude 系列模型
* [Google Gemini](#google-gemini) - Gemini 系列模型
* [AWS Bedrock](#aws-bedrock) - AWS 多种基础模型
* [Ollama](#ollama) - 本地自托管开源模型
* [OpenRouter](#openrouter) - 统一 API 访问多种模型
* [DeepSeek](#deepseek) - DeepSeek 模型
* [XAI](#xai) - X.AI 的 Grok 模型

## OpenAI

### 简介

`@aigne/openai` 包提供了 AIGNE 框架与 OpenAI 强大语言模型的无缝集成。通过这个包，开发者可以轻松地在 AIGNE 应用中使用 OpenAI 的 GPT 模型。

### 安装

```bash
# 使用 npm
npm install @aigne/openai @aigne/core

# 使用 yarn
yarn add @aigne/openai @aigne/core

# 使用 pnpm
pnpm add @aigne/openai @aigne/core
```

### 基本用法

```ts file="../../docs-examples/test/available-chat-models.test.ts" region="example-chat-models-openai"
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```
