# Google Gemini

使用 Google 的 Gemini 系列多模态模型来处理涉及文本、图像等任务。`@aigne/gemini` 包提供了 AIGNE 框架与 Google 强大的 Gemini 语言模型之间的无缝集成，让您可以在应用程序中轻松利用其先进的 AI 功能。

该包提供了一个在整个 AIGNE 框架中一致的接口，同时让您能够访问 Google 最先进的多模态模型。

## 功能

*   **直接集成 Google Gemini API**：直接连接到 Google 的 Gemini API 服务。
*   **聊天补全**：完全支持 Gemini 的聊天补全模型。
*   **图像生成**：支持 Imagen 和 Gemini 图像生成模型。
*   **多模态支持**：原生处理文本和图像输入。
*   **函数调用**：支持使用函数调用功能。
*   **流式响应**：支持流式传输，以实现响应更迅速、交互性更强的应用程序。
*   **一致的接口**：与 AIGNE 框架的标准模型接口完全兼容。
*   **稳健的错误处理**：内置错误处理和重试机制。
*   **全面的配置**：提供丰富的选项来微调模型行为。

## 安装

要开始使用，您需要安装 Gemini 包以及 AIGNE 核心库。

```bash npm
npm install @aigne/gemini @aigne/core
```

```bash yarn
yarn add @aigne/gemini @aigne/core
```

```bash pnpm
pnpm add @aigne/gemini @aigne/core
```

## 基本用法

在开始之前，请确保将您的 Google API 密钥设置为环境变量。这允许框架自动验证您的请求。

```bash Environment Variable
export GEMINI_API_KEY="your-gemini-api-key"
```

或者，您可以在创建模型实例时直接传递 `apiKey`。

### 聊天模型

以下是如何与 Gemini 聊天模型进行基于文本的对话。

```typescript Chat Model Example icon=logos:typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 直接提供 API 密钥或使用环境变量 GEMINI_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了此项，则为可选
  // 指定 Gemini 模型版本（如果未指定，默认为 'gemini-2.0-flash'）
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

**响应示例**
```json
{
  "text": "你好，我是 Gemini！我是 Google 的得力 AI 助手。今天我能为您做些什么？",
  "model": "gemini-1.5-flash"
}
```

### 图像生成模型

您还可以使用像 Imagen 这样的模型从文本提示生成图像。

```typescript Image Generation Example icon=logos:typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", // 如果在环境变量中设置了此项，则为可选
  model: "imagen-4.0-generate-001", // 默认 Imagen 模型
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

**响应示例**
```json
{
  "images": [
    {
      "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "imagen-4.0-generate-001"
}
```

## 流式响应

对于实时应用程序，您可以在生成聊天模型响应时以流式方式接收它们。

```typescript Streaming Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  apiKey: "your-api-key",
  model: "gemini-1.5-flash",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hi there, introduce yourself" }],
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

console.log(fullText); // 输出: "你好，我是 Gemini！我是 Google 的得力 AI 助手。今天我能为您做些什么？"
console.log(json); // { model: "gemini-1.5-flash" }
```

## 图像生成参数

`GeminiImageModel` 根据您使用的是 Imagen 模型还是 Gemini 模型，支持不同的参数。

### Imagen 模型 (例如, `imagen-4.0-generate-001`)

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="您想要生成的图像的文本描述。"></x-field>
  <x-field data-name="n" data-type="number" data-default="1" data-desc="要生成的图像数量。"></x-field>
  <x-field data-name="seed" data-type="number" data-desc="用于可复现生成的随机种子。"></x-field>
  <x-field data-name="safetyFilterLevel" data-type="string" data-desc="用于内容审核的安全过滤器级别。"></x-field>
  <x-field data-name="personGeneration" data-type="string" data-desc="人物生成设置。"></x-field>
  <x-field data-name="outputMimeType" data-type="string" data-desc="输出图像格式（例如 'image/png'、'image/jpeg'）。"></x-field>
  <x-field data-name="outputGcsUri" data-type="string" data-desc="用于输出的 Google Cloud Storage URI。"></x-field>
  <x-field data-name="outputCompressionQuality" data-type="number" data-desc="JPEG 压缩质量（1-100）。"></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-desc="描述要从图像中排除的内容。"></x-field>
  <x-field data-name="language" data-type="string" data-desc="提示的语言。"></x-field>
  <x-field data-name="includeSafetyAttributes" data-type="boolean" data-desc="在响应中包含安全属性。"></x-field>
  <x-field data-name="includeRaiReason" data-type="boolean" data-desc="在响应中包含 RAI 推理。"></x-field>
  <x-field data-name="imageSize" data-type="string" data-desc="生成的图像的尺寸。"></x-field>
  <x-field data-name="guidanceScale" data-type="number" data-desc="生成的引导比例。"></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-desc="图像的宽高比。"></x-field>
  <x-field data-name="addWatermark" data-type="boolean" data-desc="为生成的图像添加水印。"></x-field>
</x-field-group>

### Gemini 模型 (例如, `gemini-1.5-pro`)

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="您想要生成的图像的文本描述。"></x-field>
  <x-field data-name="n" data-type="number" data-default="1" data-desc="要生成的图像数量。"></x-field>
  <x-field data-name="temperature" data-type="number" data-desc="控制生成中的随机性（0.0 到 1.0）。"></x-field>
  <x-field data-name="maxOutputTokens" data-type="number" data-desc="响应中的最大令牌数。"></x-field>
  <x-field data-name="topP" data-type="number" data-desc="核心采样参数。"></x-field>
  <x-field data-name="topK" data-type="number" data-desc="Top-k 采样参数。"></x-field>
  <x-field data-name="safetySettings" data-type="array" data-desc="内容生成的安全设置。"></x-field>
  <x-field data-name="seed" data-type="number" data-desc="用于可复现生成的随机种子。"></x-field>
  <x-field data-name="stopSequences" data-type="array" data-desc="停止生成的序列。"></x-field>
  <x-field data-name="systemInstruction" data-type="string" data-desc="系统级指令。"></x-field>
</x-field-group>

### 高级图像生成示例

以下是如何使用一些高级参数来微调您的图像输出。

```typescript Advanced Image Generation icon=logos:typescript
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
  outputMimeType: "image/png"
});
```

## 进一步阅读

有关参数的完整列表和更高级的功能，请参阅官方 Google GenAI 文档：

*   **Imagen 模型**: [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
*   **Gemini 模型**: [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)