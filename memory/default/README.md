# @aigne/default-memory

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/default-memory)](https://www.npmjs.com/package/@aigne/default-memory)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/default-memory)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

Default memory system component for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing SQLite-based memory storage capabilities.

## Introduction

`@aigne/default-memory` is the default memory system component of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing SQLite database-based memory storage and retrieval functionality. This component implements standard memory management interfaces and is an ideal choice for building AI applications.

## Features

* **SQLite Storage**: Uses SQLite database for reliable memory persistence
* **Memory Retrieval**: Supports similarity-based memory retrieval
* **Automatic Memory Updates**: Supports automatic memory update mechanisms
* **Memory Statistics**: Provides storage and retrieval statistics for memories
* **Flexible Configuration**: Supports custom memory retrieval count and related configurations
* **TypeScript Support**: Complete type definitions providing an excellent development experience

## Installation

### Using npm

```bash
npm install @aigne/default-memory
```

### Using yarn

```bash
yarn add @aigne/default-memory
```

### Using pnpm

```bash
pnpm add @aigne/default-memory
```

## Basic Usage

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { DefaultMemory } from "@aigne/default-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// Create default memory system
const memory = new DefaultMemory({
  storage: {
    url: "file:memory.db",
  },
  retrieveMemoryCount: 10,
  retrieveRecentMemoryCount: 5,
  autoUpdate: true,
});

// Create AI agent with memory
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant with memory capabilities.",
  memory: memory,
  inputKey: "message",
});

// Use AIGNE execution engine
const aigne = new AIGNE({ model });

// Invoke agent
const userAgent = await aigne.invoke(agent);

// Send message
const response = await userAgent.invoke({
  message: "My name is John and I work as a software developer",
});

console.log(response.message);

// Query memory later
const response2 = await userAgent.invoke({
  message: "What do you remember about me?",
});

console.log(response2.message);
```

## Advanced Configuration

### Custom Storage Configuration

```typescript
import { DefaultMemory, DefaultMemoryStorage } from "@aigne/default-memory";

// Use custom storage configuration
const memory = new DefaultMemory({
  storage: {
    url: "file:custom-memory.db",
    // Other storage configurations
  },
  retrieveMemoryCount: 20,
  retrieveRecentMemoryCount: 10,
});

// Or use custom storage instance
const customStorage = new DefaultMemoryStorage({
  url: "file:custom-memory.db",
});

const memory2 = new DefaultMemory({
  storage: customStorage,
});
```

### Configure Memory Retrieval Options

```typescript
const memory = new DefaultMemory({
  storage: {
    url: "file:memory.db",
  },
  // Set total number of memories to retrieve
  retrieveMemoryCount: 15,
  // Set number of recent memories to retrieve
  retrieveRecentMemoryCount: 8,
  // Enable auto update
  autoUpdate: true,
});
```

## Using with Multiple Agents

```typescript
import { DefaultMemory } from "@aigne/default-memory";

// Create shared memory system
const sharedMemory = new DefaultMemory({
  storage: {
    url: "file:shared-memory.db",
  },
});

// Multiple agents can share the same memory system
const agent1 = AIAgent.from({
  name: "Agent1",
  instructions: "You are assistant 1",
  memory: sharedMemory,
});

const agent2 = AIAgent.from({
  name: "Agent2",
  instructions: "You are assistant 2",
  memory: sharedMemory,
});
```

## License

Elastic-2.0
