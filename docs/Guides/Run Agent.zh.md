# Agent 的运行

在 AIGNE Framework 中，定义好的 `Agent` 可以通过调用其 `run` 方法直接进行运行。

## 运行 Agent

首先，我们需要定义一个 `Agent` 实例。以下是相关代码示例：

```typescript
import { LLMAgent, OpenaiLLMModel, Runtime } from "@aigne/core";

const context = new Runtime({
  llmModel: new OpenaiLLMModel({
    model: "gpt-4o-mini",
    apiKey: "YOUR_OPEN_AI_API_KEY",
  }),
});

const agent = LLMAgent.create({
  context,
  inputs: {
    question: {
      type: "string",
      required: true,
    },
  },
  outputs: {
    $text: {
      type: "string",
      required: true,
    },
  },
  messages: [
    {
      role: "user",
      content: "{{question}}",
    },
  ],
});
```

### 运行 Agent

一旦 `Agent` 定义完成，我们就可以通过以下代码运行它：

```typescript
const result = await agent.run({ question: "hello, i am Bob" });

console.log(result); // 输出: { $text: "Hello, Bob! How can I help you today?" }
```

## 流式输出

`Agent` 的 `run` 方法支持流式输出。当需要启用流式输出时，可以在第二个参数中传入 `stream: true`。此时，`run` 方法将返回一个 `ReadableStream` 对象，该对象可用于流式输出数据。

以下是流式输出的代码示例：

```typescript
const result = await agent.run(
  { question: "hello, i am Bob" },
  { stream: true }
);

for await (const { $text } of result) {
  console.log($text);
}
```

运行上述代码将逐步输出结果，结果示例为：

```
Hello,
Bob!
How
can
I
help
you
today?
```

## 总结

通过 `Agent` 的 `run` 方法，用户可以方便地执行定义好的 `Agent`，并根据需求选择标准输出或流式输出。这使得 AIGNE Framework 在构建交互式应用程序时更加灵活和高效。
