# DeepSeek

本指南介绍了如何通过 `@aigne/deepseek` 包在 AIGNE 框架内配置和使用 DeepSeek 模型。内容涵盖 API 密钥设置、模型实例化，以及标准和流式响应的示例。

`@aigne/deepseek` 包提供了与 DeepSeek API 的直接集成，以利用其强大的语言模型。它旨在与 AIGNE 框架的 `ChatModel` 接口兼容，从而确保一致的开发体验。

## 安装

首先，使用您偏好的包管理器安装必要的包。`@aigne/core` 包是一个必需的对等依赖项。

```bash tabs
npm install @aigne/deepseek @aigne/core
```

```bash tabs
yarn add @aigne/deepseek @aigne/core
```

```bash tabs
pnpm add @aigne/deepseek @aigne/core
```

## 配置

`DeepSeekChatModel` 类是与 DeepSeek 模型交互的主要接口。它扩展了 `OpenAIChatModel`，并被配置为使用 DeepSeek 特定的 API 端点和身份验证方法。

身份验证需要您的 DeepSeek API 密钥。您可以通过以下两种方式提供：

1.  **直接在构造函数中提供**：通过 `apiKey` 属性传递密钥。
2.  **环境变量**：设置 `DEEPSEEK_API_KEY` 环境变量。如果未提供 `apiKey` 属性，模型将自动使用该变量。

### 参数

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 DeepSeek API 密钥。如果未提供，客户端将查找 `DEEPSEEK_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false">
    <x-field-desc markdown>用于聊天补全的特定 DeepSeek 模型。默认为 `deepseek-chat`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型 API 的附加选项，例如 `temperature`、`top_p` 或 `max_tokens`。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false">
    <x-field-desc markdown>DeepSeek API 的基础 URL。除非您使用自定义代理，否则不应更改此项。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

配置完成后，即可使用该模型生成文本补全或流式响应。

### 基本调用

要生成标准响应，请使用 `invoke` 方法。提供一个消息列表，该方法将返回一个 Promise，该 Promise 会解析为模型的完整响应。

```typescript 基本用法 icon=logos:typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 密钥或使用环境变量 DEEPSEEK_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置，则此项为可选
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

`result` 对象包含生成的文本以及有关模型使用情况的元数据。

**响应示例**

```json
{
  "text": "Hello! I'm an AI assistant powered by DeepSeek's language model.",
  "model": "deepseek-chat",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### 流式响应

对于实时应用，您可以从模型中流式传输响应。在 `invoke` 方法的第二个参数中将 `streaming` 选项设置为 `true`。这将返回一个异步迭代器，在响应数据块可用时逐个生成它们。

```typescript 流式响应 icon=logos:typescript
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

console.log(fullText);
// Expected output: "Hello! I'm an AI assistant powered by DeepSeek's language model."

console.log(json);
// Expected output: { model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

在此示例中，代码遍历流，累积每个数据块的文本增量以构建完整响应。最后的元数据（如 Token 使用量）在最后一个数据块中提供。

## 总结

本指南涵盖了在 AIGNE 框架中安装、配置和使用 DeepSeek 模型的基本步骤。通过遵循这些说明，您可以将 DeepSeek 的聊天功能集成到您的应用程序中，以支持单轮和流式使用场景。有关更高级的配置和功能，请参阅 API 参考和文档中的其他部分。