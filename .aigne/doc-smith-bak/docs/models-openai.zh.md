# OpenAI

`@aigne/openai` 包提供了与 OpenAI 模型套件的无缝集成，允许开发者在 AIGNE 框架内直接利用 GPT 进行聊天补全、DALL-E 进行图像生成以及 Sora 进行视频创作等服务。本文档为安装、配置和使用这些模型提供了全面的指南。

有关可用模型提供商的更广泛概述，请参阅[模型](./models.md)部分。

## 功能

OpenAI 集成设计得功能强大且对开发者友好，提供了一系列功能：

*   **全面的模型支持**：完全集成 OpenAI 的聊天、图像和视频生成 API。
*   **官方 SDK**：基于官方 OpenAI SDK 构建，以实现最高的可靠性和兼容性。
*   **高级功能**：支持函数调用、流式响应和结构化 JSON 输出。
*   **类型安全**：为所有模型配置和 API 响应提供完整的 TypeScript 类型定义，确保代码质量和自动补全。
*   **一致的接口**：遵循 AIGNE 框架的模型接口，以实现跨不同提供商的统一实现。
*   **丰富的配置**：提供详细的选项来微调模型行为，以满足特定的应用需求。

## 安装

要将 OpenAI 模型集成到您的项目中，请将 `@aigne/openai` 包与 `@aigne/core` 框架一起安装。请使用适合您的包管理器的命令：

```bash npm
npm install @aigne/openai @aigne/core
```

```bash yarn
yarn add @aigne/openai @aigne/core
```

```bash pnpm
pnpm add @aigne/openai @aigne/core
```

## 聊天模型 (`OpenAIChatModel`)

`OpenAIChatModel` 类是与 OpenAI 基于文本的语言模型（如 GPT-4o 和 GPT-4o-mini）交互的主要接口。

### 配置

在创建 `OpenAIChatModel` 实例时，您必须提供您的 OpenAI API 密钥。该密钥可以直接在构造函数中传递，也可以设置为名为 `OPENAI_API_KEY` 的环境变量。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果省略，系统将查找 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API 的可选基本 URL，可用于通过代理或备用端点连接。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false">
    <x-field-desc markdown>用于聊天补全的模型标识符（例如，"gpt-4o"）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一组用于控制生成过程的参数。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制输出的随机性。值越低，产生的结果越确定。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="温度采样的替代方案，称为核心采样（nucleus sampling）。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="降低重复标记（token）的可能性。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="降低重复主题的可能性。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="使模型能够并发执行多个函数调用。"></x-field>
    <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="对于推理模型（o1/o3），设置推理强度（'minimal'、'low'、'medium'、'high' 或一个标记数）。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接传递给底层 OpenAI SDK 客户端的附加选项，用于高级自定义。</x-field-desc>
  </x-field>
</x-field-group>

### 基本用法

以下示例展示了如何实例化 `OpenAIChatModel` 并使用 `invoke` 方法获取响应。

```typescript 基本聊天补全 icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 建议使用环境变量来设置 API 密钥。
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

**响应示例**

```json
{
  "text": "Hello! How can I assist you today?",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 10,
    "outputTokens": 9
  }
}
```

### 流式响应

对于实时应用，您可以通过向 `invoke` 方法传递 `{ streaming: true }` 来启用流式传输。这将返回一个异步迭代器，在响应块生成时产生它们。

```typescript 流式聊天响应 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
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

console.log("\n--- Response Complete ---");
```

## 图像模型 (`OpenAIImageModel`)

`OpenAIImageModel` 类提供了与 OpenAI 图像生成和编辑模型（如 DALL-E 2、DALL-E 3 和 gpt-image-1）交互的接口。

### 配置

图像模型的配置与聊天模型类似，需要 API 密钥并允许设置特定于模型的选项。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果未提供，则默认为 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>OpenAI API 的可选基本 URL。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false">
    <x-field-desc markdown>要使用的图像模型（例如，"dall-e-3"、"gpt-image-1"）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制图像生成过程的参数。可用选项因模型而异。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成图像的尺寸（例如，'1024x1024'）。"></x-field>
    <x-field data-name="quality" data-type="string" data-required="false" data-desc="图像质量，可以是 'standard' 或 'hd'（仅限 DALL-E 3）。"></x-field>
    <x-field data-name="style" data-type="string" data-required="false" data-desc="艺术风格，可以是 'vivid' 或 'natural'（仅限 DALL-E 3）。"></x-field>
    <x-field data-name="n" data-type="number" data-required="false" data-desc="要生成的图像数量。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接传递给底层 OpenAI SDK 客户端的高级选项。</x-field-desc>
  </x-field>
</x-field-group>

### 图像生成

要生成图像，请创建 `OpenAIImageModel` 的实例，并使用文本提示调用它。

```typescript 图像生成 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
  modelOptions: {
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  },
});

const result = await imageModel.invoke({
  prompt: "A futuristic city at sunset with flying cars",
});

console.log(result);
```

**响应示例**

```json
{
  "images": [
    {
      "type": "url",
      "url": "https://...",
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

### 图像编辑

特定的模型（如 `gpt-image-1`）支持图像编辑。要编辑图像，请同时提供提示和参考图像。

```typescript 图像编辑 icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "gpt-image-1",
});

const result = await imageModel.invoke({
  prompt: "Add a rainbow to the sky",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
});

console.log(result.images); // 编辑后的图像数组
```

## 视频模型 (`OpenAIVideoModel`)

`OpenAIVideoModel` 类能够使用 OpenAI 的 Sora 模型生成视频。

### 配置

视频模型需要 API 密钥，并允许指定模型、分辨率和时长。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果未提供，则默认为 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="sora-2" data-required="false">
    <x-field-desc markdown>要使用的视频模型，可以是 "sora-2"（标准）或 "sora-2-pro"（更高质量）。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制视频生成过程的参数。</x-field-desc>
    <x-field data-name="size" data-type="string" data-default="1280x720" data-required="false" data-desc="视频分辨率（例如，'1280x720' 表示横向，'720x1280' 表示纵向）。"></x-field>
    <x-field data-name="seconds" data-type="string" data-default="4" data-required="false" data-desc="视频时长（秒）。接受的值为 '4'、'8' 或 '12'。"></x-field>
  </x-field>
</x-field-group>

### 视频生成

以下示例演示了如何从文本提示生成短视频。

```typescript 视频生成 icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
  modelOptions: {
    size: "1280x720",
    seconds: "4",
  },
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
});

console.log(result);
```

**响应示例**

```json
{
  "videos": [
    {
      "type": "file",
      "data": "base64-encoded-video-data...",
      "mimeType": "video/mp4",
      "filename": "video-id.mp4"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "sora-2",
  "seconds": 4
}
```

### 图像转视频生成

您还可以通过为静态图像添加动画来生成视频。

```typescript 图像转视频 icon=logos:typescript
import { OpenAIVideoModel } from "@aigne/openai";

const videoModel = new OpenAIVideoModel({
  apiKey: "your-api-key",
  model: "sora-2",
});

const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  size: "1280x720",
  seconds: "8",
});

console.log(result.videos);
```

## 总结

本指南涵盖了将 OpenAI 的聊天、图像和视频模型集成到您的 AIGNE 应用程序中的基本要素。通过使用 `@aigne/openai` 包，您可以轻松利用这些先进的 AI 功能。

有关更多详细信息，请参阅官方 [OpenAI API 文档](https://platform.openai.com/docs/api-reference)。要探索其他支持的模型提供商，请访问[模型概述](./models-overview.md)。