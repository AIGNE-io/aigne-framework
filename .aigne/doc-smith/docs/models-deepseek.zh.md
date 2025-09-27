# DeepSeek

将 DeepSeek 强大的开源语言模型集成到您的 Agent 中，以获得强大的编码和推理能力。`@aigne/deepseek` 包提供了与 DeepSeek API 的无缝连接，让您可以在 AIGNE 框架内利用其模型。

该集成基于与 OpenAI 兼容的 API 格式构建，如果您使用过其他类似的模型，会感到非常熟悉且易于上手。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-deepseek-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-deepseek.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-deepseek.png" alt="AIGNE DeepSeek Architecture" />
</picture>

## 设置

在使用 DeepSeek 模型之前，您需要从 [DeepSeek 平台](https://platform.deepseek.com/) 获取一个 API 密钥。获取密钥后，推荐的使用方式是将其设置为环境变量。AIGNE 框架会自动检测并使用该密钥。

```bash
export DEEPSEEK_API_KEY="your-api-key"
```

或者，您也可以在创建模型实例时直接传递 `apiKey`，如下面的示例所示。

## 安装

首先，您需要安装 `@aigne/deepseek` 包以及核心的 AIGNE 框架。

```bash NPM
npm install @aigne/deepseek @aigne/core
```

```bash Yarn
yarn add @aigne/deepseek @aigne/core
```

```bash PNPM
pnpm add @aigne/deepseek @aigne/core
```

## 基本用法

以下是一个如何使用 `DeepSeekChatModel` 从 API 获取响应的简单示例。

```typescript Basic Chat Example icon=logos:typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 密钥或使用环境变量 DEEPSEEK_API_KEY
  apiKey: "your-api-key", // 如果已在环境变量中设置，则此项为可选
  // 指定模型版本（默认为 'deepseek-chat'）
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

这段代码创建了一个聊天模型的实例，发送了一条用户消息，并打印出 AI 的响应。

**响应示例**

```json
{
  "text": "你好！我是一个由 DeepSeek 语言模型驱动的 AI 助手。",
  "model": "deepseek-chat",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

## 配置

您可以通过向 `DeepSeekChatModel` 的构造函数传递选项来进行配置。以下是主要参数：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 DeepSeek API 密钥。如果未提供，模型将查找 `DEEPSEEK_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false">
    <x-field-desc markdown>您想使用的具体 DeepSeek 模型，例如 `deepseek-chat`。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false">
    <x-field-desc markdown>DeepSeek API 的基础 URL。通常您不需要更改此项。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型 API 的附加选项，例如 `temperature`、`max_tokens` 等。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-default="0.7" data-required="false">
      <x-field-desc markdown>控制输出的随机性。较高的值（如 `0.7`）会使输出更具创造性，而较低的值则会使其更具确定性。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

## 流式响应

对于聊天机器人等更具交互性的应用，您可以在生成响应时以流式方式传输。这使您可以逐个 token 向用户显示文本，从而创建实时效果。

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText); // "你好！我是一个由 DeepSeek 语言模型驱动的 AI 助手。"
console.log(json); // { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

在此示例中，我们在 `invoke` 选项中设置了 `streaming: true`。然后，我们遍历流，检查响应的增量块，并在它们到达时构建完整的文本和元数据。

---

现在，您已准备好在您的 AIGNE 应用程序中使用 DeepSeek 的高级模型。如需更多选项，您还可以探索其他集成，例如 [OpenAI](./models-openai.md) 或统一的 [AIGNE Hub](./models-aigne-hub.md)。