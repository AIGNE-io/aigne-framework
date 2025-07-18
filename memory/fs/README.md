# @aigne/fs-memory

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/fs-memory)](https://www.npmjs.com/package/@aigne/fs-memory)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/fs-memory)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

File system memory component for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing file system-based memory storage capabilities.

## Introduction

`@aigne/fs-memory` is the file system memory component of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing local file system-based memory storage and retrieval functionality. This component stores memories as YAML files in specified directories, providing a simple and reliable memory persistence solution.

## Features

* **File System Storage**: Uses local file system for memory file storage
* **YAML Format**: Uses YAML format for memory storage, making it easy to read and edit
* **Directory Management**: Automatically creates and manages memory directory structure
* **Path Support**: Supports absolute paths, relative paths, and home directory (~) expansion
* **AI Agent Management**: Uses AI agents to handle memory recording and retrieval
* **TypeScript Support**: Complete type definitions providing an excellent development experience

## Installation

### Using npm

```bash
npm install @aigne/fs-memory
```

### Using yarn

```bash
yarn add @aigne/fs-memory
```

### Using pnpm

```bash
pnpm add @aigne/fs-memory
```

## Basic Usage

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { FSMemory } from "@aigne/fs-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// Create file system memory
const memory = new FSMemory({
  rootDir: "./memories",
});

// Create AI agent with file-based memory
const agent = AIAgent.from({
  name: "FileAssistant",
  instructions: "You are a helpful assistant with file-based memory.",
  memory: memory,
  inputKey: "message",
});

// Use AIGNE execution engine
const aigne = new AIGNE({ model });

// Invoke agent
const userAgent = await aigne.invoke(agent);

// Send message
const response = await userAgent.invoke({
  message: "Remember that I prefer working in the morning",
});

console.log(response.message);

// Query memory
const response2 = await userAgent.invoke({
  message: "What do you know about my work preferences?",
});

console.log(response2.message);
```

## Advanced Configuration

### Custom Memory Directory

```typescript
import { FSMemory } from "@aigne/fs-memory";
import { join } from "path";

// Using absolute path
const memory1 = new FSMemory({
  rootDir: "/absolute/path/to/memories",
});

// Using relative path
const memory2 = new FSMemory({
  rootDir: "./data/memories",
});

// Using home directory
const memory3 = new FSMemory({
  rootDir: "~/my-app/memories",
});

// Using dynamic path
const memory4 = new FSMemory({
  rootDir: join(process.cwd(), "memories"),
});
```

### Configure Memory Agent Options

```typescript
const memory = new FSMemory({
  rootDir: "./memories",
  // Custom memory retriever agent configuration
  retrieverOptions: {
    name: "CustomRetriever",
    instructions: "Custom retrieval instructions for file-based memory",
  },
  // Custom memory recorder agent configuration
  recorderOptions: {
    name: "CustomRecorder",
    instructions: "Custom recording instructions for file-based memory",
  },
  // Other agent configurations
  autoUpdate: true,
});
```

## Using Multiple Memory Types Together

```typescript
import { DefaultMemory } from "@aigne/default-memory";
import { FSMemory } from "@aigne/fs-memory";

// Combine multiple memory types
const agent = AIAgent.from({
  name: "MultiMemoryAgent",
  instructions: "You are an assistant with multiple memory types.",
  memory: [
    // Database memory for structured data
    new DefaultMemory({
      storage: {
        url: "file:memory.db",
      },
    }),
    // File system memory for long-term storage
    new FSMemory({
      rootDir: "./long-term-memories",
    }),
  ],
  inputKey: "message",
});
```

## Memory File Structure

FSMemory creates the following structure in the specified directory:

```
memories/
├── conversation-id-1/
│   └── memory.yaml
├── conversation-id-2/
│   └── memory.yaml
└── ...
```

Each memory file contains YAML-formatted memory data:

```yaml
- id: memory-id-1
  content: "User prefers working in the morning"
  timestamp: 2024-01-01T10:00:00Z
  metadata:
    type: "preference"
    
- id: memory-id-2
  content: "User is a software developer"
  timestamp: 2024-01-01T10:05:00Z
  metadata:
    type: "personal_info"
```

## License

Elastic-2.0
