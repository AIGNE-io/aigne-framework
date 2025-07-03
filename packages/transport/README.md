# @aigne/transport

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/transport)](https://www.npmjs.com/package/@aigne/transport)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/transport)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

**English** | [中文](README.zh.md)

AIGNE Transport SDK providing HTTP client and server implementations for communication between AIGNE components within the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework).

## Introduction

`@aigne/transport` provides a robust communication layer for AIGNE components, enabling seamless interaction between different parts of your AI applications. This package offers both HTTP client and server implementations that adhere to a consistent protocol, making it easy to build distributed AI systems with the AIGNE Framework.

## Features

* **HTTP Client Implementation**: Easy-to-use client for communicating with AIGNE servers
* **HTTP Server Implementation**: Flexible server implementation that integrates with popular Node.js frameworks
* **Framework Agnostic**: Supports Express, Hono, and other Node.js HTTP frameworks
* **Streaming Support**: First-class support for streaming responses
* **Type Safety**: Comprehensive TypeScript typings for all APIs
* **Error Handling**: Robust error handling with detailed error messages
* **Middleware Support**: Compatible with common HTTP middleware like compression

## Installation

### Using npm

```bash
npm install @aigne/transport @aigne/core
```

### Using yarn

```bash
yarn add @aigne/transport @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/transport @aigne/core
```

## Basic Usage

### Server Usage

You can use the AIGNE HTTP server with either Express or Hono frameworks.

#### Express Example

```typescript file="test/http-server/http-server.test.ts" region="example-aigne-server-express"
import { AIAgent, AIGNE } from "@aigne/core";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

const model = new OpenAIChatModel();

const chat = AIAgent.from({
  name: "chat",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model, agents: [chat] });

// Create an AIGNEServer instance
const aigneServer = new AIGNEHTTPServer(aigne);

// Setup the server to handle incoming requests
const server = express();
server.post("/aigne/invoke", async (req, res) => {
  await aigneServer.invoke(req, res);
});
const httpServer = server.listen(port);

// Create an AIGNEClient instance
const client = new AIGNEHTTPClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { message: "hello" });

console.log(response); // Output: {message: "Hello world!"}
```

#### Hono Example

```typescript file="test/http-server/http-server.test.ts" region="example-aigne-server-hono"
import { AIAgent, AIGNE } from "@aigne/core";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import { serve } from "bun";
import { Hono } from "hono";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

const model = new OpenAIChatModel();

const chat = AIAgent.from({
  name: "chat",
});

// AIGNE: Main execution engine of AIGNE Framework.
const aigne = new AIGNE({ model, agents: [chat] });

// Create an AIGNEServer instance
const aigneServer = new AIGNEHTTPServer(aigne);

// Setup the server to handle incoming requests
const honoApp = new Hono();
honoApp.post("/aigne/invoke", async (c) => {
  return aigneServer.invoke(c.req.raw);
});
const server = serve({ port, fetch: honoApp.fetch });

// Create an AIGNEClient instance
const client = new AIGNEHTTPClient({ url });

// Invoke the agent by client
const response = await client.invoke("chat", { message: "hello" });
console.log(response); // Output: {message: "Hello world!"}
```

### HTTP Client

```typescript file="test/http-client/http-client.test.ts" region="example-aigne-client-simple"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({ url });

const response = await client.invoke("chat", { message: "hello" });

console.log(response); // Output: {message: "Hello world!"}
```

### Streaming Responses

```typescript file="test/http-client/http-client.test.ts" region="example-aigne-client-streaming"
import { isAgentResponseDelta } from "@aigne/core";
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({ url });

const stream = await client.invoke(
  "chat",
  { message: "hello" },
  { streaming: true },
);

let text = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text?.message) text += chunk.delta.text.message;
  }
}

console.log(text); // Output: "Hello world!"
```

## License

Elastic-2.0
