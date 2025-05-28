# 自定义用户上下文

在多用户应用中，为不同用户维护独立的对话记忆是一个重要需求。aigne 框架提供了灵活的用户上下文机制，允许您为每个用户创建独立的会话空间，确保用户之间的对话记忆不会相互干扰。本指南将介绍如何配置和使用自定义用户上下文功能。

## 基本流程

实现自定义用户上下文的过程包括以下关键步骤：

1. **配置会话标识符** - 配置记忆存储，通过 `getSessionId` 函数定义如何从用户上下文中提取会话 ID
2. **传递用户上下文** - 在调用 Agent 时提供用户标识信息

让我们逐步了解每个环节的实现细节：

### 配置 Agent 记忆的 Session ID

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-custom-user-context-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory({
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  }),
});
```

**说明**：

* **会话隔离机制**：通过 `getSessionId` 函数定义如何从用户上下文中提取唯一的会话标识符
* **用户标识提取**：从 `userContext` 对象中获取 `userId` 字段作为会话 ID
* **存储分离**：框架会根据不同的会话 ID 在同一存储文件中维护独立的对话记录
* **灵活配置**：您可以根据业务需求使用其他字段（如 `sessionId`、`tenantId` 等）作为会话标识

### 使用用户上下文调用 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-custom-user-context-invoke-agent" exclude_imports
const result = await aigne.invoke(
  agent,
  "My name is John Doe and I like to invest in Bitcoin.",
  {
    userContext: { userId: "user_123" },
  },
);
console.log(result);
// Output: { $message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
```

**说明**：

* **上下文传递**：通过第三个参数传递包含用户标识的 `userContext` 对象
* **会话绑定**：Agent 会根据 `userId: "user_123"` 创建或访问对应的用户会话
* **记忆隔离**：此用户的对话记录将与其他用户完全隔离存储
* **标准响应**：Agent 的回复格式保持一致，用户上下文的处理对业务逻辑透明
* **持久化存储**：用户的对话记录会持久化保存，下次使用相同 `userId` 时可以继续之前的对话

## 示例代码

下面的代码展示了如何创建一个 Agent 并从用户上下文中获取会话 ID，以实现多用户隔离的记忆功能：

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-custom-user-context"
import { DefaultMemory } from "@aigne/agent-library/default-memory/index.js";
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel(),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory({
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
      getSessionId: ({ userContext }) => userContext.userId as string, // Use userId from userContext as session ID
    },
  }),
});

const result = await aigne.invoke(
  agent,
  "My name is John Doe and I like to invest in Bitcoin.",
  {
    userContext: { userId: "user_123" },
  },
);
console.log(result);
// Output: { $message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
```

## 最佳实践

* **唯一性保证**：确保会话 ID 在您的应用中是全局唯一的，避免不同用户的会话冲突
* **安全考虑**：不要在会话 ID 中包含敏感信息，使用哈希或加密的用户标识符
