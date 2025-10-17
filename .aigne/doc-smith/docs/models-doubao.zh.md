# 豆包

`@aigne/doubao` 包提供了 AIGNE 框架与豆包强大的语言和图像生成模型之间的无缝集成。本指南为在您的 AIGNE 应用程序中配置和使用豆包模型提供了完整的参考。

该集成允许开发者通过 AIGNE 框架一致且统一的接口来利用豆包先进的 AI 功能。

## 安装

首先，请使用您偏好的包管理器安装必要的包。您将需要 `@aigne/core` 和豆包专用的包。

```bash
npm install @aigne/doubao @aigne/core
```

```bash
yarn add @aigne/doubao @aigne/core
```

```bash
pnpm add @aigne/doubao @aigne/core
```

## 配置

要使用豆包模型，您必须提供一个 API 密钥。该密钥可以通过以下两种方式之一进行配置，按优先级排序：

1.  **直接实例化**：在模型的构造函数中直接传递 `apiKey`。这种方法是显式的，并会覆盖任何其他配置。
2.  **环境变量**：设置 `DOUBAO_API_KEY` 环境变量。如果在构造函数中未提供密钥，模型将自动使用此变量。

```typescript "配置示例" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

// 方法 1：直接实例化
const modelWithApiKey = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
});

// 方法 2：环境变量
// 在您的 .env 文件或 shell 中设置 DOUBAO_API_KEY
// DOUBAO_API_KEY="your-doubao-api-key"
const modelFromEnv = new DoubaoChatModel();
```

豆包 API 的基础 URL 已预先配置为 `https://ark.cn-beijing.volces.com/api/v3`，但如有必要，可以通过向构造函数传递 `baseURL` 选项来覆盖它。

## 聊天模型

对于会话任务，`DoubaoChatModel` 提供了与豆包语言模型的接口。它利用了与 OpenAI 兼容的 API 结构，确保了熟悉的开发体验。

### 基本用法

要执行聊天补全，请实例化 `DoubaoChatModel` 并使用 `invoke` 方法。

```typescript "基本聊天补全" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key", // 或使用环境变量
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

**响应示例**

```json
{
  "text": "Hello! I'm an AI assistant powered by Doubao's language model.",
  "model": "doubao-seed-1-6-250615",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### 流式响应

对于实时应用，您可以从模型中流式传输响应。在 `invoke` 调用中将 `streaming` 选项设置为 `true`，并遍历生成的流以处理到达的数据块。

```typescript "流式聊天响应" icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
  model: "doubao-seed-1-6-250615",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
  },
  { streaming: true }
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在文本块到达时打印它们
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log(fullText);
console.log(json);
```

### 聊天模型参数

`DoubaoChatModel` 构造函数接受以下选项：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的豆包 API 密钥。如果未提供，将使用 `DOUBAO_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seed-1-6-250615">
    <x-field-desc markdown>要使用的特定聊天模型。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="https://ark.cn-beijing.volces.com/api/v3">
    <x-field-desc markdown>豆包 API 端点的基础 URL。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型 API 的附加选项，例如 `temperature`、`top_p` 等。这些是标准的 OpenAI 兼容参数。</x-field-desc>
  </x-field>
</x-field-group>

## 图像模型

`DoubaoImageModel` 类通过与豆包的图像模型对接来实现图像生成。

### 基本用法

实例化 `DoubaoImageModel` 并使用提示词调用 `invoke` 方法来生成图像。

```typescript "图像生成" icon=logos:typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-doubao-api-key", // 或使用环境变量
    model: "doubao-seedream-4-0-250828",
  });

  const result = await imageModel.invoke({
    prompt: "A photorealistic image of a cat programming on a laptop",
    modelOptions: {
      size: "1024x1024",
      watermark: false,
    },
  });

  console.log(result);
}

generateImage();
```

**响应示例**

```json
{
  "images": [
    {
      "type": "file",
      "data": "...", // base64 编码的图像数据
      "mimeType": "image/jpeg"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 1
  },
  "model": "doubao-seedream-4-0-250828"
}
```

### 图像模型参数

`DoubaoImageModel` 的 `invoke` 方法接受一个包含以下属性的输入对象。请注意，参数的可用性可能因模型而异。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>所需图像的文本描述。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seedream-4-0-250828">
    <x-field-desc markdown>要使用的图像模型的标识符。</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnion" data-required="false">
    <x-field-desc markdown>对于图生图模型（`doubao-seededit-3-0-i2i`），提供输入图像。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一个包含模型特定参数的对象。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false">
      <x-field-desc markdown>生成图像的期望尺寸（例如，`"1024x1024"`）。</x-field-desc>
    </x-field>
    <x-field data-name="seed" data-type="number" data-required="false">
      <x-field-desc markdown>用于可复现结果的种子值。由 `doubao-seedream-3-0-t2i` 和 `doubao-seededit-3-0-i2i` 支持。</x-field-desc>
    </x-field>
    <x-field data-name="guidanceScale" data-type="number" data-required="false">
      <x-field-desc markdown>控制生成图像与提示词的符合程度。由 `doubao-seedream-3-0-t2i` 和 `doubao-seededit-3-0-i2i` 支持。</x-field-desc>
    </x-field>
    <x-field data-name="stream" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>如果为 `true`，则流式传输生成结果。由 `doubao-seedream-4` 模型支持。</x-field-desc>
    </x-field>
    <x-field data-name="watermark" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>如果为 `false`，则禁用生成图像上的水印。</x-field-desc>
    </x-field>
    <x-field data-name="sequentialImageGeneration" data-type="boolean" data-required="false">
      <x-field-desc markdown>启用顺序图像生成。由 `doubao-seedream-4` 模型支持。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 支持的图像模型

下表列出了支持的图像模型及其主要特性。

| 模型系列 | 支持的模型 | 主要用例 |
| --------------------------- | ------------------------------- | --------------------- |
| `doubao-seedream-4` | `doubao-seedream-4-0-250828` | 文生图 (T2I) |
| `doubao-seedream-3-0-t2i` | （具体模型名称各不相同） | 文生图 (T2I) |
| `doubao-seededit-3-0-i2i` | （具体模型名称各不相同） | 图生图 (I2I) |