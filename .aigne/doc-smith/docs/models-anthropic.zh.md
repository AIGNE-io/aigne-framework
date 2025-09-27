# Anthropic (Claude)

利用 Anthropic 的 Claude 模型，该模型以其在复杂推理和创意任务中的强大性能而闻名。`@aigne/anthropic` 软件包提供了 AIGNE 框架与 Anthropic 的 Claude 语言模型之间的无缝集成，使您能够通过一致的接口轻松地将 Claude 的先进 AI 功能整合到您的 Agent 中。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-anthropic-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-anthropic.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-anthropic.png" alt="AIGNE Anthropic 集成架构" />
</picture>

## 特性

*   **Anthropic API 集成**：使用官方 SDK 直接连接到 Anthropic 的 API 服务。
*   **聊天补全**：支持 Claude 的聊天补全 API，并兼容所有可用模型。
*   **工具调用**：内置支持 Claude 的工具调用功能。
*   **流式响应**：支持流式响应，以实现更具响应性的应用。
*   **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口完全兼容。
*   **错误处理**：强大的错误处理和重试机制。
*   **全面配置**：提供广泛的配置选项，用于微调模型行为。

## 安装

首先，使用您偏好的包管理器安装必要的软件包：

```bash npm
npm install @aigne/anthropic @aigne/core
```

```bash yarn
yarn add @aigne/anthropic @aigne/core
```

```bash pnpm
pnpm add @aigne/anthropic @aigne/core
```

## 配置

在创建 `AnthropicChatModel` 实例时，您可以提供以下选项来配置其行为：

<x-field-group>
  <x-field data-name="apiKey" data-type="string">
    <x-field-desc markdown>您的 Anthropic Claude API 密钥。如果未提供，SDK 将自动查找 `ANTHROPIC_API_KEY` 或 `CLAUDE_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="claude-3-7-sonnet-latest">
    <x-field-desc markdown>您想使用的特定 Claude 模型，例如 `claude-3-haiku-20240307`。默认为 `claude-3-7-sonnet-latest`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object">
    <x-field-desc markdown>用于控制模型生成行为的附加选项。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-desc="控制随机性。值越低，模型越确定。"></x-field>
    <x-field data-name="topP" data-type="number" data-desc="核心采样。模型仅考虑具有最高概率质量的词元。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-desc="根据新词元在文本中至今的现有频率对其进行惩罚。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-desc="根据新词元是否已在文本中出现过对其进行惩罚。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-desc="是否允许模型并行调用多个工具。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-desc="底层 Anthropic SDK 的可选客户端选项，例如设置自定义超时。"></x-field>
</x-field-group>

## 基本用法

以下是如何使用 `AnthropicChatModel` 从 Claude 模型获取响应的简单示例。

```typescript Basic Chat Completion icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 直接提供 API 密钥或使用环境变量 ANTHROPIC_API_KEY 或 CLAUDE_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了，则为可选
  // 指定 Claude 模型版本（默认为 'claude-3-7-sonnet-latest'）
  model: "claude-3-haiku-20240307",
  // 配置模型行为
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

**响应示例**

```json Response Object
{
  "text": "我是 Claude，一个由 Anthropic 创建的 AI 助手。今天我能为您提供什么帮助？",
  "model": "claude-3-haiku-20240307",
  "usage": {
    "inputTokens": 8,
    "outputTokens": 15
  }
}
```

## 流式响应

对于更具交互性的应用，您可以从模型流式传输响应。这使您可以在生成的文本可用时分块接收。

```typescript Streaming Example icon=logos:typescript
import { AnthropicChatModel } from "@aigne/anthropic";
import { isAgentResponseDelta } from "@aigne/core";

const model = new AnthropicChatModel({
  apiKey: "your-api-key",
  model: "claude-3-haiku-20240307",
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

console.log(fullText);
console.log(json);
```

**输出示例**

```text Console Output
我是 Claude，一个由 Anthropic 创建的 AI 助手。今天我能为您提供什么帮助？
{ model: 'claude-3-haiku-20240307', usage: { inputTokens: 8, outputTokens: 15 } }
```

## 总结

您已经学会了如何将 Anthropic 强大的 Claude 模型集成到您的 AIGNE Agent 中。如需更多选项，您可以探索其他支持的模型。

<x-cards>
  <x-card data-title="OpenAI" data-icon="logos:openai-icon" data-href="/models/openai">集成 OpenAI 强大的 GPT 模型，包括聊天补全和 DALL-E 图像生成。</x-card>
  <x-card data-title="Google Gemini" data-icon="logos:google-gemini" data-href="/models/gemini">使用 Google 的 Gemini 系列多模态模型来处理涉及文本、图像等任务。</x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:gem" data-href="/models/aigne-hub">连接到 AIGNE Hub，以访问多个 LLM 提供商的统一代理，并简化 API 密钥管理。</x-card>
  <x-card data-title="Ollama" data-icon="lucide:laptop" data-href="/models/ollama">通过 Ollama 服务器利用在您本地机器上运行的各种开源模型。</x-card>
</x-cards>