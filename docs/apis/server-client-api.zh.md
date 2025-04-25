# 服务器/客户端 API

[English](./server-client-api.md) | **中文**

AIGNE 框架提供了 REST API 服务器和远程代理执行的客户端。这使您能够将代理作为 HTTP 服务暴露并从其他应用程序调用它们。

## 服务器设置

要通过 HTTP 服务器暴露您的代理，请使用 `AIGNEServer` 类与您首选的 HTTP 框架：

### Express

```typescript
import express from "express";
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { AIGNEServer } from "@aigne/core/server/server.js";

// 创建代理
const chat = AIAgent.from({
  name: "chat",
});

// 创建执行引擎
const model = new OpenAIChatModel();
const engine = new ExecutionEngine({ model, agents: [chat] });

// 创建 AIGNE 服务器
const aigneServer = new AIGNEServer(engine);

// 设置 express 服务器
const server = express();
server.use(express.json());

// 定义处理代理调用的端点
server.post("/aigne/call", async (req, res) => {
  await aigneServer.call(req, res);
});

// 启动服务器
const port = 3000;
server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
```

### Hono

```typescript
import { Hono } from "hono";
import { AIAgent, ExecutionEngine } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { AIGNEServer } from "@aigne/core/server/server.js";

// 创建代理
const chat = AIAgent.from({
  name: "chat",
});

// 创建执行引擎
const model = new OpenAIChatModel();
const engine = new ExecutionEngine({ model, agents: [chat] });

// 创建 AIGNE 服务器
const aigneServer = new AIGNEServer(engine);

// 设置 Hono 服务器
const app = new Hono();

app.post("/aigne/call", async (c) => {
  return aigneServer.call(c.req.raw);
});

export default app;
```

### 无 Web 框架

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

// 在无服务器环境中
export async function handler(request) {
  return await aigneServer.call(request);
}
```

## 客户端使用

`AIGNEClient` 类提供了一种调用远程服务器上代理的简单方式：

```typescript
import { AIGNEClient } from "@aigne/core/client/client.js";

// 创建客户端
const client = new AIGNEClient({
  url: "http://localhost:3000/aigne/call",
});

// 调用代理获取非流式响应
const response = await client.call("chat", { $message: "你好，世界！" });
console.log(response);

// 调用代理获取流式响应
const stream = await client.call("chat", { $message: "给我讲个故事" }, { streaming: true });
for await (const chunk of stream) {
  console.log(chunk);
}
```

## 流式与非流式

客户端支持流式和非流式响应：

### 非流式（默认）

```typescript
// 将完整响应作为单个对象返回
const response = await client.call("chat", { $message: "你好" });
```

### 流式

```typescript
// 返回响应块的 ReadableStream
const stream = await client.call("chat", { $message: "你好" }, { streaming: true });

// 处理流块
for await (const chunk of stream) {
  if (chunk.delta?.text?.text) {
    process.stdout.write(chunk.delta.text.text);
  }
}
