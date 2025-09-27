# 豆包

`@aigne/doubao` 包提供了与豆包强大的 AI 模型的无缝集成，允许您将 AIGNE Agent 连接到其服务，以执行广泛的语言和图像生成任务。此集成在 AIGNE 框架内提供了一致的接口，使利用豆包的先进功能变得容易。

## 功能

*   **直接 API 集成**：直接连接到豆包的 API 服务。
*   **聊天补全**：完全支持豆包的聊天模型。
*   **图像生成**：使用文本提示生成和编辑图像。
*   **流式响应**：实现实时、响应迅速的交互。
*   **一致的接口**：在 AIGNE 框架的模型结构内平滑工作。

## 安装

要开始使用，请使用您首选的包管理器安装必要的包：

```bash pnpm
pnpm add @aigne/doubao @aigne/core
```

```bash npm
npm install @aigne/doubao @aigne/core
```

```bash yarn
yarn add @aigne/doubao @aigne/core
```

## 配置

在使用模型之前，您需要配置您的豆包 API 密钥。您可以直接在模型的构造函数中传递密钥，或者为了更好的安全性，将其设置为名为 `DOUBAO_API_KEY` 的环境变量。

## 聊天补全

使用 `DoubaoChatModel` 进行对话式 AI、文本生成和函数调用。

### 基本用法

以下是如何创建模型实例并获取响应：

```typescript Basic Chat Example icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // 直接提供 API 密钥或使用环境变量 DOUBAO_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了，则为可选
  // 指定模型版本（默认为 'doubao-seed-1-6-250615'）
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
/* 输出：
  {
    text: "Hello! I'm an AI assistant powered by Doubao's language model.",
    model: "doubao-seed-1-6-250615",
    usage: {
      inputTokens: 7,
      outputTokens: 12
    }
  }
*/
```

### 流式响应

对于更具交互性的应用程序，您可以在响应生成时以流式方式传输它。

```typescript Streaming Chat Example icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
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

console.log(fullText); // 输出: "Hello! I'm an AI assistant powered by Doubao's language model."
console.log(json); // { model: "doubao-seed-1-6-250615", usage: { inputTokens: 7, outputTokens: 12 } }
```

### 构造函数选项

在创建 `DoubaoChatModel` 实例时，您可以提供以下选项：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的豆包 API 密钥。如果未提供，将使用 `DOUBAO_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="doubao-seed-1-6-250615" data-required="false" data-desc="要使用的特定聊天模型。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://ark.cn-beijing.volces.com/api/v3" data-required="false" data-desc="豆包 API 的基础 URL。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="传递给模型的附加选项，例如 `temperature`。"></x-field>
</x-field-group>

## 图像生成

使用 `DoubaoImageModel` 根据文本提示生成或编辑图像。

### 基本用法

以下是如何创建图像模型并生成图像：

```typescript Image Generation Example icon=logos:typescript
import { DoubaoImageModel } from "@aigne/doubao";

const imageModel = new DoubaoImageModel({
  apiKey: "your-doubao-api-key",
});

const result = await imageModel.invoke({
  prompt: "A photorealistic image of a cat programming on a laptop",
  modelOptions: {
    size: "1024x1024",
  },
});

// 结果包含一个图像数组，可以是 URL 或文件对象
console.log(result.images[0]);
```

### 构造函数选项

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的豆包 API 密钥。如果未提供，将使用 `DOUBAO_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="doubao-seedream-4-0-250828" data-required="false" data-desc="要使用的特定图像模型。"></x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://ark.cn-beijing.volces.com/api/v3" data-required="false" data-desc="豆包 API 的基础 URL。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="图像生成的默认选项，例如 `size` 或 `seed`。"></x-field>
</x-field-group>

### 输入参数

在图像模型上调用 `invoke` 方法时，您可以指定以下参数：

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="描述您想要生成的图像的文本提示。"></x-field>
  <x-field data-name="image" data-type="FileUnion" data-required="false" data-desc="用于图生图任务的输入图像。"></x-field>
  <x-field data-name="modelOptions" data-type="DoubaoImageModelInput" data-required="false" data-desc="此请求的模型特定选项。">
    <x-field data-name="size" data-type="string" data-required="false" data-desc="生成图像的尺寸（例如，'1024x1024'）。"></x-field>
    <x-field data-name="seed" data-type="number" data-required="false" data-desc="用于可复现结果的种子值。"></x-field>
    <x-field data-name="guidanceScale" data-type="number" data-required="false" data-desc="控制生成图像与提示的匹配程度。"></x-field>
    <x-field data-name="watermark" data-type="boolean" data-default="false" data-required="false" data-desc="是否在生成的图像上添加水印。"></x-field>
    <x-field data-name="stream" data-type="boolean" data-required="false" data-desc="设置为 true 以流式传输图像生成过程。"></x-field>
  </x-field>
</x-field-group>

## 支持的模型

以下是您可以使用的可用豆包模型列表：

| 类型  | 模型 ID                        | 默认 |
| :---- | :------------------------------ | :------ |
| 聊天  | `doubao-seed-1-6-250615`        | 是     |
| 图像 | `doubao-seedream-4-0-250828`    | 是     |
| 图像 | `doubao-seedream-3-0-t2i`       | 否      |
| 图像 | `doubao-seededit-3-0-i2i`       | 否      |

---

现在您已经了解如何使用豆包模型，可以探索其他集成，如 [OpenAI](./models-openai.md) 或 [Google Gemini](./models-gemini.md)，以进一步扩展您的 Agent 的能力。