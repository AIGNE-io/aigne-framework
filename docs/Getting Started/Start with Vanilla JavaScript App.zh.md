# 用于原生 JavaScript 应用开发

AIGNE Framework 支持在任意 JavaScript 项目中集成和使用，助力快速构建 AIGNE 应用。

## 安装 AIGNE Framework

在您的项目中安装 AIGNE Framework，可以选择以下任意一种包管理工具：

- 使用 npm

```shell
npm install @aigne/core
```

- 使用 pnpm

```shell
pnpm install @aigne/core
```

- 使用 yarn

```shell
yarn add @aigne/core
```

## 使用 AIGNE Framework

以下示例展示了如何使用 AIGNE Framework 创建和运行一个简单的问答机器人。

### 创建问答机器人

使用 AIGNE Framework 构建智能问答机器人：

```javascript
import { LLMAgent, OpenaiLLMModel, Runtime } from "@aigne/core";

const agent = LLMAgent.create({
  context: new Runtime({
    llmModel: new OpenaiLLMModel({
      model: "gpt-4o-mini",
      apiKey: "YOUR_OPENAI_API_KEY",
    }),
  }),
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

### 运行问答机器人

通过调用 `agent.run` 方法，您可以运行问答机器人并获得结果：

```javascript
const result = await agent.run({ question: "hello, I am Bob" });

console.log(result.$text); // 输出: "Hello, Bob!"
```

### 使用流式模式提升用户体验

AIGNE Framework 支持流式模式，可以实时输出响应内容：

```javascript
const result = await agent.run(
  { question: "hello, I am Bob" },
  { stream: true }
);

for await (const message of result) {
  console.log(message.$text || "");
}
```

输出：

```shell
Hello,
Bob!
```

## 下一步

现在，您已经了解了如何在 JavaScript 项目中安装并使用 AIGNE Framework。根据您的需求，尝试扩展功能，构建更复杂的智能应用吧！
