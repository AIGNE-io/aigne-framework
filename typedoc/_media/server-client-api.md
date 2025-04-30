# Server/Client API

**English** | [中文](./server-client-api.zh.md)

The AIGNE framework provides a REST API server and a client for remote agent execution. This allows you to expose your agents as HTTP services and invoke them from other applications.

## Server Setup

To expose your agents through an HTTP server, use the `AIGNEServer` class with your preferred HTTP framework:

### Express

```typescript
import express from "express";
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { AIGNEServer } from "@aigne/core/server/server.js";

// Create your agent
const chat = AIAgent.from({
  name: "chat",
});

// Create execution engine
const model = new OpenAIChatModel();
const engine = new ExecutionEngine({ model, agents: [chat] });

// Create AIGNE server
const aigneServer = new AIGNEServer(engine);

// Set up express server
const server = express();
server.use(express.json());

// Define endpoint to handle agent calls
server.post("/aigne/invoke", async (req, res) => {
  await aigneServer.invoke(req, res);
});

// Start server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

### Hono

```typescript
import { Hono } from "hono";
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { AIGNEServer } from "@aigne/core/server/server.js";

// Create your agent
const chat = AIAgent.from({
  name: "chat",
});

// Create execution engine
const model = new OpenAIChatModel();
const engine = new ExecutionEngine({ model, agents: [chat] });

// Create AIGNE server
const aigneServer = new AIGNEServer(engine);

// Set up Hono server
const app = new Hono();

app.post("/aigne/invoke", async (c) => {
  return await aigneServer.invoke(c.req.raw);
});

export default app;
```

### Without Web Framework

```typescript
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { AIGNEServer } from "@aigne/core/server/server.js";

const chat = AIAgent.from({
  name: "chat",
});

const model = new OpenAIChatModel();
const engine = new ExecutionEngine({ model, agents: [chat] });

const aigneServer = new AIGNEServer(engine);

// In serverless environments
export async function handler(request) {
  return await aigneServer.invoke(request);
}
```

## Client Usage

The `AIGNEClient` class provides a simple way to invoke agents on a remote server:

```typescript
import { AIGNEClient } from "@aigne/core/client/client.js";

// Create client
const client = new AIGNEClient({
  url: "http://localhost:3000/aigne/invoke",
});

// Invoke an agent with non-streaming response
const response = await client.invoke("chat", { $message: "Hello, world!" });
console.log(response);

// Invoke an agent with streaming response
const stream = await client.invoke("chat", { $message: "Tell me a story" }, { streaming: true });
for await (const chunk of stream) {
  console.log(chunk);
}
```

## Streaming vs Non-Streaming

The client supports both streaming and non-streaming responses:

### Non-Streaming (Default)

```typescript
// Returns the complete response as a single object
const response = await client.invoke("chat", { $message: "Hello" });
```

### Streaming

```typescript
// Returns a ReadableStream of response chunks
const stream = await client.invoke("chat", { $message: "Hello" }, { streaming: true });

// Process the stream chunks
for await (const chunk of stream) {
  if (chunk.delta?.text?.text) {
    process.stdout.write(chunk.delta.text.text);
  }
}
