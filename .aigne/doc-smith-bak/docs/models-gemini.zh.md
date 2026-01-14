# Google Gemini

本指南介绍了如何在 AIGNE 框架内通过 `@aigne/gemini` 包配置和使用 Google 的 Gemini 模型。内容涵盖 API 密钥设置、模型选择，以及可用于聊天、图像和视频生成的特定功能。

`@aigne/gemini` 包提供了与 Google 先进 AI 功能的无缝集成，包括 Gemini 多模态模型和 Imagen 文本转图像模型，在 AIGNE 生态系统内提供了一致的接口。

## 功能

- **Google API 集成**：提供与 Google 的 Gemini、Imagen 和 Veo API 服务的直接接口。
- **聊天补全**：支持所有可用的 Gemini 聊天模型，用于对话式 AI。
- **图像生成**：集成了 Imagen 和 Gemini 模型，用于图像生成和编辑。
- **视频生成**：利用 Google 的 Veo 模型执行文本转视频、图像转视频和帧插值任务。
- **多模态支持**：原生处理包含文本、图像、音频和视频的组合输入。
- **函数调用**：支持 Gemini 的函数调用功能，与外部工具进行交互。
- **流式响应**：支持实时数据处理，以实现响应更快的应用程序。
- **类型安全**：包含适用于所有 API 和模型配置的全面 TypeScript 类型定义。

## 安装

使用您偏好的包管理器安装所需包。

```bash
npm install @aigne/gemini @aigne/core
```

## 配置

为了验证请求，您必须提供一个 Google API 密钥。可以通过设置环境变量来完成，框架会自动检测该变量。

```bash 环境变量
export GEMINI_API_KEY="your-google-api-key"
```

或者，您也可以在模型的构造函数中直接传入 `apiKey`。

## 聊天补全

`GeminiChatModel` 类用于会话交互。

### 基本用法

以下示例演示了如何实例化和调用 `GeminiChatModel`。

```typescript 聊天模型用法 icon=logos:javascript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 如果设置了 GEMINI_API_KEY 环境变量，则 API 密钥是可选的。
  apiKey: "your-api-key",
  // 指定模型。默认为 'gemini-2.0-flash'。
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
  "text": "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
  "model": "gemini-1.5-flash",
  "usage": {
    "inputTokens": 12,
    "outputTokens": 18
  }
}
```

### 流式响应

对于实时应用程序，您可以在响应数据块到达时进行处理，只需启用流式传输即可。

```typescript 流式传输示例 icon=logos:javascript
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
  { streaming: true }
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
// Output: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"

console.log(json);
// Output: { model: "gemini-1.5-flash" }
```

### 聊天模型参数

<x-field-group>
  <x-field data-name="messages" data-type="array" data-required="true" data-desc="对话历史记录。每个消息对象包含一个 'role' 和 'content'。"></x-field>
  <x-field data-name="tools" data-type="array" data-required="false" data-desc="可供模型调用的函数工具列表。"></x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false" data-desc="控制模型如何使用工具。可以是 'auto'、'required'、'none' 或特定工具。"></x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false" data-desc="指定所需的输出格式，例如结构化 JSON。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="要使用的模型（例如 'gemini-1.5-pro'、'gemini-1.5-flash'）。"></x-field>
  <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性（0-1）。值越高，响应越具创造性。"></x-field>
  <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数（0-1）。"></x-field>
  <x-field data-name="topK" data-type="number" data-required="false" data-desc="Top-k 采样参数。"></x-field>
  <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="降低重复令牌的可能性。"></x-field>
  <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="鼓励模型引入新主题。"></x-field>
  <x-field data-name="reasoningEffort" data-type="string | number" data-required="false" data-desc="对于思维模型（例如 Gemini 2.5），设置用于推理的令牌预算。可以是 'minimal'、'low'、'medium'、'high' 或特定的令牌数量。"></x-field>
  <x-field data-name="modalities" data-type="array" data-required="false" data-desc="指定所需的响应模态，例如 ['TEXT']、['IMAGE'] 或 ['TEXT', 'IMAGE']。"></x-field>
</x-field-group>

## 图像生成

`GeminiImageModel` 类支持使用专门的 Imagen 模型和多模态 Gemini 模型生成和编辑图像。

### 基本图像生成

此示例使用 Imagen 模型生成图像。

```typescript 图像生成 icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
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
      "type": "file",
      "data": "iVBORw0KGgoAAAANSUhEUgAA...",
      "mimeType": "image/png"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "imagen-4.0-generate-001"
}
```

### 使用 Gemini 模型进行图像编辑

多模态 Gemini 模型可以根据文本提示编辑现有图像。

