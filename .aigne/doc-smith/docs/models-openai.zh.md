# OpenAI

`@aigne/openai` 包提供了与 OpenAI 模型套件的直接而强大的集成，包括用于聊天补全的强大 GPT 系列和用于图像生成的 DALL-E。本指南详细介绍了在 AIGNE 框架内安装、配置和使用这些模型的必要步骤。

有关其他模型提供商的信息，请参阅主要的[模型](./models.md)概述。

## 功能

与 OpenAI 的集成设计得非常全面，提供以下功能：

*   **直接 API 集成**：利用官方 OpenAI SDK 进行可靠通信。
*   **聊天补全**：完全支持 OpenAI 的聊天补全模型，如 `gpt-4o` 和 `gpt-4o-mini`。
*   **函数调用**：原生支持 OpenAI 的函数调用和工具使用功能。
*   **结构化输出**：能够请求和解析来自模型的 JSON 格式响应。
*   **图像生成**：可访问 DALL-E 2 和 DALL-E 3，用于根据文本提示创建图像。
*   **流式响应**：支持处理实时、分块的响应，以实现更具交互性的应用。
*   **类型安全**：为所有模型选项和 API 响应提供完整的 TypeScript 类型定义。

## 安装

首先，安装 `@aigne/openai` 包以及 `@aigne/core` 框架。选择与您的包管理器相对应的命令。

```bash icon=npm install @aigne/openai @aigne/core
npm install @aigne/openai @aigne/core
```

```bash icon=yarn add @aigne/openai @aigne/core
yarn add @aigne/openai @aigne/core
```

```bash icon=pnpm add @aigne/openai @aigne/core
pnpm add @aigne/openai @aigne/core
```

## 聊天模型 (`OpenAIChatModel`)

`OpenAIChatModel` 类是与 OpenAI 语言模型（如 GPT-4o）交互的主要接口。

### 配置

要实例化该模型，您必须提供您的 OpenAI API 密钥。这可以直接在构造函数中完成，也可以通过设置 `OPENAI_API_KEY` 环境变量来完成。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果未提供，系统将检查 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API 的可选基础 URL。这对于代理请求或使用兼容的替代端点很有用。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>用于聊天补全的特定模型，例如 `gpt-4o`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制模型行为的附加选项。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。值越低，模型越确定。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根据新词元已存在的频率对其进行惩罚。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根据新词元是否已在文本中出现过对其进行惩罚。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="确定模型是否可以并行调用多个工具。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接传递给底层 OpenAI SDK 客户端的高级选项。</x-field-desc>
  </x-field>
</x-field-group>

### 基本用法

以下示例演示了如何创建 `OpenAIChatModel` 实例并使用简单的用户消息调用它。

```typescript Basic Chat Completion icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 建议使用 OPENAI_API_KEY 环境变量。
  apiKey: "your-api-key", 
  model: "gpt-4o",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

`invoke` 方法返回一个 promise，该 promise 会解析为一个包含模型响应和使用指标的对象。

**响应示例**
```json
{
  "text": "I am a large language model, trained by Google.",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### 流式响应

对于需要实时反馈的应用，您可以在 `invoke` 方法中设置 `streaming: true` 选项来启用流式传输。这将返回一个异步迭代器，在响应块可用时产出它们。

```typescript Streaming Chat Response icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story." }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n\n--- End of Story ---");
console.log("Full text:", fullText);
```

这种方法允许您增量处理响应，非常适合聊天界面或其他交互式用例。

## 图像模型 (`OpenAIImageModel`)

`OpenAIImageModel` 类为 OpenAI 的图像生成功能（如 DALL-E 2 和 DALL-E 3）提供了一个接口。

### 配置

图像模型的配置与聊天模型类似，需要 API 密钥并允许选择模型。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果未提供，系统将检查 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API 的可选基础 URL。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>要使用的图像模型，例如 `dall-e-3`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制图像生成的附加选项。可用参数取决于所选模型。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成图像所需尺寸（例如 '1024x1024'）。"></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="图像质量，'standard' 或 'hd'（仅限 DALL-E 3）。"></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="生成图像的风格，'vivid' 或 'natural'（仅限 DALL-E 3）。"></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="要生成的图像数量。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接传递给底层 OpenAI SDK 客户端的高级选项。</x-field-desc>
  </x-field>
</x-field-group>

### 基本用法

要生成图像，请创建 `OpenAIImageModel` 的实例并使用提示调用它。

```typescript Image Generation icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";
import fs from "fs/promises";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    quality: "hd",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic cityscape with flying cars, synthwave style",
});

// 结果包含图像数据。它可以是 URL 或 base64 编码的字符串。
const firstImage = result.images[0];

if (firstImage.type === "url") {
  console.log("Image URL:", firstImage.url);
} else if (firstImage.type === "file") {
  await fs.writeFile("cityscape.png", firstImage.data, "base64");
  console.log("Image saved as cityscape.png");
}
```

**响应示例**
```json
{
  "images": [
    {
      "type": "url",
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "dall-e-3"
}
```

响应对象包含一个生成图像的数组。每个图像可以是指向托管图像的 URL，也可以是 base64 编码的文件，具体取决于从 API 请求的响应格式。

## 总结

本指南提供了在 AIGNE 框架内安装、配置和使用 OpenAI 聊天和图像模型的必要信息。通过利用 `@aigne/openai` 包，您可以将 OpenAI 的高级功能无缝集成到您的 Agent 应用中。

有关更高级的配置或故障排除，请参阅官方 [OpenAI API 文档](https://platform.openai.com/docs/api-reference)。要探索其他可用模型，请参阅[模型概述](./models-overview.md)。