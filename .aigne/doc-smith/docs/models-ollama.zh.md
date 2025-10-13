# @aigne/ollama

`@aigne/ollama` SDK 提供了 AIGNE 框架与通过 Ollama 本地托管的 AI 模型之间的无缝集成。这使得开发人员可以轻松地在他们的 AIGNE 应用程序中利用开源语言模型，在提供一致接口的同时，确保隐私和对 AI 功能的离线访问。

```d2
direction: down

AIGNE-Application: {
  label: "你的 AIGNE 应用程序"
  shape: rectangle
}

aigne-ollama: {
  label: "@aigne/ollama SDK"
  shape: rectangle
}

Ollama-Instance: {
  label: "Ollama 实例\n（本地运行）"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  API-Server: {
    label: "API 服务器\n(localhost:11434)"
    shape: rectangle
  }

  Local-Models: {
    label: "本地 AI 模型"
    shape: rectangle
    grid-columns: 2

    Llama3: { shape: rectangle }
    Mistral: { shape: rectangle }
    "and more...": { shape: rectangle }
  }
}

AIGNE-Application -> aigne-ollama: "使用 `OllamaChatModel`"
aigne-ollama -> Ollama-Instance.API-Server: "发送 HTTP API 请求"
Ollama-Instance.API-Server -> Ollama-Instance.Local-Models: "加载并运行模型"
Ollama-Instance.Local-Models -> Ollama-Instance.API-Server: "返回补全结果"
```

## 功能特性

*   **直接集成 Ollama**：直接连接到本地的 Ollama 实例。
*   **支持本地模型**：使用通过 Ollama 托管的各种开源模型。
*   **聊天补全**：完全支持与所有兼容的 Ollama 模型进行聊天补全的 API。
*   **流式响应**：通过支持流式响应，实现实时、响应迅速的应用程序。
*   **类型安全**：受益于所有 API 和模型的全面 TypeScript 类型定义。
*   **一致的接口**：与 AIGNE 框架的模型接口平滑集成。
*   **注重隐私**：在本地运行模型，无需将数据发送到外部服务。
*   **完整的配置选项**：提供广泛的配置选项以微调模型行为。

## 前提条件

在使用此包之前，您必须在您的机器上安装并运行 [Ollama](https://ollama.ai/)。您还需要拉取至少一个模型。请按照 [Ollama 网站](https://ollama.ai/) 上的官方说明完成设置。

## 安装

使用您喜欢的包管理器安装此包及其核心依赖项。

### npm

```bash
npm install @aigne/ollama @aigne/core
```

### yarn

```bash
yarn add @aigne/ollama @aigne/core
```

### pnpm

```bash
pnpm add @aigne/ollama @aigne/core
```

## 配置

主要入口点是 `OllamaChatModel` 类，它连接到您的本地 Ollama 实例。

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // 您的 Ollama 实例的基础 URL。
  // 默认为 `http://localhost:11434`。
  baseURL: "http://localhost:11434",

  // 用于补全的 Ollama 模型。
  // 默认为 'llama3'。
  model: "llama3",

  // 传递给模型的附加选项。
  modelOptions: {
    temperature: 0.8,
  },
});
```

构造函数接受以下选项：

| 参数 | 类型 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- |
| `model` | `string` | 要使用的 Ollama 模型的名称。 | `llama3.2` |
| `baseURL` | `string` | Ollama 服务器的基础 URL。也可以通过 `OLLAMA_BASE_URL` 环境变量设置。 | `http://localhost:11434/v1` |
| `modelOptions` | `object` | 包含模型特定参数（如 `temperature`、`top_p` 等）的对象。 | `{}` |
| `apiKey` | `string` | 用于身份验证的 API 密钥。也可以通过 `OLLAMA_API_KEY` 设置。 | `ollama` |

## 基本用法

要生成响应，请使用 `invoke` 方法。传递一个消息列表，它将返回一个单一、完整的响应。

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

**输出：**

```json
{
  "text": "I'm an AI assistant running on Ollama with the llama3 model.",
  "model": "llama3"
}
```

## 流式响应

对于更具交互性的应用程序，您可以在响应生成时对其进行流式处理。在 `invoke` 调用中设置 `streaming: true` 选项，以接收响应块的异步流。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  // 使用 isAgentResponseDelta 类型守卫来处理增量数据
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在文本到达时打印
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log("Full Text:", fullText);
console.log("JSON:", json);
```

**输出：**

```
I'm an AI assistant running on Ollama with the llama3 model.
--- Final Data ---
Full Text: I'm an AI assistant running on Ollama with the llama3 model.
JSON: { "model": "llama3" }
```

## 许可证

此包根据 [Elastic-2.0 许可证](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 获得许可。