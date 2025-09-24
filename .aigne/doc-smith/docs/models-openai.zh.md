# OpenAI

将 OpenAI 强大的 GPT 模型（包括聊天补全和 DALL-E 图像生成）集成到您的 AIGNE agents 中。`@aigne/openai` 包提供了 AIGNE 框架与 OpenAI AI 服务套件之间的无缝连接，让您能够通过一致的接口利用其先进功能。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openai-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-openai.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-openai.png" alt="AIGNE OpenAI 集成架构" />
</picture>

该提供程序支持两种主要类型的模型：用于处理基于文本任务的聊天模型和用于创建和编辑视觉内容的图像模型。

## 安装

要开始使用，您需要安装 OpenAI 包以及 AIGNE 核心库。

```bash NPM
npm install @aigne/openai @aigne/core
```

```bash Yarn
yarn add @aigne/openai @aigne/core
```

```bash PNPM
pnpm add @aigne/openai @aigne/core
```

## 聊天补全

`OpenAIChatModel` 类让您能够访问 OpenAI 强大的语言模型，如 GPT-4o 和 GPT-4o-mini。您可以用它来进行文本生成、对话、函数调用和结构化数据提取。

### 配置

在创建 `OpenAIChatModel` 实例时，您可以提供以下选项：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果未在此处提供，系统将查找 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="用于 OpenAI API 的自定义基础 URL。如果您正在使用代理或备用端点，此选项会非常有用。"></x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-4o-mini" data-required="false" data-desc="您想要使用的特定聊天模型，例如 'gpt-4o'。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用于微调模型行为的附加选项。">
    <x-field data-name="temperature" data-type="number" data-desc="控制随机性。值越低，输出越具确定性。"></x-field>
    <x-field data-name="topP" data-type="number" data-desc="核心采样。模型会考虑概率质量为 top_p 的词元。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-desc="降低重复相同文本行的可能性。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-desc="增加谈论新主题的可能性。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-desc="模型是否可以并行调用多个工具。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="直接传递给底层 OpenAI 客户端的高级选项。"></x-field>
</x-field-group>

### 基本用法

这是一个向 OpenAI 模型发送消息并获取响应的简单示例。

```typescript Basic Chat Example icon=logos:typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 直接提供 API 密钥或使用环境变量 OPENAI_API_KEY
  apiKey: "your-api-key", // 如果在环境变量中设置了，则此项为可选
  model: "gpt-4o", // 如果未指定，则默认为 "gpt-4o-mini"
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

这将生成一个包含模型文本响应和词元使用信息的结果。

```json Expected Output
{
  text: "Hello! I am a large language model trained by Google.",
  model: "gpt-4o",
  usage: {
    inputTokens: 10,
    outputTokens: 9
  }
}
```

### 流式响应

为了获得更具交互性的体验，您可以从模型中流式传输响应。这使您可以在文本生成时以数据块的形式接收它，而无需等待整个响应完成。

```typescript Streaming Example icon=logos:typescript
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

console.log("\n\n--- Response Complete ---");
console.log(fullText);
```

## 图像生成

`OpenAIImageModel` 类允许您使用 OpenAI 的 DALL-E 模型来生成和编辑图像。

### 配置

在创建 `OpenAIImageModel` 实例时，您可以提供以下选项：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 OpenAI API 密钥。如果未在此处提供，系统将查找 `OPENAI_API_KEY` 环境变量。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-desc="用于 OpenAI API 的自定义基础 URL，对代理很有用。"></x-field>
  <x-field data-name="model" data-type="string" data-default="dall-e-2" data-required="false" data-desc="您想要使用的特定图像模型，例如 'dall-e-3'。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用于微调图像生成的附加选项，例如尺寸、质量和风格。"></x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false" data-desc="直接传递给底层 OpenAI 客户端的高级选项。"></x-field>
</x-field-group>

### 用法

要生成图像，只需提供一个文本提示。模型将返回所生成图像的 URL 或 base64 编码数据。

```typescript Generate an Image icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-3",
});

const result = await imageModel.invoke({
  prompt: "A cute cat programming on a laptop, cartoon style",
  modelOptions: {
    size: "1024x1024",
    quality: "hd",
  },
});

console.log(result.images);
```

某些模型还支持图像编辑。要编辑图像，您需要提供原始图像文件和您的提示。

```typescript Edit an Image icon=logos:typescript
import { OpenAIImageModel } from "@aigne/openai";
import { readFileSync } from 'fs';

const imageModel = new OpenAIImageModel({
  apiKey: "your-api-key",
  model: "dall-e-2", // 注意：DALL-E 2 支持编辑
});

const imageBuffer = readFileSync('./my-image.png');

const result = await imageModel.invoke({
  prompt: "Add a party hat to the person in the image",
  image: [
    {
      type: "file",
      data: imageBuffer.toString('base64'),
      mimeType: 'image/png',
    }
  ]
});

console.log(result.images);
```

---

现在，您已准备好使用 OpenAI 的模型来构建强大的 AI agents。若想以更简单的方式管理 API 密钥并访问多个模型提供商，可以考虑探索 [AIGNE Hub](./models-aigne-hub.md)。