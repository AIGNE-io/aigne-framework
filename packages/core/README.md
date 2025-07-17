# @aigne/core

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

Core library of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) for building AI-powered applications.

## Introduction

`@aigne/core` is the foundation component of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing the essential modules and tools needed to build AI-driven applications. This package implements the core functionalities of the framework, including agent systems, aigne environment, model integrations, and workflow pattern support.

## Features

* **Multiple AI Model Support**: Built-in support for OpenAI, Gemini, Claude, Nova, and other mainstream AI models, easily extensible to support additional models
* **Agent System**: Powerful agent abstractions supporting AI agents, function agents, MCP agents, and more
* **AIGNE Environment**: Flexible handling communication between agents and workflow execution
* **Workflow Patterns**: Support for sequential, concurrent, routing, handoff, and other workflow patterns
* **MCP Protocol Integration**: Seamless integration with external systems through the Model Context Protocol
* **TypeScript Support**: Comprehensive type definitions providing an excellent development experience

## Installation

The AIGNE Framework depends on the core package `@aigne/core` and model packages (such as `@aigne/openai`). You can choose the appropriate installation command based on your package manager. After installation, you can start building your own Agents.

### Using npm

```bash
npm install @aigne/core

# model packages
npm install @aigne/openai
```

### Using yarn

```bash
yarn add @aigne/core

# model packages
yarn add @aigne/openai
```

### Using pnpm

```bash
pnpm add @aigne/core

# model packages
pnpm add @aigne/openai
```

### available models

```typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { BedrockChatModel } from "@aigne/bedrock";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel } from "@aigne/openai";
import { XAIChatModel } from "@aigne/xai";
```

## Basic Usage

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4o-mini",
});

// Create AI agent
  const agent = AIAgent.from({
    instructions: "You are a helpful assistant",
    inputKey: "message",
    outputKey: "text",
  });

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model });

// Use the AIGNE to invoke the agent
const response = await aigne.invoke(, agent,
  "Hello, can you help me write a short article?",
);
console.log(response);
// { text: "xxxxx"}
```

## License

Elastic-2.0
