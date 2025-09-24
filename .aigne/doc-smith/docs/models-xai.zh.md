# xAI (Grok)

连接到 xAI 的模型，如 Grok，它们以其独特的个性和实时信息访问能力而闻名。`@aigne/xai` 包提供了 AIGNE 框架与 xAI 语言模型之间的无缝集成，让您可以在您的 AIGNE agent 中利用其先进的 AI 功能。

该集成使用与 OpenAI 兼容的 API 格式与 xAI 模型进行交互，为开发人员提供一致且熟悉的体验。

![AIGNE xAI Integration](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-xai.png)

## 功能

- **直接 XAI API 集成**：直接连接到 xAI 的 API 服务。
- **聊天补全**：完全支持 xAI 的聊天补全模型。
- **函数调用**：内置对函数调用功能的支持。
- **流式响应**：支持流式传输，以实现响应更迅速的实时应用。
- **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。
- **一致的接口**：遵循标准的 AIGNE 框架模型接口。
- **强大的错误处理**：包含内置的错误处理和重试机制。
- **完全可配置**：提供丰富的选项以微调模型行为。

## 安装

要开始使用，您需要安装 `@aigne/xai` 包以及 `@aigne/core`。

```bash npm icon=logos:npm
npm install @aigne/xai @aigne/core
```

```bash yarn icon=logos:yarn
yarn add @aigne/xai @aigne/core
```

```bash pnpm icon=logos:pnpm
pnpm add @aigne/xai @aigne/core
```

## 配置

要使用 xAI 模型，请实例化 `XAIChatModel` 类。您需要提供您的 API 密钥，可以直接在选项中提供，也可以通过设置 `XAI_API_KEY` 环境变量来提供。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 xAI API 密钥。如果未提供，SDK 将会查找 `XAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="grok-2-latest" data-required="false">
    <x-field-desc markdown>要使用的特定 xAI 模型。默认为 `grok-2-latest`。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.x.ai/v1" data-required="false">
    <x-field-desc markdown>xAI API 的基础 URL。默认为 `https://api.x.ai/v1`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型的附加选项，例如 `temperature`、`top_p` 等。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

以下是一个如何调用模型以获取聊天补全的简单示例。

```typescript Basic Chat Completion icon=logos:typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 密钥或使用环境变量 XAI_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了，则此项为可选
  // 指定模型（默认为 'grok-2-latest'）
  model: "grok-2-latest",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### 响应示例

```json Response icon=mdi:code-json
{
  "text": "我是来自 X.AI 的 AI 助手 Grok。我在这里用一点幽默和智慧为您提供帮助！",
  "model": "grok-2-latest",
  "usage": {
    "inputTokens": 6,
    "outputTokens": 17
  }
}
```

## 流式响应

对于交互式应用，您可以在模型生成响应时以流的方式获取它。这使您可以逐个 token 显示文本，从而提供更好的用户体验。

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  apiKey: "your-api-key",
  model: "grok-2-latest",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me about yourself" }],
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

console.log("Full Text:", fullText);
console.log("Metadata:", json);
```

### 输出示例

```text Streaming Output
Full Text: 我是来自 X.AI 的 AI 助手 Grok。我在这里用一点幽默和智慧为您提供帮助！
Metadata: { model: 'grok-2-latest', usage: { inputTokens: 6, outputTokens: 17 } }
```