# 为客户端 Agent 启用记忆

[English](./enable-memory-for-client-agent.md) | [中文](./enable-memory-for-client-agent.zh.md)

客户端 Agent 的记忆功能是 AIGNE 框架的一个重要特性，它允许在客户端本地存储和管理对话历史，**最大的特色就是保护用户隐私** - 所有记忆数据都存储在客户端本地，不会发送到服务器。

## 隐私保护特色

与传统的服务端记忆不同，客户端记忆具有以下隐私保护优势：

* **本地存储**：所有对话记忆都存储在客户端本地数据库中
* **数据不上传**：记忆数据永远不会发送到远程服务器
* **用户控制**：用户完全控制自己的记忆数据，可以随时删除或备份
* **隐私安全**：敏感对话内容不会离开用户设备

## 基本流程

### 创建服务端 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-create-agent"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
});

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});
```

**说明**：创建一个基础的 AI Agent，注意这里的 Agent **没有配置记忆功能**，因为记忆将在客户端配置。

### 启动 HTTP 服务器

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-create-server"
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";

const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  await server.invoke(req, res);
});

const port = 3000;

const httpServer = app.listen(port);
```

**说明**：启动 HTTP 服务器，为客户端提供 Agent 调用接口。服务器端不需要配置任何记忆相关的设置。

### 创建客户端连接

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-create-client"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});
```

**说明**：创建 HTTP 客户端，用于连接到远程 AIGNE 服务器。

### 配置客户端记忆并进行对话

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-invoke-agent" exclude_imports
const chatbot = await client.getAgent({
  name: "chatbot",
  memory: {
    storage: {
      url: "file:memories.sqlite3",
    },
  },
});
const result = await chatbot.invoke(
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```

**说明**：

* 通过 `client.getAgent()` 获取客户端 Agent 实例
* 在 `memory` 配置中指定本地存储路径 `file:memories.sqlite3`
* 记忆数据将存储在客户端本地的 SQLite 数据库中
* 进行第一轮对话，Agent 会记住这次交互

### 测试记忆能力

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-client-agent-memory-invoke-agent-1" exclude_imports
const result1 = await chatbot.invoke("What question did I just ask?");
console.log(result1);
// Output: { $message: "You just asked about the crypto price of ABT/USD on Coinbase." }
```

**说明**：Agent 能够记住之前的对话内容，证明记忆功能正常工作。重要的是，这些记忆数据完全存储在客户端本地。

## 记忆功能的工作原理

客户端记忆功能通过以下机制实现对话连贯性和隐私保护：

### 本地存储机制

* **SQLite 数据库**：使用本地 SQLite 数据库存储对话记忆
* **文件系统**：记忆文件存储在客户端指定的本地路径
* **会话隔离**：不同会话的记忆数据相互隔离

### 记忆检索与记录

* **检索阶段**：在发送请求前，客户端从本地数据库检索相关记忆
* **上下文构建**：将检索到的记忆作为上下文发送给服务器
* **记录阶段**：收到响应后，客户端将新的对话内容记录到本地数据库

客户端记忆功能为用户提供了一个既能保持对话连贯性，又能完全保护隐私的解决方案，是 AIGNE 框架在隐私保护方面的重要创新。
