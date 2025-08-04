# @aigne/core

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

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

### Using npm

```bash
npm install @aigne/core
```

### Using yarn

```bash
yarn add @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/core
```

## Basic Usage

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
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

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model });

// Use the AIGNE to invoke the agent
const userAgent = await aigne.invoke(agent);

// Send a message to the agent
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);
console.log(response);
```

## License

Elastic-2.0
