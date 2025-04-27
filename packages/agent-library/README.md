# @aigne/agent-library

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/agent-library)](https://www.npmjs.com/package/@aigne/agent-library)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/agent-library)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

**English** | [中文](README.zh.md)

Collection of agent libraries for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing pre-built agent implementations.

## Introduction

`@aigne/agent-library` is a collection of agent libraries for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing pre-built agent implementations for developers. The library is built on top of [@aigne/core](https://github.com/AIGNE-io/aigne-framework/tree/main/packages/core), extending the core functionality to simplify complex workflow orchestration.

## Features

- **Orchestrator Agent**: Provides OrchestratorAgent implementation for coordinating workflows between multiple agents
- **Task Concurrency**: Supports parallel execution of multiple tasks to improve processing efficiency
- **Planning & Execution**: Automatically generates execution plans and executes them step by step
- **Result Synthesis**: Intelligently synthesizes results from multiple steps and tasks
- **TypeScript Support**: Complete type definitions providing an excellent development experience

## Installation

```bash
# Using npm
npm install @aigne/agent-library @aigne/core

# Using yarn
yarn add @aigne/agent-library @aigne/core

# Using pnpm
pnpm add @aigne/agent-library @aigne/core
```

## Basic Usage

```typescript
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// Create AIGNE
const aigne = new AIGNE({ model });

// Create orchestrator agent
const orchestrator = new OrchestratorAgent({
  name: "MainOrchestrator",
  instructions: "You are a task orchestrator responsible for coordinating multiple specialized agents to complete complex tasks.",
  // Configure sub-agents and tools...
});

// Execute orchestration task
const userAgent = await aigne.invoke(orchestrator);
const result = await userAgent.invoke("Analyze this article and generate a summary and keywords");
console.log(result);
```

## Provided Agent Types

The library currently provides one specialized agent implementation:

- **Orchestrator Agent (OrchestratorAgent)**: Responsible for coordinating work between multiple agents and managing complex workflows. It can automatically plan task steps, distribute and execute tasks across multiple agents, and finally synthesize the results.

## Advanced Usage

### Creating an Orchestration Workflow

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// Create specialized sub-agents
const researchAgent = AIAgent.from({
  name: "Researcher",
  instructions: "You are a professional researcher responsible for collecting and analyzing information.",
  outputKey: "research",
});

const writerAgent = AIAgent.from({
  name: "Writer",
  instructions: "You are a professional writer responsible for creating high-quality content.",
  outputKey: "content",
});

const editorAgent = AIAgent.from({
  name: "Editor",
  instructions: "You are a strict editor responsible for checking content quality and formatting.",
  outputKey: "edited",
});

// Create orchestrator agent
const orchestrator = new OrchestratorAgent({
  name: "WorkflowOrchestrator",
  instructions: "You are responsible for coordinating research, writing, and editing processes.",
  skills: [researchAgent, writerAgent, editorAgent],
  // Optional configuration
  maxIterations: 30,      // Maximum number of iterations
  tasksConcurrency: 5,    // Task concurrency
});

// Use the orchestrator agent
const aigne = new AIGNE({ model });
const userAgent = await aigne.invoke(orchestrator);
const result = await userAgent.invoke("Applications of artificial intelligence in healthcare");
console.log(result);
```

## Documentation

For more detailed API documentation and usage guides, please refer to:

- [Agent Development Guide](../../docs/agent-development.md)
- [Agent API](../../docs/apis/agent-api.md)
- [AI Agent API](../../docs/apis/ai-agent-api.md)

## License

Elastic-2.0
