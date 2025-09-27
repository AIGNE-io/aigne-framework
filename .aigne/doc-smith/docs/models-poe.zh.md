# Poe

`@aigne/poe` 包允许您将 Poe 平台上提供的各种 AI 模型直接集成到您的 AIGNE agents 中。Poe 充当了连接不同提供商模型的网关，此集成利用其与 OpenAI 兼容的 API，在 AIGNE 框架内提供简单且一致的体验。

这使得通过单一接口轻松切换 OpenAI 或 Anthropic 等不同模型成为可能。

## 功能

*   **简单的 API 集成**：只需最少的设置即可连接到 Poe 的服务。
*   **聊天补全**：使用 Poe 的全系列聊天模型进行对话式 AI。
*   **流式响应**：为交互式应用程序获取实时的、逐个 token 的响应。
*   **简易配置**：通过丰富的配置选项微调模型行为。
*   **一致的接口**：与标准的 AIGNE 框架模型接口无缝协作。

## 安装

要开始使用，您需要安装 Poe 包和 AIGNE 核心库。

```bash NPM icon=logos:npm
npm install @aigne/poe @aigne/core
```

```bash Yarn icon=logos:yarn
yarn add @aigne/poe @aigne/core
```

```bash PNPM icon=pnpm:pnpm
pnpm add @aigne/poe @aigne/core
```

## 配置

要连接到 Poe，您需要一个来自您 Poe 账户的 API 密钥。您可以通过设置环境变量或在配置对象中直接传递该密钥来提供它。

-   **环境变量**：在您的项目中设置 `POE_API_KEY` 环境变量。
-   **在代码中直接传递**：创建模型实例时，使用 `apiKey` 选项传递密钥。

以下是 `PoeChatModel` 的主要配置选项：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 Poe API 密钥。如果未提供，系统将查找 `POE_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-5-mini" data-required="false">
    <x-field-desc markdown>您想要使用的特定模型，例如 `claude-3-opus` 或 `gpt-4o`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型的附加选项，例如用于控制响应创造力的 `temperature`。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

以下是一个如何创建 Poe 聊天模型实例并获取响应的简单示例。

```typescript 使用 Poe 聊天模型 icon=logos:typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 密钥或使用环境变量 POE_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了，则为可选
  // 指定模型（默认为 'gpt-5-mini'）
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "你正在使用哪个模型？" }],
});

console.log(result);
```

运行此代码后，您将得到一个包含模型回复和用量详情的响应对象。

```json 示例输出 icon=mdi:code-json
{
  text: "我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。",
  model: "claude-3-opus",
  usage: {
    inputTokens: 5,
    outputTokens: 14
  }
}
```

## 流式响应

为了获得更具交互性的实时体验，您可以从模型流式传输响应。这意味着您将在文本生成时以小数据块的形式接收它，而无需等待整个响应完成。

```typescript 流式传输响应 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "你正在使用哪个模型？" }],
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
console.log(json);
```

这将在响应完成后打印其全文，然后是最终的元数据。

```text 流式输出示例
我由 Poe 提供支持，使用的是 Anthropic 的 Claude 3 Opus 模型。
{ model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

---

Poe 集成提供了一种通过单一且易于使用的接口访问多种不同模型的灵活方式。要探索其他模型提供商，您可以查看 [OpenAI](./models-openai.md) 或 [Anthropic (Claude)](./models-anthropic.md) 的文档。