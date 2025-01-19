# 实现自定义 LLM Model 的指南

本文档将指导您在 AIGNE 框架中实现一个自定义的 LLM Model，并了解其核心原理和实现细节。

## 概述

AIGNE 框架支持扩展，允许您通过实现自定义的 `LLMModel` 类来与任意 LLM 服务交互。本示例基于 OpenAI 的 API，展示如何实现自定义的 LLM 模型类 `OpenaiLLMModel`，包括消息传递、工具调用、流式处理和 JSON Schema 响应格式支持。

## 核心组件

### 1. **模型输入结构**

`LLMModelInputs` 定义了输入数据结构：

- `messages`：LLM 接收的消息数组，每条消息包括角色、内容和工具调用信息。
- `responseFormat`：定义响应格式，可选择 `text` 或 `json_schema`。
- `tools`：提供给模型的工具集，用于增强功能。
- `toolChoice`：指定工具调用策略，例如自动选择工具或指定工具。
- `modelOptions`：模型的运行选项，例如温度、频率惩罚。

```typescript
export interface LLMModelInputs {
  messages: LLMModelInputMessage[];
  responseFormat?: ...;
  tools?: LLMModelInputTool[];
  toolChoice?: ...;
  modelOptions?: LLMModelOptions;
}
```

### 2. **模型输出结构**

`LLMModelOutputs` 定义了模型的输出：

- `$text`：模型返回的文本内容。
- `toolCalls`：模型生成的工具调用列表。

```typescript
export interface LLMModelOutputs {
  $text?: string | null;
  toolCalls?: {
    id?: string;
    type?: "function";
    function?: {
      name?: string;
      arguments?: string;
    };
  }[];
}
```

### 3. **消息处理工具函数**

- `contentsFromInputMessages`：将用户输入的消息转换为适配 OpenAI API 的格式。
- `toolsFromInputTools`：将工具定义转换为 OpenAI API 格式。
- `jsonSchemaToOpenAIJsonSchema`：将 JSON Schema 转换为 OpenAI 支持的格式。

## 实现自定义模型

以下是自定义模型 `OpenaiLLMModel` 的核心实现代码和逻辑：

### 1. **构造函数**

构造函数接收配置参数，包括 API Key 和模型名称，并初始化 OpenAI 客户端。

```typescript
constructor(private config: { apiKey: string; model: string }) {
  super();
  this.client = new OpenAI({ apiKey: this.config.apiKey });
}

setApiKey(apiKey: string) {
  this.client = new OpenAI({ apiKey });
}
```

### 2. **处理逻辑**

`process` 方法实现核心处理逻辑：

- 构建 OpenAI 请求参数，包括模型选项、消息内容、工具和响应格式。
- 通过 OpenAI 客户端发起请求并启用流式处理。
- 将工具调用和响应文本组合为标准输出格式。

```typescript
async *process(input: LLMModelInputs) {
  const res = await this.client.chat.completions.create({
    model: this.config.model,
    temperature: input.modelOptions?.temperature,
    top_p: input.modelOptions?.topP,
    ...,
    stream: true,
  });

  const toolCalls: LLMModelOutputs["toolCalls"] = [];

  for await (const chunk of res) {
    const choice = chunk.choices?.[0];
    const calls = choice?.delta.tool_calls?.map((i) => ({
      id: i.id || nanoid(),
      type: "function",
      function: { name: i.function?.name, arguments: i.function?.arguments },
    }));

    if (calls?.length) {
      toolCalls.push(...calls);
    }

    yield {
      $text: choice?.delta.content || undefined,
      delta: { toolCalls },
    };
  }
}
```

## 如何扩展

### 定制模型行为

通过修改 `process` 方法，可以自定义模型的行为，例如：

- 自定义消息转换逻辑。
- 实现特定工具调用策略。
- 优化流式处理性能。

### 增强模型功能

- 添加对更多响应格式的支持。
- 实现多模型切换。
- 集成自定义工具。

## 注意事项

1. **流式处理**：确保处理器能正确解析流数据。
2. **工具调用**：所有工具参数必须符合 OpenAI API 的格式规范。
3. **JSON Schema 格式**：确保 JSON Schema 中所有字段均为必填。

通过本文档，您应该能够实现一个功能完备的自定义 LLM Model，并根据需要对其扩展和优化。
