# @aigne/core

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/core)](https://www.npmjs.com/package/@aigne/core)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/core)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

**English** | [中文](README.zh.md)

Core library of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) for building AI-powered applications.

## Introduction

`@aigne/core` is the foundation component of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing the essential modules and tools needed to build AI-driven applications. This package implements the core functionalities of the framework, including agent systems, execution engines, model integrations, and workflow pattern support.

## Features

- **Multiple AI Model Support**: Built-in support for OpenAI, Gemini, Claude, and other mainstream AI models, easily extensible to support additional models
- **Agent System**: Powerful agent abstractions supporting AI agents, function agents, MCP agents, and more
- **Execution Engine**: Flexible execution engine handling communication between agents and workflow execution
- **Workflow Patterns**: Support for sequential, concurrent, routing, handoff, and other workflow patterns
- **MCP Protocol Integration**: Seamless integration with external systems through the Model Context Protocol
- **TypeScript Support**: Comprehensive type definitions providing an excellent development experience

## Installation

```bash
# Using npm
npm install @aigne/core

# Using yarn
yarn add @aigne/core

# Using pnpm
pnpm add @aigne/core
```

## Basic Usage

```typescript
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.DEFAULT_CHAT_MODEL || "gpt-4-turbo",
});

// Create AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// Create execution engine
const engine = new ExecutionEngine({ model });

// Use the execution engine to call the agent
const userAgent = await engine.call(agent);

// Send a message to the agent
const response = await userAgent.call("Hello, can you help me write a short article?");
console.log(response);
```

## Module Structure

- `agents/`: Agent implementations, including AI agents, function agents, MCP agents, etc.
- `execution-engine/`: Execution engine implementation
- `loader/`: Loader-related functionality
- `models/`: Integration with various AI models
- `prompt/`: Prompt handling functionality
- `utils/`: Utility functions and helper methods

## Documentation

For more detailed API documentation, please refer to:

- [Agent API](../../docs/apis/agent-api.md)
- [AI Agent API](../../docs/apis/ai-agent-api.md)
- [Function Agent API](../../docs/apis/function-agent-api.md)
- [MCP Agent API](../../docs/apis/mcp-agent-api.md)
- [Execution Engine API](../../docs/apis/execution-engine-api.md)
- [Server/Client API](../../docs/apis/server-client-api.md)

## License

Elastic-2.0
