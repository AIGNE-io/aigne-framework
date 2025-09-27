# LM Studio

通过 LM Studio 的 OpenAI 兼容服务器在您自己的机器上运行本地语言模型。

AIGNE LM Studio 模型适配器提供了与 LM Studio 的无缝集成，允许您在 AIGNE 框架内使用本地大语言模型 (LLM)。如果您想试验不同的模型、离线工作或将数据保留在自己的机器上以保护隐私，这是一个很好的选择。

## 先决条件

在将 AIGNE 连接到 LM Studio 之前，您需要先在计算机上进行设置并运行它。

1.  **安装 LM Studio**：如果您尚未安装，请从官方网站下载并安装 LM Studio 应用程序：[https://lmstudio.ai/](https://lmstudio.ai/)
2.  **下载模型**：打开 LM Studio，使用搜索选项卡查找并下载一个模型。热门选择包括 Llama 3.2、Mistral 和 Phi-3。
3.  **启动本地服务器**：转到 LM Studio 中的“本地服务器”选项卡（通常有一个 `<->` 图标），然后单击“启动服务器”按钮。这将使您下载的模型可供 AIGNE 使用。

## 安装

要将 LM Studio 适配器添加到您的 AIGNE 项目中，请运行以下命令：

```bash Installation icon=lucide:package
npm install @aigne/lmstudio
```

## 快速入门

一旦您的 LM Studio 服务器开始运行，您只需几行代码即可连接到它。请确保 `model` 名称与您在 LM Studio 中加载的模型文件相匹配。

```typescript Quick Start Example icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 创建一个新的 LM Studio 聊天模型
const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1", // 默认的 LM Studio 服务器 URL
  model: "llama-3.2-3b-instruct", // LM Studio 中显示的模型名称
  modelOptions: {
    temperature: 0.7,
    maxTokens: 2048,
  },
});

// 向模型发送一条消息
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

console.log(response.text); // "法国的首都是巴黎。"
```

## 配置

您可以在创建模型实例时或通过使用环境变量来配置与 LM Studio 的连接。

### 构造函数选项

在创建 `LMStudioChatModel` 时，您可以传递以下选项：

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-default="llama-3.2-3b-instruct">
    <x-field-desc markdown>要使用的模型名称。这必须与您 LM Studio 界面中显示的模型标识符相匹配。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="http://localhost:1234/v1">
    <x-field-desc markdown>您的本地 LM Studio 服务器的 URL。默认值通常是正确的。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="false" data-default="not-required">
    <x-field-desc markdown>用于身份验证的 API 密钥。默认情况下，LM Studio 不需要 API 密钥，因此这是可选的。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制模型行为的附加选项。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。值越低越具确定性，值越高越具创造性。"></x-field>
    <x-field data-name="maxTokens" data-type="number" data-required="false" data-desc="响应中生成的最大令牌数。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心采样参数。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根据新令牌的现有频率对其进行惩罚。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根据新令牌是否已在文本中出现过对其进行惩罚。"></x-field>
  </x-field>
</x-field-group>

### 环境变量

或者，您可以使用环境变量来配置适配器，这有助于保持代码的整洁。

```bash Environment Variables icon=lucide:terminal
# LM Studio 服务器的 URL
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# API 密钥（仅当您在 LM Studio 中配置了身份验证时才需要）
# LM_STUDIO_API_KEY=your-key-if-needed
```

## 功能特性

LM Studio 适配器支持 AIGNE 框架的几项高级功能。

### 流式支持

您可以在模型生成响应时以流式方式获取响应，这对于创建实时聊天体验非常有用。

```typescript Streaming Example icon=logos:typescript
const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story" }],
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

一些本地模型支持函数调用，这允许模型请求使用外部工具来回答问题。

```typescript Tool Calling Example icon=logos:typescript
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get current weather information",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

const response = await model.invoke({
  messages: [
    { role: "user", content: "What's the weather like in New York?" }
  ],
  tools,
});

if (response.toolCalls?.length) {
  console.log("Tool calls:", response.toolCalls);
}
```

### 结构化输出

您可以指示模型以特定的 JSON 格式返回其响应，这对于可预测的、机器可读的输出非常有用。

```typescript Structured Output Example icon=logos:typescript
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

const response = await model.invoke({
  messages: [
    { role: "user", content: "Get weather for Paris in JSON format" }
  ],
  responseFormat,
});

console.log(response.json); // 解析后的 JSON 对象
```

## 支持的模型

LM Studio 可以运行大量开源模型。热门系列包括：

- Llama 3.2 & 3.1
- Mistral
- CodeLlama
- Qwen
- Phi-3

在配置 `model` 选项时，请记住使用您 LM Studio 界面中显示的确切模型名称。

## 问题排查

以下是一些常见问题的解决方案：

- **连接被拒绝**：这通常意味着 LM Studio 中的本地服务器没有运行。请转到“本地服务器”选项卡，并确保您已单击“启动服务器”。
- **找不到模型**：请仔细检查您代码中的 `model` 名称是否与 LM Studio 中显示的模型标识符完全匹配。
- **内存不足**：您的计算机可能没有足够的 RAM 来运行所选模型。请尝试使用较小的模型（例如，3B 或 8B 参数的模型）。
- **响应缓慢**：运行大型模型可能会很慢，尤其是在没有专用 GPU 的情况下。使用较小的模型将提高性能。