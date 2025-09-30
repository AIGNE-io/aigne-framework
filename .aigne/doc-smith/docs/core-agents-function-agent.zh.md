# Function Agent

`FunctionAgent` 提供了一种将标准 JavaScript 或 TypeScript 函数直接包装为功能齐全的 AIGNE Agent 的简便方法。它作为一个轻量级桥梁，允许您将现有的业务逻辑或简单的确定性任务集成到 AIGNE 生态系统中，而无需创建专用的 Agent 类。

您可以将其视为一种快速创建专用工具的方法，供其他更复杂的 Agent（如 [AIAgent](./core-agents-ai-agent.md)）使用。如果您有一个函数用于计算值、从特定来源获取数据或执行任何单一、明确定义的操作，那么 `FunctionAgent` 是理想的选择。

## 基本用法

创建 `FunctionAgent` 的最简单方法是将您的函数直接传递给 `FunctionAgent.from()` 静态方法。

### 示例：创建一个简单的问候 Agent

假设您有一个生成问候语的函数。您可以用一行代码将其转换为一个 Agent。

```javascript Function Agent Example icon=logos:javascript
import { FunctionAgent } from '@aigne/core';

// 从一个简单的函数创建一个 Agent
const agent = FunctionAgent.from(({ name }: { name: string }) => {
  return {
    greeting: `Hello, ${name}!`,
  };
});

// 调用 Agent
const result = await agent.invoke({ name: "Alice" });

console.log(result); 
// 输出: { greeting: "Hello, Alice!" }
```

在此示例中，AIGNE 会自动包装所提供的函数。当您 `invoke` 该 Agent 时，它会使用您提供的输入执行您的函数并返回结果。

## 配置和模式

为了实现更精细的控制，您可以提供一个配置对象，其中包含名称、描述以及用于输入和输出验证的模式。

定义模式是一种最佳实践，因为它可以确保您的 Agent 接收到预期的数据并生成一致的输出格式。当 `FunctionAgent` 被其他 Agent 用作工具时，这一点尤为重要。

### 示例：一个带验证的加法器 Agent

此示例创建一个将两个数字相加的 Agent。它使用 Zod 模式来确保输入是数字，并且输出也是一个数字。

```javascript Agent with Schemas icon=logos:javascript
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

const adderAgent = FunctionAgent.from({
  name: 'adder',
  description: 'Adds two numbers together.',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  outputSchema: z.object({
    sum: z.number(),
  }),
  process: ({ a, b }) => {
    return { sum: a + b };
  },
});

const result = await adderAgent.invoke({ a: 5, b: 10 });

console.log(result); 
// 输出: { sum: 15 }

// 这将无法通过验证并抛出错误：
// await adderAgent.invoke({ a: 5, b: 'ten' });
```

## 流式响应

`FunctionAgent` 不局限于简单的请求-响应模式。它完全支持流式传输，这对于长时间运行的任务或希望增量返回数据的情况非常有用。

您可以通过两种方式实现这一点：返回一个 `ReadableStream` 或使用异步生成器。

### 使用异步生成器

使用 `async function*` (异步生成器) 通常是创建流最直观的方式。您可以在数据块可用时 `yield` 它们。

```javascript Streaming with Async Generator icon=logos:javascript
import { FunctionAgent, textDelta } from '@aigne/core';

const streamingAgent = FunctionAgent.from(async function* ({ name }: { name: string }) {
  yield textDelta({ text: "Hello" });
  yield textDelta({ text: ", " });
  yield textDelta({ text: name });
  yield textDelta({ text: "!" });
});

// 使用 streaming: true 调用
const stream = await streamingAgent.invoke({ name: "World" }, { streaming: true });

let fullText = '';
for await (const chunk of stream) {
  // 在每个数据块到达时处理它
  if (chunk.delta?.text?.text) {
    fullText += chunk.delta.text.text;
  }
}

console.log(fullText); 
// 输出: "Hello, World!"
```

## 总结

`FunctionAgent` 是一个功能强大的实用工具，可用于将自定义逻辑快速集成到 AIGNE 框架中。它简化了为特定任务创建 Agent 的过程，并完整支持数据验证和流式传输。

- **用于：** 简单的、确定性的任务或包装现有函数。
- **最佳实践：** 始终定义 `inputSchema` 和 `outputSchema` 以确保可靠性。
- **功能：** 支持单次响应和通过异步生成器实现的复杂流式传输。

现在您已经了解了如何创建功能性工具，接下来请在 [Team Agent](./core-agents-team-agent.md) 部分学习如何编排多个 Agent 以协同工作。