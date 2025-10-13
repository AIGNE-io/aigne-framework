# @aigne/gemini

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/gemini)](https://www.npmjs.com/package/@aigne/gemini)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/gemini)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md)

AIGNE Gemini SDK，用于在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)内与 Google 的 Gemini AI 模型集成。

## 简介

`@aigne/gemini` 提供了 AIGNE 框架与 Google Gemini 语言模型及 API 之间的无缝集成。该包使开发人员能够在其 AIGNE 应用程序中轻松利用 Gemini 先进的 AI 功能，在整个框架中提供一致的接口，同时利用 Google 最先进的多模态模型。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-gemini.png" alt="AIGNE Arch" />
</picture>

## 架构

下图说明了 `@aigne/gemini` 包如何融入 AIGNE 框架并与 Google Gemini API 交互。

```d2
direction: down

User-Application: {
  label: "您的 AIGNE 应用程序"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  shape: rectangle
  grid-columns: 2
  grid-gap: 100

  AIGNE-Core: {
    label: "@aigne/core"
    shape: rectangle
    
    Model-Interface: {
      label: "模型接口\n(invoke, stream)"
      shape: rectangle
      style: {
        stroke-dash: 2
      }
    }
  }

  AIGNE-Gemini: {
    label: "@aigne/gemini"
    shape: rectangle
    
    GeminiChatModel: {
      label: "GeminiChatModel"
    }
    
    GeminiImageModel: {
      label: "GeminiImageModel"
    }
  }
}

Google-Cloud: {
  label: "Google Cloud"
  shape: rectangle

  Google-Gemini-API: {
    label: "Google Gemini API"
    shape: cylinder
    grid-columns: 2
    
    Gemini-Models: {
      label: "Gemini 模型\n(例如 gemini-1.5-pro)"
    }
    
    Imagen-Models: {
      label: "Imagen 模型\n(例如 imagen-4.0)"
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE-Core: "使用核心"
User-Application -> AIGNE-Framework.AIGNE-Gemini: "导入和实例化"

AIGNE-Framework.AIGNE-Core.Model-Interface -> AIGNE-Framework.AIGNE-Gemini: {
  label: "实现"
  style: {
    stroke-dash: 4
  }
}

AIGNE-Framework.AIGNE-Gemini.GeminiChatModel -> Google-Cloud.Google-Gemini-API.Gemini-Models: "API 调用"
AIGNE-Framework.AIGNE-Gemini.GeminiImageModel -> Google-Cloud.Google-Gemini-API.Gemini-Models: "API 调用"
AIGNE-Framework.AIGNE-Gemini.GeminiImageModel -> Google-Cloud.Google-Gemini-API.Imagen-Models: "API 调用"

```

## 功能

*   **Google Gemini API 集成**：直接连接到 Google 的 Gemini API 服务
*   **聊天补全**：支持 Gemini 的聊天补全 API 及所有可用模型
*   **图像生成**：支持 Imagen 和 Gemini 图像生成模型
*   **多模态支持**：内置支持处理文本和图像输入
*   **函数调用**：支持函数调用功能
*   **流式响应**：支持流式响应，以实现更具响应性的应用程序
*   **类型安全**：为所有 API 和模型提供全面的 TypeScript 类型定义
*   **一致的接口**：与 AIGNE 框架的模型接口兼容
*   **错误处理**：强大的错误处理和重试机制
*   **完整的配置**：丰富的配置选项，用于微调行为

## 安装

### 使用 npm

```bash
npm install @aigne/gemini @aigne/core
```

### 使用 yarn

```bash
yarn add @aigne/gemini @aigne/core
```

### 使用 pnpm

```bash
pnpm add @aigne/gemini @aigne/core
```

## 快速入门

### 环境变量

在使用 SDK 之前，您需要设置您的 Gemini API 密钥。SDK 将自动从以下环境变量中检测该密钥：

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

或者，您可以在实例化模型时直接传递 `apiKey`。

### 聊天模型用法

`GeminiChatModel` 提供了一个与 Gemini 聊天补全模型交互的接口。

