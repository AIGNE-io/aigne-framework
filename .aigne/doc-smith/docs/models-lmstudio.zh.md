本文档提供了 `@aigne/lmstudio` 包的综合使用指南，该包是一个 AIGNE 模型适配器，用于通过 LM Studio 与本地托管的 AI 模型进行集成。

## 概述

`@aigne/lmstudio` 模型适配器可与 LM Studio 兼容 OpenAI 的 API 无缝集成，让您可以通过 AIGNE 框架运行本地大语言模型 (LLMs)。LM Studio 提供了一个用户友好的界面，用于下载、管理和运行本地 AI 模型，并内置一个模拟 OpenAI API 的服务器。

该适配器继承自 `@aigne/openai` 包，这意味着它支持熟悉的 OpenAI API 结构，可用于聊天、流式传输、工具/函数调用和结构化输出等操作。

## 先决条件

在使用此包之前，您必须完成以下步骤：

1.  **安装 LM Studio**：从官方网站下载并安装 LM Studio 应用程序：[https://lmstudio.ai/](https://lmstudio.ai/)
2.  **下载模型**：使用 LM Studio 界面搜索并下载本地模型。热门选择包括 Llama 3.2、Mistral 和 Phi-3。
3.  **启动本地服务器**：在 LM Studio 中导航至“Local Server”选项卡，选择您下载的模型，然后点击“Start Server”。这将开放一个本地端点（通常是 `http://localhost:1234/v1`），适配器将连接到该端点。

## 安装

使用您喜欢的包管理器将该包安装到您的项目中：

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

以下示例演示了如何创建 `LMStudioChatModel` 的实例并发出基本请求。

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. 创建一个新的 LM Studio 聊天模型实例
const model = new LMStudioChatModel({
  // baseURL 应与您的 LM Studio 本地服务器地址匹配
  baseURL: "http://localhost:1234/v1",
  // 模型名称必须与 LM Studio 中加载的名称完全匹配
  model: "llama-3.2-3b-instruct",
  modelOptions: {
    temperature: 0.7,
    maxTokens: 2048,
  },
});

// 2. 使用用户消息调用模型
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

// 3. 打印响应文本
console.log(response.text);
// 预期输出："The capital of France is Paris."
```

## 配置

您可以通过 `LMStudioChatModel` 的构造函数或使用环境变量来对其进行配置。

### 构造函数选项

`LMStudioChatModel` 扩展了 `OpenAIChatModel`，因此它接受标准的 OpenAI 选项。

```typescript
const model = new LMStudioChatModel({
  // LM Studio 服务器的基础 URL（默认为 http://localhost:1234/v1）
  baseURL: "http://localhost:1234/v1",
  
  // 模型标识符，必须与 LM Studio 中加载的标识符匹配
  model: "llama-3.2-3b-instruct",

  // 本地 LM Studio 实例不需要 API 密钥
  // 默认为 "not-required"
  // apiKey: "your-key-if-needed",

  // 标准模型选项
  modelOptions: {
    temperature: 0.7,     // 控制随机性（0.0 到 2.0）
    maxTokens: 2048,      // 响应中的最大 token 数
    topP: 0.9,            // 核心采样
    frequencyPenalty: 0,  // 根据新 token 的频率对其进行惩罚
    presencePenalty: 0,   // 根据新 token 是否已存在对其进行惩罚
  },
});
```

### 环境变量

为了更灵活地进行配置，您可以使用环境变量：

```bash
# 设置 LM Studio 服务器 URL（默认值：http://localhost:1234/v1）
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# 本地 LM Studio 默认不需要 API 密钥。
# 仅当您在服务器上配置了身份验证时才设置此项。
# LM_STUDIO_API_KEY=your-key-if-needed
```

**注意：** LM Studio 通常在本地运行时无需身份验证。API 密钥默认设置为占位符值 `"not-required"`，以满足底层 OpenAI 客户端的要求。

## 功能

该适配器支持多种高级功能，包括流式传输、工具调用和结构化 JSON 输出。

### 流式传输支持

对于实时响应，您可以从模型中流式传输输出。这对于聊天机器人等应用非常有用，因为您希望在生成响应时就显示它。

```typescript
const model = new LMStudioChatModel();

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot who discovers music." }],
  },
  { streaming: true }
);

for await (const chunk of stream) {
  if (chunk.type === "delta" && chunk.delta.text) {
    process.stdout.write(chunk.delta.text.text);
  }
}
```

### 工具和函数调用

该适配器支持兼容 OpenAI 的函数调用，允许模型请求调用外部工具。

```typescript
// 定义工具规范
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather information for a specified location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g., San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

// 使用工具调用模型
const response = await model.invoke({
  messages: [
    { role: "user", content: "What's the weather like in New York?" }
  ],
  tools,
});

// 检查模型是否请求了工具调用
if (response.toolCalls?.length) {
  console.log("Tool calls:", response.toolCalls);
  // 示例输出：
  // Tool calls: [ { id: '...', type: 'function', function: { name: 'get_weather', arguments: '{"location":"New York"}' } } ]
}
```

### 结构化输出 (JSON)

您可以指示模型生成符合特定 JSON 模式的响应。

```typescript
// 为输出定义所需的 JSON 模式
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

// 使用响应格式调用模型
const response = await model.invoke({
  messages: [
    { role: "user", content: "Get the current weather for Paris in JSON format." }
  ],
  responseFormat,
});

// 解析后的 JSON 对象可在 `response.json` 字段中找到
console.log(response.json);
```

## 支持的模型

LM Studio 支持各种开源模型。配置中使用的模型名称必须与 LM Studio 界面中显示的名称完全匹配。热门选择包括：

-   **Llama 3.2** (3B, 8B, 70B variants)
-   **Llama 3.1** (8B, 70B, 405B variants)
-   **Mistral** (7B, 8x7B variants)
-   **CodeLlama** (7B, 13B, 34B variants)
-   **Qwen** (various sizes)
-   **Phi-3** (mini, small, medium variants)

## 错误处理

与本地服务器交互时，处理潜在的连接错误非常重要。一个常见问题是 LM Studio 服务器未处于活动状态。

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

try {
  const response = await model.invoke({
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(response.text);
} catch (error) {
  // 专门检查连接拒绝错误
  if (error.code === "ECONNREFUSED") {
    console.error("连接失败：LM Studio 服务器未运行。请启动本地服务器。");
  } else {
    console.error("发生意外错误：", error.message);
  }
}
```

## 故障排除

以下是常见问题的解决方法：

1.  **连接被拒绝**：当 LM Studio 本地服务器未运行时，会发生此错误 (`ECONNREFUSED`)。请确保您已在 LM Studio 应用程序的“Local Server”选项卡中启动服务器。
2.  **模型未找到**：如果您收到“model not found”错误，请验证您配置中的 `model` 名称是否与 LM Studio 中加载的模型文件名完全匹配。
3.  **内存不足**：大型模型会消耗大量系统资源。如果您遇到崩溃或内存问题，请尝试使用较小的模型（例如 3B 或 8B 参数变体）或减少上下文长度 (`maxTokens`)。
4.  **响应缓慢**：响应速度取决于您的硬件（CPU/GPU）和模型大小。为了加快推理速度，如果您的硬件支持 GPU 加速并且在 LM Studio 中配置正确，请考虑使用 GPU 加速。