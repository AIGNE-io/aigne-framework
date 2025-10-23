# LMStudio

`@aigne/lmstudio` 包提供了一个模型适配器，用于将 AIGNE 与通过 [LM Studio](https://lmstudio.ai/) 本地托管的大型语言模型 (LLM) 集成。这使得开发者可以在 AIGNE 框架内利用本地模型的强大功能，从而提供更高的隐私性、控制力和成本效益。

本指南介绍了 LM Studio 的必要设置，并演示了如何使用 `LMStudioChatModel` 与您的本地模型进行交互。有关其他本地模型提供商的信息，请参阅 [Ollama](./models-ollama.md) 文档。

## 先决条件

在使用此包之前，您必须完成以下步骤：

1.  **安装 LM Studio**：从官方网站 [https://lmstudio.ai/](https://lmstudio.ai/) 下载并安装 LM Studio 应用程序。
2.  **下载模型**：使用 LM Studio 界面搜索并下载模型。热门选择包括 Llama 3.2、Mistral 和 Phi-3 的变体。
3.  **启动本地服务器**：在 LM Studio 中，导航至“Local Server”选项卡（服务器图标），从下拉菜单中选择您下载的模型，然后点击“Start Server”。这将暴露一个与 OpenAI 兼容的 API 端点，通常位于 `http://localhost:1234/v1`。

## 安装

要将 LMStudio 包添加到您的项目中，请在终端中运行以下命令之一：

```bash
npm install @aigne/lmstudio
```

```bash
pnpm add @aigne/lmstudio
```

```bash
yarn add @aigne/lmstudio
```

## 快速入门

一旦 LM Studio 服务器运行，您就可以使用 `LMStudioChatModel` 与本地模型进行交互。以下示例演示了如何实例化模型并发送一个简单的请求。

```typescript 快速入门 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. 实例化模型
// 确保模型名称与 LM Studio 中加载的名称匹配。
const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

// 2. 调用模型
async function main() {
  try {
    const response = await model.invoke({
      messages: [
        { role: "user", content: "法国的首都是哪里？" }
      ],
    });

    console.log(response.text);
  } catch (error) {
    console.error("调用模型时出错:", error);
  }
}

main();
```

如果请求成功，输出将是：

```text
The capital of France is Paris.
```

## 配置

`LMStudioChatModel` 可以通过其构造函数或环境变量进行配置。

### 构造函数选项

`LMStudioChatModel` 扩展了标准的 `OpenAIChatModel` 并接受以下选项：

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>要使用的模型名称，必须与 LM Studio 服务器中加载的模型文件匹配。默认为 `llama-3.2-3b-instruct`。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown>LM Studio 服务器的基础 URL。默认为 `http://localhost:1234/v1`。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>API 密钥，如果您在 LM Studio 服务器上配置了身份验证。默认情况下，LM Studio 运行时无需身份验证，密钥被设置为占位符值 `not-required`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制模型生成的附加选项。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。较低的值（例如 0.2）会使输出更具确定性。默认为 0.7。"></x-field>
    <x-field data-name="maxTokens" data-type="number" data-required="false" data-desc="响应中要生成的最大 token 数。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根据新 token 的现有频率对其进行惩罚。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根据新 token 是否已在文本中出现过对其进行惩罚。"></x-field>
  </x-field>
</x-field-group>

以下是使用自定义配置的示例：

```typescript 配置示例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1",
  model: "Mistral-7B-Instruct-v0.2-GGUF",
  modelOptions: {
    temperature: 0.8,
    maxTokens: 4096,
  },
});
```

### 环境变量

您还可以通过设置环境变量来配置模型。如果两者都提供，构造函数选项将优先。

-   `LM_STUDIO_BASE_URL`：设置服务器的基础 URL。默认为 `http://localhost:1234/v1`。
-   `LM_STUDIO_API_KEY`：设置 API 密钥。仅在您的服务器需要身份验证时才需要。

```bash .env
LM_STUDIO_BASE_URL=http://localhost:1234/v1
# LM_STUDIO_API_KEY=your-key-if-needed
```

## 功能

`LMStudioChatModel` 支持多种高级功能，包括流式传输、工具调用和结构化输出。

### 流式传输

对于实时应用程序，您可以在生成响应时以流式方式传输响应。在 `invoke` 方法中设置 `streaming: true` 选项。

```typescript 流式传输示例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

async function streamStory() {
  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "给我讲一个关于机器人发现音乐的短篇故事。" }],
    },
    { streaming: true }
  );

  for await (const chunk of stream) {
    if (chunk.type === "delta" && chunk.delta.text) {
      process.stdout.write(chunk.delta.text.text);
    }
  }
}

streamStory();
```

### 工具调用

许多本地模型支持与 OpenAI 兼容的工具调用（也称为函数调用）。您可以向模型提供一个工具列表，它将生成调用这些工具所需的参数。

```typescript 工具调用示例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "获取指定地点的当前天气。",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "城市和州，例如：San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

async function checkWeather() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "纽约天气怎么样？" }
    ],
    tools,
  });

  if (response.toolCalls?.length) {
    console.log("工具调用:", JSON.stringify(response.toolCalls, null, 2));
  }
}

checkWeather();
```

### 结构化输出

为确保模型的输出符合特定的 JSON schema，您可以定义一个 `responseFormat`。这对于需要可靠、机器可读数据的任务非常有用。

```typescript 结构化输出示例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "weather_response",
    schema: {
      type: "object",
      properties: {
        location: { type: "string" },
        temperature: { type: "number" },
        description: { type: "string" },
      },
      required: ["location", "temperature", "description"],
    },
  },
};

async function getWeatherAsJson() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "巴黎的天气怎么样？请以请求的 JSON 格式回应。" }
    ],
    responseFormat,
  });

  console.log(response.json);
}

getWeatherAsJson();
```

## 支持的模型

LM Studio 支持多种 GGUF 格式的模型。确切的模型名称必须与 LM Studio 用户界面中显示的名称一致。热门的兼容模型包括：

| 模型系列 | 变体 |
| :----------- | :------------------------------------- |
| **Llama 3.2** | 3B, 8B, 70B Instruct |
| **Llama 3.1** | 8B, 70B, 405B Instruct |
| **Mistral** | 7B, 8x7B Instruct |
| **Phi-3** | Mini, Small, Medium Instruct |
| **CodeLlama** | 7B, 13B, 34B Instruct |
| **Qwen** | 各种大小 |

## 故障排除

如果您遇到问题，请查阅以下常见问题和解决方案列表。

| 问题 | 解决方案 |
| :------------------ | :--------------------------------------------------------------------------------------------------------- |
| **连接被拒绝** | 请验证 LM Studio 本地服务器是否正在运行，以及您代码中的 `baseURL` 是否正确。 |
| **找不到模型** | 请确保您代码中的 `model` 名称与 LM Studio 服务器中加载的模型文件名完全匹配。 |
| **响应缓慢** | 如果可用，请在 LM Studio 的服务器设置中启用 GPU 加速。使用较小的模型也可能有所帮助。 |
| **内存不足** | 模型可能需要比您系统可用内存更多的 RAM。请尝试使用较小的模型或减少上下文长度。 |

### 错误处理

一个好的做法是将您的模型调用包装在 `try...catch` 块中，以处理潜在的运行时错误，例如网络问题。

```typescript 错误处理示例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

async function safeInvoke() {
  try {
    const response = await model.invoke({
      messages: [{ role: "user", content: "你好！" }],
    });
    console.log(response.text);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("连接失败。请确保 LM Studio 服务器正在运行。");
    } else {
      console.error("发生意外错误:", error.message);
    }
  }
}

safeInvoke();
```

---

有关更详细的信息，请参阅官方 [LM Studio 文档](https://lmstudio.ai/docs)。要探索其他模型集成，您可以继续阅读 [AIGNE Hub](./models-aigne-hub.md) 的文档。