```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 直接提供 API 密钥或使用环境变量 GOOGLE_API_KEY
  apiKey: "your-api-key", // 如果已在环境变量中设置，则为可选
  // 指定 Gemini 模型版本（如果未指定，则默认为 'gemini-1.5-pro'）
  model: "gemini-1.5-flash",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
/* 输出:
  {
    text: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?",
    model: "gemini-1.5-flash"
  }
*/
```

### 图像生成模型用法

`GeminiImageModel` 允许您使用 Imagen 或 Gemini 模型生成图像。

```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", // 如果已在环境变量中设置，则为可选
  model: "imagen-4.0-generate-001", // 默认 Imagen 模型
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
/* 输出:
  {
    images: [
      {
        base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
      }
    ],
    usage: {
      inputTokens: 0,
      outputTokens: 0
    },
    model: "imagen-4.0-generate-001"
  }
*/
```

## 高级用法

### 流式响应

对于实时应用程序，您可以从聊天模型中流式传输响应。这使您能够在生成输出的同时处理它。

```typescript
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

console.log(fullText); // 输出: "Hello from Gemini! I'm Google's helpful AI assistant. How can I assist you today?"
console.log(json); // { model: "gemini-1.5-flash" }
```

### 图像生成参数

`GeminiImageModel` 支持多种参数，这些参数根据底层模型系列（Imagen 或 Gemini）的不同而有所区别。

#### Imagen 模型（例如 `imagen-4.0-generate-001`）

-   **`prompt`** (string): 您想要生成的图像的文本描述。
-   **`n`** (number): 要生成的图像数量（默认为 1）。
-   **`seed`** (number): 用于可复现生成的随机种子。
-   **`safetyFilterLevel`** (string): 用于内容审核的安全过滤器级别。
-   **`personGeneration`** (string): 人物生成设置。
-   **`outputMimeType`** (string): 输出图像格式（例如 "image/png", "image/jpeg"）。
-   **`outputGcsUri`** (string): 用于输出的 Google Cloud Storage URI。
-   **`outputCompressionQuality`** (number): JPEG 压缩质量（1-100）。
-   **`negativePrompt`** (string): 描述要从图像中排除的内容。
-   **`language`** (string): 提示的语言。
-   **`includeSafetyAttributes`** (boolean): 在响应中包含安全属性。
-   **`includeRaiReason`** (boolean): 在响应中包含 RAI 推理。
-   **`imageSize`** (string): 生成图像的尺寸。
-   **`guidanceScale`** (number): 生成的指导比例。
-   **`aspectRatio`** (string): 图像的宽高比。
-   **`addWatermark`** (boolean): 为生成的图像添加水印。

#### Gemini 模型（例如 `gemini-1.5-pro`）

-   **`prompt`** (string): 您想要生成的图像的文本描述。
-   **`n`** (number): 要生成的图像数量（默认为 1）。
-   **`temperature`** (number): 控制生成中的随机性（0.0 到 1.0）。
-   **`maxOutputTokens`** (number): 响应中的最大令牌数。
-   **`topP`** (number): Nucleus 采样参数。
-   **`topK`** (number): Top-k 采样参数。
-   **`safetySettings`** (array): 内容生成的安全设置。
-   **`seed`** (number): 用于可复现生成的随机种子。
-   **`stopSequences`** (array): 停止生成的序列。
-   **`systemInstruction`** (string): 系统级指令。

#### 高级图像生成示例

此示例演示了如何将多个高级参数与 Imagen 模型结合使用。

```typescript
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

### 默认模型选项

您可以在模型级别配置默认选项，这些选项将应用于所有后续的 `invoke` 调用。

```typescript
const model = new GeminiImageModel({
  apiKey: "your-api-key",
  model: "imagen-4.0-generate-001",
  modelOptions: {
    safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
    includeSafetyAttributes: true,
    outputMimeType: "image/png"
  }
});
```

## API 参考

有关所有可用参数和高级功能的完整详细列表，请参阅官方 Google GenAI 文档：

-   **Imagen 模型**: [Google GenAI Models.generateImages()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generateimages)
-   **Gemini 模型**: [Google GenAI Models.generateContent()](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatecontent)

## 许可证

本 SDK 根据 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 获得许可。