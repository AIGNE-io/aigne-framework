# Google Gemini

本文档为在 AIGNE 框架内配置和使用 Google Gemini 模型提供了全面的指南。它涵盖了 API 密钥的设置、模型选择，以及通过 `@aigne/gemini` 包可用的、用于聊天和图像生成功能的特定特性。

`@aigne/gemini` 包提供了与 Google Gemini 和 Imagen API 的直接集成，使开发人员能够通过一个一致且可预测的接口，在其 AIGNE 应用程序中利用这些先进的多模态模型。

## 功能

- **直接 Google API 集成**：直接连接到 Google 的 Gemini 和 Imagen API 服务。
- **聊天补全**：完全支持 Gemini 聊天模型，包括 `gemini-1.5-pro` 和 `gemini-1.5-flash`。
- **图像生成**：支持 Imagen（例如 `imagen-4.0-generate-001`）和 Gemini 模型进行图像生成。
- **多模态能力**：原生处理文本和图像输入，适用于多模态应用。
- **函数调用**：集成了 Gemini 的函数调用功能。
- **流式响应**：通过支持流式响应，实现实时、响应迅速的应用程序。
- **类型安全**：为所有 API 交互和模型配置提供全面的 TypeScript 类型定义。

## 安装

首先，使用您偏好的包管理器安装必要的包。

<tabs>
<tab title="npm">
```bash
npm install @aigne/gemini @aigne/core
```
</tab>
<tab title="yarn">
```bash
yarn add @aigne/gemini @aigne/core
```
</tab>
<tab title="pnpm">
```bash
pnpm add @aigne/gemini @aigne/core
```
</tab>
</tabs>

## 配置

Gemini 模型需要 API 密钥进行身份验证。密钥可以直接在模型构造函数中提供，或者为了更好的安全性和灵活性，通过环境变量提供。

设置以下环境变量，以允许框架自动检测您的 API 密钥：

```bash title="Environment Variable"
export GEMINI_API_KEY="your-google-api-key"
```

## 聊天模型

`GeminiChatModel` 类提供了与 Google 基于聊天的模型进行交互的接口。

### 基本用法

以下是实例化 `GeminiChatModel` 并调用它以获取响应的标准示例。

```typescript "Chat Model Example" icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 如果设置了 GEMINI_API_KEY 环境变量，则 API 密钥是可选的。
  apiKey: "your-google-api-key",

  // 指定模型版本。如果未提供，则默认为 'gemini-1.5-pro'。
  model: "gemini-1.5-flash",

  // 可以设置其他模型选项。
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

预期输出将是一个包含模型响应的对象。

```json "Example Response"
{
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash"
}
```

### 流式响应

对于需要实时交互的应用程序，您可以启用流式传输以在响应块可用时进行处理。

```typescript "Streaming Example" icon=logos:javascript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-google-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log(fullText);
// Expected Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// Expected Output: { model: "gemini-1.5-flash" }
```

## 图像生成模型

`GeminiImageModel` 类用于生成图像。它支持两种不同类型的底层模型：**Imagen** 模型，专门用于图像生成；以及多模态的 **Gemini** 模型，同样可以生成图像。

### 基本用法

这是一个使用默认 Imagen 模型生成图像的基本示例。

```typescript "Image Generation Example" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-google-api-key",
  // 默认为 "imagen-4.0-generate-001"
  model: "imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

结果将包含 Base64 格式的生成图像数据。

```json "Example Response"
{
  "images": [
    {
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "imagen-4.0-generate-001"
}
```

### 图像生成参数

可用的图像生成参数因您使用的是 Imagen 模型还是 Gemini 模型而异。

#### Imagen 模型 (例如 `imagen-4.0-generate-001`)

这些参数特定于为图像生成而优化的模型。

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **必需。** 要生成的图像的文本描述。 |
| `n` | `number` | 要生成的图像数量。默认为 `1`。 |
| `negativePrompt` | `string` | 要从图像中排除的元素的描述。 |
| `seed` | `number` | 用于确保可复现图像生成的随机种子。 |
| `aspectRatio` | `string` | 生成图像的宽高比（例如 "1:1"、"16:9"）。 |
| `imageSize` | `string` | 生成图像的尺寸（例如 "1024x1024"）。 |
| `guidanceScale` | `number` | 控制生成图像与提示的贴合程度。 |
| `outputMimeType` | `string` | 图像的输出格式（例如 "image/png"、"image/jpeg"）。 |
| `addWatermark` | `boolean` | 如果为 `true`，则为生成的图像添加水印。 |
| `safetyFilterLevel` | `string` | 内容审核的安全过滤器级别。 |
| `personGeneration` | `string` | 与在图像中生成人物相关的设置。 |
| `outputGcsUri` | `string` | 用于保存输出的 Google Cloud Storage URI。 |
| `outputCompressionQuality` | `number` | JPEG 压缩质量，范围从 1 到 100。 |
| `language` | `string` | 提示的语言。 |
| `includeSafetyAttributes` | `boolean` | 如果为 `true`，则在响应中包含安全属性。 |
| `includeRaiReason` | `boolean` | 如果为 `true`，则在响应中包含 RAI（负责任的 AI）推理。 |

#### Gemini 模型 (例如 `gemini-1.5-pro`)

当使用多模态 Gemini 模型进行图像生成时，适用这些参数。

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `prompt` | `string` | **必需。** 要生成的图像的文本描述。 |
| `n` | `number` | 要生成的图像数量。默认为 `1`。 |
| `temperature` | `number` | 控制随机性（0.0 到 1.0）。值越高，输出越具创造性。 |
| `maxOutputTokens` | `number` | 响应中的最大令牌数。 |
| `topP` | `number` | 核心采样参数。 |
| `topK` | `number` | Top-k 采样参数。 |
| `seed` | `number` | 用于确保可复现生成的随机种子。 |
| `stopSequences` | `array` | 将停止生成过程的序列列表。 |
| `safetySettings` | `array` | 用于内容生成的自定义安全设置。 |
| `systemInstruction` | `string` | 用于指导模型行为的系统级指令。 |

### 高级图像生成

此示例演示了如何使用多个参数来微调 Imagen 模型的输出。

```typescript "Advanced Image Generation" icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({ apiKey: "your-google-api-key" });

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "imagen-4.0-generate-001",
  n: 2,
  imageSize: "1024x1024",
  aspectRatio: "1:1",
  guidanceScale: 7.5,
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345,
  includeSafetyAttributes: true,
  outputMimeType: "image/png",
});

console.log(result);
```

## 进一步阅读

有关参数的完整列表和更高级的功能，请参阅 Google AI 官方文档。

- **Imagen 模型**：[Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
- **Gemini 模型**：[Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)