# @aigne/did-space-memory

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
[![NPM Version](https://img.shields.io/npm/v/@aigne/did-space-memory)](https://www.npmjs.com/package/@aigne/did-space-memory)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/did-space-memory)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

DID Spaces memory system component for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing cloud-based memory storage capabilities with DID Spaces.

## Introduction

`@aigne/did-space-memory` is the DID Spaces memory system component of [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing cloud-based memory storage and retrieval functionality using DID Spaces. This component uses decentralized storage services to provide secure and reliable memory persistence capabilities for AI applications.

## Features

* **Cloud Storage**: Uses DID Spaces for secure cloud-based memory storage
* **Decentralized**: Based on decentralized identity and storage technologies
* **Automatic Management**: Supports automatic memory file management and README generation
* **Secure Authentication**: Supports multiple authentication methods to ensure data security
* **YAML Format**: Uses YAML format for memory storage, making it easy to read and maintain
* **TypeScript Support**: Complete type definitions providing an excellent development experience

## Installation

### Using npm

```bash
npm install @aigne/did-space-memory
```

### Using yarn

```bash
yarn add @aigne/did-space-memory
```

### Using pnpm

```bash
pnpm add @aigne/did-space-memory
```

## Basic Usage

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { DIDSpacesMemory } from "@aigne/did-space-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Create AI model instance
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// Create DID Spaces memory system
const memory = new DIDSpacesMemory({
  url: process.env.DID_SPACES_URL!,
  auth: {
    authorization: process.env.DID_SPACES_AUTHORIZATION!,
  },
});

// Create AI agent with cloud-based memory
const agent = AIAgent.from({
  name: "CloudAssistant",
  instructions: "You are a helpful assistant with cloud-based memory.",
  memory: memory,
  inputKey: "message",
});

// Use AIGNE execution engine
const aigne = new AIGNE({ model });

// Invoke agent
const userAgent = await aigne.invoke(agent);

// Send message
const response = await userAgent.invoke({
  message: "I'm John, a doctor, and I like Bitcoin",
});

console.log(response.message);

// Query memory
const response2 = await userAgent.invoke({
  message: "What is my profession?",
});

console.log(response2.message);
```

## Advanced Configuration

### Custom Memory Agent Options

```typescript
import { DIDSpacesMemory } from "@aigne/did-space-memory";

const memory = new DIDSpacesMemory({
  url: process.env.DID_SPACES_URL!,
  auth: {
    authorization: process.env.DID_SPACES_AUTHORIZATION!,
  },
  // Custom memory retriever agent configuration
  retrieverOptions: {
    name: "CustomRetriever",
    instructions: "Custom retrieval instructions",
  },
  // Custom memory recorder agent configuration
  recorderOptions: {
    name: "CustomRecorder",
    instructions: "Custom recording instructions",
  },
  // Other agent configurations
  autoUpdate: true,
});
```

### Using Different Authentication Methods

```typescript
const memory1 = new DIDSpacesMemory({
  url: "https://your-did-spaces-url.com",
  auth: {
    accessToken: process.env.DID_SPACES_ACCESS_TOKEN!,
  },
});

// Using authorization header authentication
const memory2 = new DIDSpacesMemory({
  url: "https://your-did-spaces-url.com",
  auth: {
    authorization: process.env.DID_SPACES_AUTHORIZATION!,
  },
});
```

## Memory Management Features

```typescript
const client = memory.client;

// List all memory files
const memories = await client.listObjects({
  prefix: "/memories/",
});

// Read specific memory file
const memoryContent = await client.getObject({
  key: "/memories/conversation-123/memory.yaml",
});
```

## Environment Variables Configuration

Create a `.env` file and configure the following variables:

```env
DID_SPACES_URL=https://your-did-spaces-url.com
DID_SPACES_AUTHORIZATION=your-authorization-token
# Or use access token
DID_SPACES_ACCESS_TOKEN=your-access-token
```

## License

Elastic-2.0
