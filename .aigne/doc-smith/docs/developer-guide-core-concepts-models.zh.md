本文档详细概述了 `ChatModel` 类，这是与大语言模型 (LLM) 交互的基础组件。它涵盖了该类的架构、其输入和输出格式，以及支持工具调用和结构化数据处理等强大功能的相关数据结构。

```d2
direction: down

User-Application: {
  label: "用户 / 应用程序"
  shape: c4-person
}

ChatModel-System: {
  label: "ChatModel 系统"
  shape: rectangle

  ChatModel: {
    label: "ChatModel 实例"
  }

  LLM: {
    label: "大语言模型"
    shape: cylinder
  }

  Tools: {
    label: "工具 / 函数"
  }
}

User-Application -> ChatModel-System.ChatModel: "1. invoke(输入)"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "2. 发送格式化请求"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "3. 接收 LLM 响应"

# 路径 A：简单文本响应
ChatModel-System.ChatModel -> User-Application: "4a. 返回带文本的输出"

# 路径 B：工具调用响应
ChatModel-System.ChatModel -> ChatModel-System.Tools: "4b. 执行工具调用"
ChatModel-System.Tools -> ChatModel-System.ChatModel: "5b. 返回工具结果"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "6b. 发送结果以获取最终答案"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "7b. 接收最终响应"
ChatModel-System.ChatModel -> User-Application: "8b. 返回最终输出"
```

## ChatModel

`ChatModel` 类是一个用于与大语言模型 (LLM) 交互的抽象基类。它继承自 `Agent` 类，并提供了一个用于管理模型输入、输出和功能的标准化接口。针对特定模型（例如 OpenAI、Anthropic）的具体实现应继承此类。

### 核心概念

- **可扩展性**：`ChatModel` 专为扩展而设计，允许开发者通过实现抽象的 `process` 方法为各种 LLM 创建自定义连接器。
- **统一接口**：它为流式和非流式响应提供了统一的 API，简化了与不同模型的交互。
- **工具集成**：该类为工具调用提供内置支持，使模型能够与外部函数和数据源进行交互。
- **结构化输出**：`ChatModel` 可以在模型输出上强制执行 JSON schema 合规性，确保数据可靠且结构化。
- **自动重试**：它包含一个默认的重试机制，用于处理网络错误和结构化输出生成问题。

### 关键方法

#### `constructor(options?: ChatModelOptions)`

创建 `ChatModel` 的新实例。

<x-field-group>
  <x-field data-name="options" data-type="ChatModelOptions" data-required="false" data-desc="Agent 的配置选项。">
    <x-field data-name="model" data-type="string" data-required="false" data-desc="要使用的模型的名称或标识符。"></x-field>
    <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="每次调用时传递给模型的默认选项。"></x-field>
    <x-field data-name="retryOnError" data-type="boolean | object" data-required="false" data-desc="错误重试配置。默认为网络和结构化输出错误重试 3 次。"></x-field>
  </x-field>
</x-field-group>

#### `process(input: ChatModelInput, options: AgentInvokeOptions)`

所有子类都必须实现的核心抽象方法。它处理与底层 LLM 的直接通信，包括发送请求和处理响应。

<x-field-group>
  <x-field data-name="input" data-type="ChatModelInput" data-required="true" data-desc="包含消息、工具和模型选项的标准化输入。"></x-field>
  <x-field data-name="options" data-type="AgentInvokeOptions" data-required="true" data-desc="Agent 调用的选项，包括上下文和限制。"></x-field>
</x-field-group>

#### `preprocess(input: ChatModelInput, options: AgentInvokeOptions)`

在主 `process` 方法被调用之前执行操作。这包括验证令牌限制和规范化工具名称以与 LLM 兼容。

#### `postprocess(input: ChatModelInput, output: ChatModelOutput, options: AgentInvokeOptions)`

在 `process` 方法完成后执行操作。其主要作用是更新调用上下文中的令牌使用统计信息。

### 输入数据结构

#### `ChatModelInput`

`ChatModel` 的主输入接口。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true" data-desc="要发送给模型的消息数组。"></x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false" data-desc="指定所需的输出格式（例如，文本或 JSON）。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="文件输出所需的格式（'local' 或 'file'）。"></x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false" data-desc="模型可以使用的工具列表。"></x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false" data-desc="工具选择策略（例如 'auto'、'required'）。"></x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="模型特定的配置选项。"></x-field>
</x-field-group>

#### `ChatModelInputMessage`

代表对话历史中的单条消息。

<x-field-group>
    <x-field data-name="role" data-type="Role" data-required="true" data-desc="消息作者的角色（'system'、'user'、'agent' 或 'tool'）。"></x-field>
    <x-field data-name="content" data-type="ChatModelInputMessageContent" data-required="false" data-desc="消息的内容，可以是字符串或富内容数组。"></x-field>
    <x-field data-name="toolCalls" data-type="object[]" data-required="false" data-desc="对于 'agent' 角色，模型请求的工具调用列表。"></x-field>
    <x-field data-name="toolCallId" data-type="string" data-required="false" data-desc="对于 'tool' 角色，此消息所响应的工具调用的 ID。"></x-field>
</x-field-group>

#### `ChatModelInputTool`

定义模型可以调用的工具。

<x-field-group>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="工具的类型。目前仅支持 'function'。"></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="函数定义。">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="函数的名称。"></x-field>
        <x-field data-name="description" data-type="string" data-required="false" data-desc="函数功能的描述。"></x-field>
        <x-field data-name="parameters" data-type="object" data-required="true" data-desc="定义函数参数的 JSON schema 对象。"></x-field>
    </x-field>
</x-field-group>

### 输出数据结构

#### `ChatModelOutput`

`ChatModel` 的主输出接口。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="模型的文本响应。"></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="模型的 JSON 响应，如果请求了 JSON schema。"></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false" data-desc="模型希望执行的工具调用列表。"></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="调用的令牌使用统计信息。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="生成响应的模型的名称。"></x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false" data-desc="模型生成的文件列表。"></x-field>
</x-field-group>

#### `ChatModelOutputToolCall`

代表模型请求的单个工具调用。

<x-field-group>
    <x-field data-name="id" data-type="string" data-required="true" data-desc="此工具调用的唯一标识符。"></x-field>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="工具的类型。"></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="函数调用详情。">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="要调用的函数的名称。"></x-field>
        <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="传递给函数的参数，解析为 JSON 对象。"></x-field>
    </x-field>
</x-field-group>

#### `ChatModelOutputUsage`

提供有关令牌消耗的信息。

<x-field-group>
    <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="输入提示中使用的令牌数量。"></x-field>
    <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="输出中生成的令牌数量。"></x-field>
    <x-field data-name="aigneHubCredits" data-type="number" data-required="false" data-desc="如果使用 AIGNE Hub 服务，则消耗的积分。"></x-field>
</x-field-group>