```typescript 图像编辑 icon=logos:javascript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "gemini-2.0-flash-exp", // 用于编辑的 Gemini 模型
});

const result = await model.invoke({
  prompt: "Add vibrant flowers in the foreground",
  image: [
    {
      type: "url",
      url: "https://example.com/original-image.png",
    },
  ],
  n: 1,
});

console.log(result.images); // 编辑后图像的数组
```

### 图像模型参数

参数因使用的模型系列而异。

#### 通用参数

| 参数 | 类型 | 描述 |
| :--- | :--- | :--- |
| `prompt` | `string` | **必需。**所需图像的文本描述。 |
| `model` | `string` | 要使用的模型。默认为 `imagen-4.0-generate-001`。 |
| `n` | `number` | 要生成的图像数量。默认为 `1`。 |
| `image` | `array` | 对于 Gemini 模型，用于编辑的参考图像数组。 |

#### Imagen 模型参数

| 参数 | 类型 | 描述 |
| :--- | :--- | :--- |
| `seed` | `number` | 用于可复现结果的随机种子。 |
| `safetyFilterLevel` | `string` | 内容审核安全过滤级别。 |
| `personGeneration` | `string` | 控制生成人物图像的设置。 |
| `outputMimeType` | `string` | 输出图像格式（例如 `image/png`）。 |
| `negativePrompt` | `string` | 描述要从图像中排除的内容。 |
| `imageSize` | `string` | 生成图像的尺寸（例如 "1024x1024"）。 |
| `aspectRatio` | `string` | 图像的宽高比（例如 "16:9"）。 |

#### Gemini 模型参数

| 参数 | 类型 | 描述 |
| :--- | :--- | :--- |
| `temperature` | `number` | 控制随机性（0.0 到 1.0）。 |
| `maxOutputTokens` | `number` | 响应中的最大令牌数。 |
| `topP` | `number` | 核心采样参数。 |
| `topK` | `number` | Top-k 采样参数。 |
| `safetySettings` | `array` | 用于内容生成的自定义安全设置。 |
| `seed` | `number` | 用于可复现结果的随机种子。 |
| `systemInstruction` | `string` | 用于指导模型的系统级指令。 |

## 视频生成

`GeminiVideoModel` 类使用 Google 的 Veo 模型从文本或图像生成视频。

### 基本视频生成

```typescript 文本转视频 icon=logos:javascript
import { GeminiVideoModel } from "@aigne/gemini";

const videoModel = new GeminiVideoModel({
  apiKey: "your-api-key",
  model: "veo-3.1-generate-preview",
});

const result = await videoModel.invoke({
  prompt: "A serene lake with mountains in the background, gentle waves rippling",
  aspectRatio: "16:9",
  size: "720p",
  seconds: "8",
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
      "filename": "timestamp.mp4"
    }
  ],
  "usage": { "inputTokens": 0, "outputTokens": 0 },
  "model": "veo-3.1-generate-preview",
  "seconds": 8
}
```

### 高级视频生成

Veo 模型还支持图像转视频和帧插值。

-   **图像转视频**：提供一个 `prompt` 和一个源 `image`，为静态图片制作动画。
-   **帧插值**：提供一个 `prompt`、一个起始 `image` 和一个结束 `lastFrame`，以在它们之间生成平滑过渡。

```typescript 图像转视频 icon=logos:javascript
const result = await videoModel.invoke({
  prompt: "Animate this image with gentle movement, clouds drifting slowly",
  image: {
    type: "url",
    url: "https://example.com/input-image.png",
  },
  seconds: "8",
});
```

### 视频模型参数

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="所需视频内容的文本描述。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="要使用的 Veo 模型。默认为 'veo-3.1-generate-preview'。"></x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false" data-desc="视频宽高比，'16:9'（默认）或 '9:16'。"></x-field>
  <x-field data-name="size" data-type="string" data-required="false" data-desc="视频分辨率，'720p'（默认）或 '1080p'。"></x-field>
  <x-field data-name="seconds" data-type="string" data-required="false" data-desc="视频时长（秒）：'4'、'6' 或 '8'（默认）。"></x-field>
  <x-field data-name="image" data-type="object" data-required="false" data-desc="用于图像转视频的参考图像或插值的第一帧。"></x-field>
  <x-field data-name="lastFrame" data-type="object" data-required="false" data-desc="用于帧插值的最后一帧。"></x-field>
  <x-field data-name="referenceImages" data-type="array" data-required="false" data-desc="用于视频生成的其他参考图像（仅限 Veo 3.1）。"></x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false" data-desc="描述视频中要避免出现的内容。"></x-field>
</x-field-group>

## 延伸阅读

有关完整的 API 详细信息，请参阅官方文档。

- [AIGNE 框架文档](https://aigne.io/docs)
- [Google GenAI API 参考](https://googleapis.github.io/js-genai/release_docs/)