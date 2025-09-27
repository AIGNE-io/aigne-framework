# Ollama

通过 Ollama 服务器，可以在本地机器上使用各种开源模型。@aigne/ollama 包提供了 AIGNE 框架与本地 Ollama 实例之间的无缝集成，使您能够利用强大的开源语言模型，并享有完全的隐私和离线访问权限。

此设置非常适合需要将数据保留在本地或希望在不依赖外部 API 服务的情况下试验各种模型的开发人员。

![AIGNE Ollama 集成](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-ollama.png)

## 功能

<x-cards data-columns="2">
  <x-card data-title="直接 Ollama 集成" data-icon="lucide:cpu">
    直接连接到您的本地 Ollama 实例，实现快速、私密的 AI 处理。
  </x-card>
  <x-card data-title="广泛的模型支持" data-icon="lucide:library">
    适用于通过 Ollama 提供的任何开源模型。
  </x-card>
  <x-card data-title="聊天与流式传输" data-icon="lucide:messages-square">
    支持标准聊天补全和实时流式响应。
  </x-card>
  <x-card data-title="隐私优先" data-icon="lucide:lock">
    完全在您自己的机器上运行模型，确保您的数据永远不会脱离您的控制。
  </x-card>
</x-cards>

## 先决条件

在使用此集成之前，您必须在本地机器上安装并运行 [Ollama](https://ollama.ai/)。您还需要拉取至少一个模型。

例如，要下载 `llama3.2` 模型，请在终端中运行以下命令：

```bash
ollama pull llama3.2
```

请在 [Ollama 网站](https://ollama.ai/) 上按照完整的设置说明进行操作。

## 安装

首先，在您的项目中安装必要的 AIGNE 包。

```bash Tabs
--npm--
npm install @aigne/ollama @aigne/core
--yarn--
yarn add @aigne/ollama @aigne/core
--pnpm--
pnpm add @aigne/ollama @aigne/core
```

## 配置

`OllamaChatModel` 类是您与 Ollama 交互的入口点。在创建新实例时，您可以提供多个配置选项来自定义其行为。

<x-field-group>
  <x-field data-name="model" data-type="string" data-default="llama3.2" data-required="false">
    <x-field-desc markdown>您想要使用的 Ollama 模型的名称（例如，`mistral`、`gemma`）。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="http://localhost:11434/v1" data-required="false">
    <x-field-desc markdown>您的 Ollama 服务器的基础 URL。也可以使用 `OLLAMA_BASE_URL` 环境变量进行配置。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>传递给模型的附加选项，例如 `temperature`、`top_p` 等，用于微调其响应。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

以下是如何向本地模型发送消息并获取响应的方法。此示例使用 `invoke` 方法进行简单的请求-响应交互。

```typescript 基本聊天补全 icon=logos:typescript
import { OllamaChatModel } from "@aigne/ollama";

// 初始化模型，默认为 'llama3.2'
const model = new OllamaChatModel({
  // Ollama 服务器 URL（默认为 http://localhost:11434）
  baseURL: "http://localhost:11434",
  // 指定您在 Ollama 中已拉取的模型
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

// 向模型发送消息
const result = await model.invoke({
  messages: [{ role: "user", content: "告诉我你正在使用什么模型" }],
});

console.log(result);
```

**响应示例**

```json
{
  "text": "我是一个在 Ollama 上运行的 AI 助手，使用的是 llama3 模型。",
  "model": "llama3"
}
```

## 流式响应

对于更具交互性的应用程序，您可以在模型生成响应时以流式方式获取响应。这使您可以实时更新 UI，而无需等待完整响应完成。

要启用流式传输，请在 `invoke` 方法调用中将 `streaming` 选项设置为 `true`。

```typescript 流式处理示例 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434",
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "告诉我你正在使用什么模型" }],
  },
  { streaming: true },
);

let fullText = "";

// 处理来自流的每个数据块
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在文本到达时将其打印到控制台
    }
  }
}

console.log("\n\n--- 最终组合的文本 ---");
console.log(fullText);
```

此脚本将在响应生成时逐字打印，然后在末尾记录完整的消息。