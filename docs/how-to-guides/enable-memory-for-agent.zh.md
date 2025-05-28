# 为 Agent 启用记忆

在对话式应用中，能够记住以前的对话内容是非常重要的功能。aigne 框架提供了简单的方式为 Agent 启用记忆能力，使其能够在多轮对话中保持上下文连贯性。本指南将介绍如何启用和使用 Agent 的记忆功能。

## 基本流程

为 Agent 启用记忆的过程非常简单：

1. **创建带记忆的 Agent** - 通过配置选项启用记忆功能
2. **进行首次对话** - 向 Agent 提供初始信息
3. **测试记忆能力** - 询问之前提供过的信息
4. **构建持续对话** - 添加新信息并验证累积记忆

让我们逐步了解每个环节的实现细节：

### 创建带有记忆功能的 Agent

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-enable-memory" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant for Crypto market analysis",
  memory: new DefaultMemory({
    storage: {
      url: `file:${memoryStoragePath}`, // Path to store memory data, such as 'file:./memory.db'
    },
  }),
});
```

**说明**：

* **持久化存储**：通过配置 `storage.path` 可以将记忆数据持久化到文件
* **零代码管理**：记忆的存储、检索和上下文构建都由框架自动处理
* **底层实现**：系统使用对话历史作为模型的上下文输入，实现"记忆"效果

### 第一轮对话 - 提供个人信息

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-1" exclude_imports
const result1 = await aigne.invoke(
  agent,
  "My name is John Doe and I like to invest in Bitcoin.",
);
console.log(result1);
// Output: { $message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }
```

**说明**：

* **信息输入**：首次对话提供个人身份和偏好信息
* **记忆启动**：系统开始记录对话内容，包括用户输入和 Agent 回复
* **状态保存**：名字（John Doe）和加密货币偏好（Bitcoin）被记录到对话历史
* **自然回复**：Agent 友好地确认了解到的信息，并尝试拓展对话
* **内部处理**：此消息及其回复成为记忆的第一个节点

### 第二轮对话 - 测试记忆能力

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-2" exclude_imports
const result2 = await aigne.invoke(
  agent,
  "What is my favorite cryptocurrency?",
);
console.log(result2);
// Output: { $message: "Your favorite cryptocurrency is Bitcoin." }
```

**说明**：

* **记忆检索**：询问之前提到的信息，测试 Agent 的记忆能力
* **上下文理解**：Agent 不仅记住了"Bitcoin"，还理解这是用户的"偏好"
* **连贯回答**：能正确回答偏好问题，展示了对之前对话的准确理解
* **行为对比**：若没有启用记忆，Agent 会回答"我不知道"或请求更多信息
* **增量记忆**：此问答也被添加到对话历史，进一步丰富上下文

### 第三轮对话 - 添加更多信息

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-3" exclude_imports
const result3 = await aigne.invoke(agent, "I've invested $5000 in Ethereum.");
console.log(result3);
// Output: { $message: "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!" }
```

**说明**：

* **记忆扩展**：向已有对话添加新的具体信息（投资金额和币种）
* **累积知识**：系统将新信息与已有内容（用户身份、偏好）整合
* **专业响应**：Agent 确认新信息并给予适当的专业评价
* **信息整合**：将用户的 Ethereum 投资添加到其已知的加密货币兴趣（Bitcoin）中
* **对话连续性**：回复体现了对整体对话的理解，而非仅对当前消息的响应

### 第四轮对话 - 进一步测试记忆能力

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent-invoke-agent-4" exclude_imports
const result4 = await aigne.invoke(
  agent,
  "How much have I invested in Ethereum?",
);
console.log(result4);
// Output: { $message: "You've invested $5000 in Ethereum." }
```

**说明**：

* **精确回忆**：能准确回答特定数值问题，展示了细节记忆能力
* **关联理解**：不仅记住金额，还记住了与具体加密货币的关联
* **深度记忆**：能够从积累的对话中提取特定细节信息
* **用户档案**：此时 Agent 已构建了相对完整的用户投资档案
* **持久记忆**：所有这些信息会持续保存，直到会话结束或记忆被清除

## 示例代码

下面的示例展示了如何创建一个带有记忆功能的 Agent，并在连续的对话中测试其记忆能力：

```ts file="../../docs-examples/test/build-first-agent.test.ts" region="example-enable-memory-for-agent"
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
    },
  }),
});

const result1 = await aigne.invoke(
  agent,
  "My name is John Doe and I like to invest in Bitcoin.",
);
console.log(result1);
// Output: { $message: "Nice to meet you, John Doe! Bitcoin is an interesting cryptocurrency to invest in. How long have you been investing in crypto? Do you have a diversified portfolio?" }

const result2 = await aigne.invoke(
  agent,
  "What is my favorite cryptocurrency?",
);
console.log(result2);
// Output: { $message: "Your favorite cryptocurrency is Bitcoin." }

const result3 = await aigne.invoke(agent, "I've invested $5000 in Ethereum.");
console.log(result3);
// Output: { $message: "Got it, you've invested $5000 in Ethereum! That's a good investment. If there's anything else you'd like to share about your crypto portfolio or have questions, feel free!" }

const result4 = await aigne.invoke(
  agent,
  "How much have I invested in Ethereum?",
);
console.log(result4);
// Output: { $message: "You've invested $5000 in Ethereum." }
```

## 记忆功能的工作原理

记忆功能通过以下机制实现对话连贯性：

1. **消息存储**：每次对话（用户输入和 Agent 回复）都被存储在内存中
2. **上下文构建**：新消息发送时，框架自动将之前的对话作为上下文提供给模型
3. **智能处理**：底层模型根据上下文理解并处理新消息，产生连贯回复
4. **记忆优化**：系统会对长对话进行优化，确保不超出模型的上下文窗口限制
