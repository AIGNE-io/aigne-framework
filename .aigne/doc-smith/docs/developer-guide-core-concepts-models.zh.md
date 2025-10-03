# 模型

在 AIGNE 框架中，`Model` 类是特殊的 Agent，作为与各种底层 AI 模型（例如来自 OpenAI、Anthropic 或 Google 的模型）交互的标准化接口。它们抽象了特定于提供商的复杂性，使你能够通过一致的 API 与不同的 AI 功能进行交互。

这种设计将你的 Agent 逻辑与具体的 AI 模型实现解耦。你只需更改模型 Agent 实例，就可以用最少的代码改动将 `gpt-4` 模型替换为 `claude-3` 模型。

模型的两个主要基类是：

*   **`ChatModel`**：用于基于文本的对话式 AI（大型语言模型或 LLM）。
*   **`ImageModel`**：用于文生图模型。

## ChatModel

`ChatModel` 是一个专为与 LLM 交互而设计的抽象基类。它标准化了发送消息、定义工具以及处理响应（包括文本、JSON 和工具调用）的过程。任何特定的模型集成，例如 OpenAI 的 GPT 系列，都将继承此类。

### ChatModel 输入

`ChatModelInput` 接口定义了向模型提供信息的结构。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true">
    <x-field-desc markdown>构成对话历史和当前提示的消息对象数组。每条消息都有一个 `role`（`system`、`user`、`agent` 或 `tool`）和 `content`。</x-field-desc>
  </x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false">
    <x-field-desc markdown>指定期望的输出格式。可以是 `{ type: 'text' }`（纯文本），也可以是 `{ type: 'json_schema', jsonSchema: { ... } }` 以在响应中强制执行特定的 JSON 结构。</x-field-desc>
  </x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false">
    <x-field-desc markdown>模型可选择调用的函数工具列表。每个工具定义都包括其 `name`、`description` 以及定义为 JSON schema 的 `parameters`。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false">
    <x-field-desc markdown>控制模型如何使用工具。可以是 `'auto'`（默认）、`'none'`、`'required'`，或一个指定要调用的特定函数的对象。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="用于控制模型行为的特定于提供商的选项。">
    <x-field data-name="model" data-type="string" data-required="false" data-desc="特定的模型名称或版本（例如 'gpt-4o'）。"></x-field>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性。值越接近 0，输出就越确定。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="控制核心采样。"></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="是否允许模型并行调用多个工具。"></x-field>
  </x-field>
</x-field-group>

### ChatModel 输出

`ChatModelOutput` 接口表示来自模型的结构化响应。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="模型响应的文本内容。"></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="当 `responseFormat` 设置为 'json_schema' 时，模型返回的 JSON 对象。"></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false">
    <x-field-desc markdown>模型请求的工具调用数组。每个对象都包含一个唯一的 `id`、要调用的 `function.name` 和 `function.arguments` 对象。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="object" data-required="false" data-desc="交互的 Token 使用情况统计。">
    <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="输入提示中的 Token 数量。"></x-field>
    <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="生成的响应中的 Token 数量。"></x-field>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="处理该请求的模型名称。"></x-field>
</x-field-group>

## ImageModel

`ImageModel` 是一个用于文生图模型的抽象基类。它为通过文本提示创建图像提供了一个简单且一致的接口。

### ImageModel 输入

`ImageModelInput` 接口定义了生成图像所需的数据。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="对要生成的图像的详细文本描述。"></x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false" data-desc="一个可选的图像数组，可用于编辑或作为基础。"></x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-desc="要生成的图像数量。默认为 1。"></x-field>
  <x-field data-name="outputFileType" data-type="string" data-required="false" data-desc="指定图像文件的期望输出格式，例如 'local'（保存到临时文件）或 'file'（base64 编码的字符串）。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="特定于提供商的选项，例如 `model` 名称、图像尺寸或质量设置。"></x-field>
</x-field-group>

### ImageModel 输出

`ImageModelOutput` 包含生成的图像和使用数据。

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true" data-desc="生成的图像数组，其中每个项目的格式由 `outputFileType` 输入参数决定。"></x-field>
  <x-field data-name="usage" data-type="object" data-required="false" data-desc="生成任务的 Token 使用情况统计。">
      <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="输入提示中的 Token 数量。"></x-field>
      <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="用于输出生成的 Token 估算数量。"></x-field>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="处理该请求的图像模型名称。"></x-field>
</x-field-group>

## 总结

模型是连接你的 AIGNE Agent 与各提供商提供的强大 AI 功能之间的桥梁。通过使用 `ChatModel` 和 `ImageModel` 抽象，你可以构建不受单一技术栈限制的、健壮且灵活的 AI 应用程序。

要了解如何为这些模型动态构建输入，请继续阅读[提示](./developer-guide-core-concepts-prompts.md)部分。