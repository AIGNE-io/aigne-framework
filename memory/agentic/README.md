# @aigne/agentic-memory

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/agentic-memory)](https://www.npmjs.com/package/@aigne/agentic-memory)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/agentic-memory)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

Agentic memory system component for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing AI-powered memory management capabilities.

## Introduction

`@aigne/agentic-memory` is an intelligent memory system component of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing AI agent-based memory management functionality. This component uses intelligent agents to handle memory recording, retrieval, and management, providing smarter memory capabilities for AI applications.

## Features

* **Intelligent Memory Management**: Uses AI agents to manage memory recording and retrieval processes
* **Automatic Memory Updates**: Supports automatic memory update mechanisms
* **Storage Adaptation**: Compatible with multiple storage backends, including default SQLite storage
* **Memory Filtering**: Intelligent filtering and organization of memory content
* **TypeScript Support**: Complete type definitions providing an excellent development experience

## Installation

### Using npm

```bash
npm install @aigne/agentic-memory
```

### Using yarn

```bash
yarn add @aigne/agentic-memory
```

### Using pnpm

```bash
pnpm add @aigne/agentic-memory
```

## Basic Usage

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { AgenticMemory } from "@aigne/agentic-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// Create intelligent memory system
const memory = new AgenticMemory({
  storage: {
    url: "file:memory.db",
  },
  autoUpdate: true,
});

// Create AI agent with intelligent memory
const agent = AIAgent.from({
  name: "SmartAssistant",
  instructions: "You are a helpful assistant with intelligent memory capabilities.",
  memory: memory,
  inputKey: "message",
});

// Use AIGNE execution engine
const aigne = new AIGNE({ model });

// Invoke agent
const userAgent = await aigne.invoke(agent);

// Send message
const response = await userAgent.invoke({
  message: "Remember that I like to drink coffee in the morning",
});

console.log(response.message);

// Query memory later
const response2 = await userAgent.invoke({
  message: "What do you know about my morning routine?",
});

console.log(response2.message);
```

## Advanced Configuration

### Custom Storage Options

```typescript
import { AgenticMemory } from "@aigne/agentic-memory";
import { DefaultMemoryStorage } from "@aigne/default-memory";

const customStorage = new DefaultMemoryStorage({
  url: "file:custom-memory.db",
  // Other storage configurations
});

const memory = new AgenticMemory({
  storage: customStorage,
  autoUpdate: true,
});
```

### Configure Memory Agent Options

```typescript
const memory = new AgenticMemory({
  storage: {
    url: "file:memory.db",
  },
  // Custom memory recorder options
  name: "CustomMemoryAgent",
  instructions: "Custom memory management instructions",
  // Other agent configurations
});
```

## License

Elastic-2.0
