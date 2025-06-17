# FunctionAgent

[English](./function-agent.md) | [中文](./function-agent.zh.md)

## 概述

FunctionAgent 是 AIGNE 框架中的一个核心组件，它允许开发者将普通函数转换为智能代理。本文档详细介绍了 FunctionAgent 的四种创建模式（基础、极简、流式和生成器）以及如何调用这些代理。FunctionAgent 的主要优势在于其灵活性和类型安全性，支持同步/异步处理、流式输出和类型推断，使开发者能够根据不同场景选择最合适的实现方式。无论是需要严格类型定义的复杂应用，还是快速原型开发，FunctionAgent 都能提供简洁而强大的解决方案。

## 创建方式

### 基础模式

在基础示例中，我们使用 FunctionAgent.from() 方法并提供相应的选项来创建一个能够获取天气信息的 Agent。这种方式创建的 Agent 涵盖了输入/输出的类型定义和处理逻辑，是最基础的创建方式。

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-basic-create-agent"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const weather = FunctionAgent.from({
  name: "getWeather",
  description: "Get the current weather for a given location.",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  outputSchema: z.object({
    $message: z.string().describe("The message from the agent."),
    temperature: z.number().describe("The current temperature in Celsius."),
  }),
  process: async ({ city }) => {
    console.log(`Fetching weather for ${city}`);
    const temperature = 25; // You can replace this with actual weather fetching logic

    return {
      $message: "Hello, I'm AIGNE!",
      temperature,
    };
  },
});
```

主要特点：

* 使用名称和描述字段来定义 Agent 的功能
* 通过输入和输出模式定义使用 zod 定义数据结构
* 实现异步处理逻辑

### 极简模式

当需要快速创建一个 Agent，而你并不需要显式定义 inputSchema、outputSchema 等时，可以使用极简模式。

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-pure-function-create-agent"
import { FunctionAgent } from "@aigne/core";

const weather = FunctionAgent.from(async ({ city }) => {
  console.log(`Fetching weather for ${city}`);

  return {
    $message: "Hello, I'm AIGNE!",
    temperature: 25,
  };
});
```

主要特点：

* 直接传递一个函数，该函数可以是同步函数、异步函数、生成器函数或返回 ReadableStream 的函数
* TypeScript 会根据传入函数自动推断输入/输出的类型
* 适合对类型严谨度要求不高或需要快速实现的场景

### 流式输出模式

在某些场景中，需要以流式的方式持续输出部分结果，例如实时获取进度、持续返回数据片段等。FunctionAgent 同样支持这种需求。

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-streaming-create-agent"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const weather = FunctionAgent.from({
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  outputSchema: z.object({
    $message: z.string().describe("The message from the agent."),
    temperature: z.number().describe("The current temperature in Celsius."),
  }),
  process: async ({ city }) => {
    console.log(`Fetching weather for ${city}`);

    return new ReadableStream({
      start(controller) {
        controller.enqueue({ delta: { text: { $message: "Hello" } } });
        controller.enqueue({ delta: { text: { $message: "," } } });
        controller.enqueue({ delta: { text: { $message: " I'm" } } });
        controller.enqueue({ delta: { text: { $message: " AIGNE" } } });
        controller.enqueue({ delta: { text: { $message: "!" } } });
        controller.enqueue({ delta: { json: { temperature: 25 } } });
        controller.close();
      },
    });
  },
});
```

主要特点：

* 处理函数返回一个 ReadableStream
* 通过流控制器将数据依次推送出去
* 适合需要逐渐返回数据、实时更新的场景

### 生成器模式

如果不想在内部直接返回 ReadableStream，可使用生成器函数（generator）在异步过程中逐步 yield 数据，从而实现流式或分段返回。

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-generator-create-agent"
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const weather = FunctionAgent.from({
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for."),
  }),
  outputSchema: z.object({
    $message: z.string().describe("The message from the agent."),
    temperature: z.number().describe("The current temperature in Celsius."),
  }),
  process: async function* ({ city }) {
    console.log(`Fetching weather for ${city}`);

    yield { delta: { text: { $message: "Hello" } } };
    yield { delta: { text: { $message: "," } } };
    yield { delta: { text: { $message: " I'm" } } };
    yield { delta: { text: { $message: " AIGNE" } } };
    yield { delta: { text: { $message: "!" } } };
    yield { delta: { json: { temperature: 25 } } };

    // Or you can return a partial result at the end
    return { temperature: 25 };
  },
});
```

主要特点：

* 使用异步生成器函数处理数据
* 通过 yield 产生新的数据块
* 可以在最后返回一个完整或部分最终结果
* 语法层面更贴近 JavaScript 函数式编程风格

## 调用方法

### 基本调用

使用调用方法即可执行创建好的智能代理。最常见的调用方式是传入参数对象，等待执行完成后获取返回结果。

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-basic-invoke"
const result = await weather.invoke({ city: "New York" });
console.log(result);
// Output: { $message: "Hello, I'm AIGNE!", temperature: 25 }
```

### 流式调用

当需要处理流式数据时，可以启用流式选项，然后使用异步迭代来逐步获取数据块，实现流式读取、分段处理的逻辑。

```ts file="../../docs-examples/test/concepts/function-agent.test.ts" region="example-agent-streaming-invoke"
import { isAgentResponseDelta } from "@aigne/core";

const stream = await weather.invoke({ city: "New York" }, { streaming: true });
let text = "";
const json = {};
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text?.$message) text += chunk.delta.text.$message;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}
console.log(text); // Output: Hello, I'm AIGNE!
console.log(json); // Output: { temperature: 25 }
```

## 总结

FunctionAgent 是 AIGNE 中一个强大且灵活的工具，为用户提供了多种创建和调用的方式，适合不同场景的需求：

1. 常规模式：显式定义输入/输出的类型和处理逻辑，适合对输入输出要求严格的场景。
2. 极简模式：用最少代码快速创建 Agent，提高开发效率。
3. 流式/生成器模式：方便处理长时间、实时或分段输出的任务。

根据实际需求，开发者可以灵活选择合适的模式来实现"函数即智能代理"。
