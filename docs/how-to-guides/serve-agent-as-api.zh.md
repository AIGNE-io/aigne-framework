# 把 Agent 作为 API 提供服务

在创建 Agent 后，您可能希望将其作为 Web API 提供服务，使其可以被各种客户端应用（如网站、移动应用或桌面软件）调用。aigne 框架提供了简单的方式通过 HTTP 接口暴露 Agent，使开发者能够轻松地构建基于 AI 的服务架构。本指南将介绍如何将 Agent 作为 API 提供服务。

## 基本流程

将 Agent 作为 API 提供服务的过程包括以下步骤：

1. **配置服务端**
   * **创建 Agent** - 设置名称和功能（如记忆能力）
   * **创建 AIGNE 实例** - 注册 Agent 并配置语言模型
   * **启动 HTTP 服务器** - 创建服务端点并处理请求

2. **配置客户端**
   * **创建 HTTP 客户端** - 连接到服务端点
   * **调用 Agent 服务** - 发送请求并处理响应

这种架构使您能够将 AI 服务与前端应用分离，提高系统的可扩展性和维护性。

## 服务器端实现

让我们逐步了解服务器端的实现细节：

### 创建具有名称的 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service-create-named-agent" exclude_imports
const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
  memory: {
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  },
});
```

**说明**：

* **命名重要性**：`name` 参数为 Agent 提供唯一标识符，在多 Agent 环境中尤为重要
* **行为定义**：`instructions` 定义 Agent 的角色和行为准则
* **状态保持**：`memory` 配置启用对话记忆功能，使 Agent 能够：
  * 在多次 API 调用之间保持上下文连贯性
  * 引用之前对话中提到的信息
  * 构建持续性的用户交互体验
* **配置灵活性**：可以根据需要添加其他配置选项，如技能、工具等

### 创建 AIGNE 实例并注册 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});
```

**说明**：

* **多 Agent 管理**：`agents` 数组参数允许注册多个 Agent 到同一服务
* **服务统一性**：所有注册的 Agent 共享同一个语言模型，简化资源管理
* **扩展性**：可以轻松添加新的 Agent 到现有服务，无需重构架构
* **模型配置**：这里使用默认的 OpenAI 模型，但可以根据需要配置不同模型和参数

### 创建 HTTP 服务器

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service-create-http-server" exclude_imports
const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  const userId = "user_123"; // Example user ID, replace with actual logic to get user ID, such as `req.user.id` in a real application
  await server.invoke(req, res, { userContext: { userId } });
});

const port = 3000;

const httpServer = app.listen(port);
```

**说明**：

* **服务器创建**：`AIGNEHTTPServer` 封装了处理 Agent 请求的逻辑
* **框架集成**：与流行的 Express 框架无缝集成，便于添加中间件和其他路由
* **请求处理流程**：
  * 接收 POST 请求到 `/api/chat` 端点
  * `server.invoke` 方法自动：
    * 解析请求体中的 Agent 名称和消息内容
    * 路由请求到正确的 Agent 实例
    * 处理异步响应
    * 格式化并返回结果
* **部署灵活性**：可以根据需要配置服务器端口、路径和其他参数

### 服务器端完整示例

下面的示例展示了如何创建一个 API 服务器来提供 Agent 服务：

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-serve-agent-as-api-service"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";

const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
  memory: {
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  },
});

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});

const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  const userId = "user_123"; // Example user ID, replace with actual logic to get user ID, such as `req.user.id` in a real application
  await server.invoke(req, res, { userContext: { userId } });
});

const port = 3000;

const httpServer = app.listen(port);
```

## 客户端实现

让我们逐步了解客户端的实现细节：

### 创建 HTTP 客户端

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-aigne-http-client-create-client" exclude_imports
const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});
```

**说明**：

* **客户端配置**：`AIGNEHTTPClient` 封装了与服务器通信的所有逻辑
* **连接设置**：`url` 参数指定服务器端点地址
* **灵活性**：可以连接到本地或远程部署的 Agent 服务
* **网络抽象**：隐藏了 HTTP 通信的复杂性，提供简洁的 API 接口

### 调用 Agent 服务

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-aigne-http-client-invoke-agent" exclude_imports
const result = await client.invoke(
  "chatbot",
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```

**说明**：

* **调用方式**：`client.invoke` 方法提供与本地 Agent 调用几乎相同的接口
* **参数解析**：
  * 第一个参数 `"chatbot"` 是目标 Agent 的名称
  * 第二个参数是发送给 Agent 的消息内容
* **异步处理**：返回 Promise，需使用 `await` 等待响应
* **响应格式**：返回标准格式的响应对象，与直接调用 Agent 的结果一致
* **透明调用**：客户端应用无需了解底层 AI 模型或服务实现细节

### 客户端完整示例

下面的示例展示了如何创建一个 API 客户端来调用 Agent 服务：

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-aigne-http-client-usage"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});

const result = await client.invoke(
  "chatbot",
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```
