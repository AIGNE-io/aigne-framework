# Function Agent

`FunctionAgent` 充当标准 JavaScript/TypeScript 函数与 AIGNE 框架之间的直接桥梁。它允许您将任何函数封装成一个功能齐全的 agent，从而能够将自定义逻辑、第三方工具或现有代码库无缝集成到您的 AI 工作流中。

这种方法为主 `Agent` 类的子类化提供了一种轻量级且高效的替代方案，使其成为以最少的样板代码创建专门的、单一用途 agent 的理想选择。

## 核心概念

`FunctionAgent` 的设计宗旨是简单。您提供一个函数，框架会将其包装在必要的 agent 结构中。这使您的函数能够参与 AIGNE 生态系统，像任何其他 agent 一样接收输入和产生输出。

主要功能包括：
- **直接函数包装：** 通过单个命令将现有函数转换为 agent。
- **模式定义：** 为函数附加输入和输出模式，以实现自动验证和类型安全。
- **异步支持：** 原生处理 `async` 函数、基于 `Promise` 的逻辑，甚至通过异步生成器（Async Generators）处理流式响应。

## 创建 Function Agent

您可以通过向 `FunctionAgent.from()` 工厂方法传递一个函数和一个可选的配置对象来创建 `FunctionAgent`。

### 基本示例

最直接的方法是包装一个现有函数。让我们创建一个执行简单计算的 agent。

首先，定义包含核心逻辑的函数：

```javascript 简单的计算器函数 icon=logos:javascript
function calculator({ a, b, operation }) {
  switch (operation) {
    case 'add':
      return { result: a + b };
    case 'subtract':
      return { result: a - b };
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}
```

现在，包装此函数以创建一个 agent。您可以在配置中直接定义输入和输出模式，以确保数据完整性。

```javascript 创建计算器 Agent icon=logos:javascript
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

const calculatorAgent = FunctionAgent.from({
  name: 'calculator',
  description: 'Performs basic arithmetic operations.',
  process: calculator,
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum(['add', 'subtract']),
  }),
  outputSchema: z.object({
    result: z.number(),
  }),
});
```

### 调用 Agent

创建后，`FunctionAgent` 可以像任何其他 agent 一样被调用。

```javascript 调用 Agent icon=logos:javascript
const response = await calculatorAgent.invoke({
  a: 10,
  b: 5,
  operation: 'add',
});

console.log(response);
```

**响应示例**

```json
{
  "result": 15
}
```

## 高级用法

`FunctionAgent` 还支持更复杂的场景，包括异步操作和流式数据。

### 异步函数

如果您的函数执行异步操作，只需将其定义为 `async` 函数。`FunctionAgent` 将自动等待 `Promise`。

以下是一个在沙盒环境中评估 JavaScript 代码的 agent 示例。

```javascript 沙盒 Agent 实现 icon=logos:javascript
import vm from "node:vm";
import { FunctionAgent } from '@aigne/core';
import { z } from 'zod';

// 核心逻辑
async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

// 创建 agent
const sandboxAgent = FunctionAgent.from({
    name: 'evaluateJs',
    description: 'This agent evaluates JavaScript code.',
    process: evaluateJs,
    inputSchema: z.object({
        code: z.string().describe("JavaScript code to evaluate"),
    }),
    outputSchema: z.object({
        result: z.any().describe("Result of the evaluated code"),
    }),
});

// 调用 agent
const { result } = await sandboxAgent.invoke({ code: '1 + 1' });
console.log(result); // 2
```

### 使用异步生成器进行流式处理

对于增量产生数据的任务，您可以使用异步生成器函数。`FunctionAgent` 会将产生的数据块流式传输给调用者。这对于长时间运行的进程或提供实时反馈特别有用。

```javascript 流式 Agent 示例 icon=logos:javascript
import { FunctionAgent, jsonDelta } from '@aigne/core';
import { z } from 'zod';

const streamingAgent = FunctionAgent.from({
  name: 'streamingCounter',
  description: 'Counts from 0 to a specified number, streaming each number.',
  inputSchema: z.object({
    count: z.number().int().positive(),
  }),
  outputSchema: z.object({
    progress: z.number(),
  }),
  process: async function* ({ count }) {
    for (let i = 0; i <= count; i++) {
      // 为每一步生成一个 JSON delta
      yield jsonDelta({ progress: i });
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
});

// 消费数据流
const stream = await streamingAgent.invoke(
    { count: 5 }, 
    { streaming: true }
);

for await (const chunk of stream) {
  console.log(chunk);
}
```

此 agent 将生成一个更新流，允许客户端在每个数字可用时立即处理，而无需等待整个序列完成。