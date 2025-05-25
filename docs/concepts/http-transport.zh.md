# HTTP Transport

## 概述

HTTP Transport 是 AIGNE 框架中的一个重要组件，它允许开发者通过 HTTP 协议将 AI 代理暴露为 API 服务，并通过客户端远程调用这些代理。这种机制使得 AIGNE 代理可以轻松集成到各种应用程序中，无论是 Web 应用、移动应用还是其他服务。HTTP Transport 由两个主要部分组成：AIGNEHTTPServer 和 AIGNEHTTPClient，它们分别负责服务端和客户端的功能实现。通过 HTTP Transport，开发者可以构建分布式的 AI 应用架构，将 AI 能力作为微服务提供给多个客户端使用。

## 服务端：AIGNEHTTPServer

AIGNEHTTPServer 允许开发者将 AIGNE 实例及其代理通过 HTTP 接口暴露出去。它可以与常见的 Node.js Web 框架（如 Express）集成，提供标准的 RESTful API 接口。

### 创建代理和 AIGNE 实例

首先，我们需要创建一个命名的代理和 AIGNE 实例：

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-transport-create-named-agent"
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  name: "chatbot",
  instructions: "You are a helpful assistant",
  memory: true,
});
```

在上面的示例中，我们创建了一个名为 "chatbot" 的 AIAgent，设置了基本指令，并启用了记忆功能。

接下来，我们创建一个 AIGNE 实例，并将代理添加到实例中：

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-transport-create-aigne"
import { AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
  agents: [agent],
});
```

在这个示例中，我们创建了一个 AIGNE 实例，指定了 OpenAIChatModel 作为语言模型，并将之前创建的代理添加到实例中。

### 创建 HTTP 服务器

有了 AIGNE 实例后，我们可以创建一个 HTTP 服务器来暴露代理的功能：

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-transport-create-http-server"
import { AIGNEHTTPServer } from "@aigne/transport/http-server/index.js";
import express from "express";

const server = new AIGNEHTTPServer(aigne);

const app = express();

app.post("/api/chat", async (req, res) => {
  const userId = "user_123"; // Example user ID, replace with actual logic to get user ID
  await server.invoke(req, res, { userContext: { userId } });
});

const port = 3000;

const httpServer = app.listen(port);
```

在这个示例中，我们：

1. 创建了一个 AIGNEHTTPServer 实例，传入 AIGNE 实例
2. 创建了一个 Express 应用
3. 定义了一个 POST 路由 "/api/chat"，使用 server.invoke 方法处理请求
4. 检测可用端口并启动 HTTP 服务器

这样，我们的 AI 代理就可以通过 HTTP 接口被访问了。客户端可以向 "/api/chat" 端点发送 POST 请求，指定要调用的代理名称和输入消息。

## 客户端：AIGNEHTTPClient

AIGNEHTTPClient 提供了一个简单的客户端接口，用于远程调用通过 AIGNEHTTPServer 暴露的代理。它封装了 HTTP 请求的细节，使开发者可以像调用本地代理一样调用远程代理。

### 创建 HTTP 客户端

要创建一个 HTTP 客户端，我们需要指定服务器的 URL：

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-client-create-client"
import { AIGNEHTTPClient } from "@aigne/transport/http-client/index.js";

const client = new AIGNEHTTPClient({
  url: `http://localhost:${port}/api/chat`,
});
```

在这个示例中，我们创建了一个 AIGNEHTTPClient 实例，指定了服务器的 URL。

### 调用远程代理

创建客户端后，我们可以使用 invoke 方法调用远程代理：

```ts file="../../docs-examples/test/concepts/http-transport.test.ts" region="example-http-client-invoke-agent"
const result = await client.invoke(
  "chatbot",
  "What is the crypto price of ABT/USD on coinbase?",
);
console.log(result);
// Output: { $message: "The current price of ABT/USD on Coinbase is $0.9684." }
```

在这个示例中，我们：

1. 调用了名为 "chatbot" 的远程代理
2. 发送了一个问题作为输入
3. 接收并打印了代理的响应

客户端的 invoke 方法接受两个参数：代理名称和输入消息。它会将这些参数发送到服务器，服务器会调用相应的代理处理请求，然后将结果返回给客户端。

## 使用场景

HTTP Transport 适用于多种场景，包括：

1. **微服务架构**：将 AI 代理作为独立的微服务部署，供多个应用程序使用
2. **前后端分离**：在后端部署 AI 代理，前端通过 HTTP 调用代理功能
3. **跨平台集成**：允许不同平台（Web、移动、桌面等）的应用程序访问相同的 AI 能力
4. **负载均衡**：部署多个 AI 代理服务实例，通过负载均衡器分发请求
5. **API 网关**：将 AI 代理集成到 API 网关中，提供统一的访问入口

## 总结

HTTP Transport 是 AIGNE 框架中连接服务端和客户端的桥梁，它提供了：

1. **服务端组件 AIGNEHTTPServer**：将 AIGNE 代理暴露为 HTTP 服务
2. **客户端组件 AIGNEHTTPClient**：提供简单的接口调用远程代理
3. **灵活集成**：与 Express 等 Web 框架无缝集成
4. **标准接口**：使用标准的 HTTP 协议，便于跨平台和跨语言集成

通过 HTTP Transport，开发者可以构建分布式的 AI 应用架构，将 AI 能力作为服务提供给多个客户端使用，实现更灵活、可扩展的应用设计。
