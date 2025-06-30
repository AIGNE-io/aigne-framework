# @aigne/transport

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/transport)](https://www.npmjs.com/package/@aigne/transport)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/transport)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

[English](README.md) | **中文**

AIGNE Transport SDK，为 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 中的 AIGNE 组件之间的通信提供 HTTP 客户端和服务器实现。

## 简介

`@aigne/transport` 为 AIGNE 组件提供了一个强大的通信层，使 AI 应用程序的不同部分之间能够无缝交互。该包提供了遵循一致协议的 HTTP 客户端和服务器实现，使用 AIGNE 框架构建分布式 AI 系统变得简单。

## 特性

* **HTTP 客户端实现**：易于使用的客户端，用于与 AIGNE 服务器通信
* **HTTP 服务器实现**：灵活的服务器实现，可与流行的 Node.js 框架集成
* **框架无关**：支持 Express、Hono 和其他 Node.js HTTP 框架
* **流式响应支持**：对流式响应的一流支持
* **类型安全**：为所有 API 提供全面的 TypeScript 类型定义
* **错误处理**：健壮的错误处理机制，提供详细的错误信息
* **中间件支持**：兼容常见的 HTTP 中间件，如压缩中间件

## 安装

### 使用 npm

```bash
npm install @aigne/transport @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/transport @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/transport @aigne/core
```

## 基本用法

### 服务端用法

AIGNE HTTP 服务器可用于 Express 或 Hono 框架。

#### Express 示例

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
const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

#### Hono 示例

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
const response = await client.invoke("chat", { $message: "hello" });
console.log(response); // Output: {$message: "Hello world!"}
```

### HTTP 客户端

```typescript file="test/http-client/http-client.test.ts" region="example-aigne-client-simple"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({ url });

const response = await client.invoke("chat", { $message: "hello" });

console.log(response); // Output: {$message: "Hello world!"}
```

### 流式响应

```typescript file="test/http-client/http-client.test.ts" region="example-aigne-client-streaming"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({ url });

const stream = await client.invoke(
  "chat",
  { $message: "hello" },
  { streaming: true },
);

let text = "";
for await (const chunk of stream) {
  if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
}

console.log(text); // Output: "Hello world!"
```

## 许可证

Elastic-2.0
