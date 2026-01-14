# Ollama

`@aigne/ollama` 包提供了 AIGNE 框架与通过 [Ollama](https://ollama.ai/) 本地托管的 AI 模型之间的无缝集成。这使得开发人员能够利用在自己硬件上运行的各种开源语言模型，确保了 AI 功能的隐私性和离线访问能力。

本指南涵盖了在您的 AIGNE 应用中配置和使用 `OllamaChatModel` 的必要步骤。有关其他模型提供商的信息，请参阅[模型概述](./models-overview.md)。

下图说明了 AIGNE 框架如何与本地 Ollama 实例进行交互。

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![Ollama](assets/diagram/ollama-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 先决条件

在使用此包之前，您必须在本地计算机上安装并运行 Ollama。您还需要拉取至少一个模型。有关详细说明，请参阅 [Ollama 官方网站](https://ollama.ai/)。

## 安装

首先，使用您偏好的包管理器安装必要的 AIGNE 包。

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/ollama @aigne/core
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/ollama @aigne/core
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/ollama @aigne/core
    ```
  </x-card>
</x-cards>

## 配置

`OllamaChatModel` 类是与 Ollama 交互的主要接口。实例化模型时，您可以提供几个配置选项来自定义其行为。

```typescript OllamaChatModel 实例化 icon=logos:typescript-icon
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // 指定要使用的 Ollama 模型
  model: "llama3",
  
  // 本地 Ollama 实例的基础 URL
  baseURL: "http://localhost:11434/v1",

  // 传递给模型的可选参数
  modelOptions: {
    temperature: 0.7,
  },
});
```

构造函数接受以下参数：

<x-field-group>
  <x-field data-name="model" data-type="string" data-default="llama3.2" data-required="false">
    <x-field-desc markdown>要使用的模型名称（例如 `llama3`、`mistral`）。请确保您已在 Ollama 实例中拉取该模型。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="http://localhost:11434/v1" data-required="false">
    <x-field-desc markdown>Ollama API 的基础 URL。也可以使用 `OLLAMA_BASE_URL` 环境变量进行配置。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-default="ollama" data-required="false">
    <x-field-desc markdown>一个占位符 API 密钥。Ollama 默认不需要身份验证，但 AIGNE 框架要求密钥为非空。它默认为 `"ollama"`，并且可以通过 `OLLAMA_API_KEY` 环境变量进行设置。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一个包含传递给 Ollama API 的额外参数的对象，例如 `temperature`、`top_p` 等。这些选项可用于微调模型的响应生成。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

要运行模型，请使用 `invoke` 方法。传递消息负载以生成聊天补全。

```typescript 基本调用 icon=logos:typescript-icon
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Explain the importance of local AI models." }],
});

console.log(result.text);
```

`invoke` 方法返回一个 promise，该 promise 会解析为一个包含模型响应的对象。

**响应示例**
```json
{
  "text": "本地 AI 模型至关重要有几个原因。首先，它们提供了增强的隐私和安全性，因为数据在设备上处理，永远不会离开用户的机器...",
  "model": "llama3"
}
```

## 流式响应

对于需要实时交互的应用，您可以流式传输模型的响应。在 `invoke` 方法中将 `streaming` 选项设置为 `true`。该方法将返回一个异步迭代器，在响应块可用时生成它们。

```typescript 流式处理示例 icon=logos:typescript-icon
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
process.stdout.write("Response: ");

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
  }
}

console.log("\n\n--- End of Stream ---");
console.log("Full text:", fullText);
```

此示例演示了如何处理流。每个块都是完整响应的增量。您可以累积每个块的文本以重构完整的消息。

## 总结

`@aigne/ollama` 包提供了一种强大而直接的方式，将本地开源模型集成到您的 AIGNE 应用中。通过遵循本指南中的步骤，您可以设置 `OllamaChatModel`，根据您的需求进行配置，并利用标准和流式补全功能。

有关其他可用模型的更多信息，请参阅以下指南：
- [OpenAI](./models-openai.md)
- [Google Gemini](./models-gemini.md)
- [Anthropic](./models-anthropic.md)