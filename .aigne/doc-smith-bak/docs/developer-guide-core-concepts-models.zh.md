# 模型

模型是专门的 Agent，作为关键的抽象层，为与外部 AI 服务（如大型语言模型 (LLMs) 和图像生成平台）的交互提供标准化接口。它们封装了 API 通信的复杂性，使开发者能够通过一致且统一的契约与各种 AI 提供商合作。

AIGNE 框架定义了一个基础的 `Model` 类，它被两个主要特化类扩展：用于基于文本的对话式 AI 的 `ChatModel` 和用于图像生成任务的 `ImageModel`。这些抽象是构建更高级别 Agent（如 `AIAgent` 和 `ImageAgent`）的基础。

## 核心概念

`Model` 层旨在简化与不同 AI 提供商的交互。您无需为每项服务（如 OpenAI、Anthropic 或 Google Gemini）编写特定于提供商的代码，而是与标准化的 `ChatModel` 或 `ImageModel` 接口进行交互。AIGNE 框架通过特定的模型包（例如 `@aigne/openai`）处理这种标准格式与提供商原生 API 之间的转换。

此设计具有几个关键优势：
- **提供商无关性：** 更换底层 AI 模型时只需最少的代码更改。例如，只需更改模型实例化，就可以从 OpenAI 的 GPT-4 切换到 Anthropic 的 Claude 3。
- **标准化数据结构：** 所有模型都使用一致的输入和输出模式（`ChatModelInput`、`ImageModelOutput` 等），从而简化了数据处理和 Agent 组合。
- **简化的 API：** 模型提供了一个简洁的高级 API，它抽象了每个外部服务的身份验证、请求格式化和错误处理的细微差别。

下图说明了基础 `Agent`、`Model` 抽象以及它们连接的外部 AI 服务之间的关系。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Models](assets/diagram/models-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## ChatModel 抽象

`ChatModel` 是一个为与大型语言模型 (LLMs) 对接而设计的抽象类。它提供了一种结构化的方式来处理对话交互，包括多轮对话、工具使用和结构化数据提取。

### ChatModelInput

`ChatModelInput` 接口定义了发送给语言模型的请求的数据结构。它标准化了消息、工具和其他配置的传递方式。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true">
    <x-field-desc markdown>构成对话历史和当前提示的消息对象数组。</x-field-desc>
  </x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false">
    <x-field-desc markdown>指定模型输出的期望格式，例如纯文本或基于所提供模式的结构化 JSON。</x-field-desc>
  </x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false">
    <x-field-desc markdown>模型可以请求调用的可用工具（函数）列表，用于执行操作或检索信息。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false">
    <x-field-desc markdown>控制模型如何使用提供的工具。可以设置为 `\"auto\"`、`\"none\"`、`\"required\"` 或强制进行特定的函数调用。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false">
    <x-field-desc markdown>用于存放特定于提供商的选项的容器，例如 `temperature`、`topP` 或 `parallelToolCalls`。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'local' | 'file'" data-required="false">
    <x-field-desc markdown>为任何基于文件的输出指定期望的格式，可以是本地文件路径 (`local`) 或 base64 编码的字符串 (`file`)。</x-field-desc>
  </x-field>
</x-field-group>

#### ChatModelInputMessage

`messages` 数组中的每条消息都遵循一个已定义的结构。

<x-field-group>
  <x-field data-name="role" data-type="'system' | 'user' | 'agent' | 'tool'" data-required="true">
    <x-field-desc markdown>消息发送者的角色。`system` 提供指令，`user` 代表用户输入，`agent` 用于模型响应，`tool` 用于工具调用的输出。</x-field-desc>
  </x-field>
  <x-field data-name="content" data-type="string | UnionContent[]" data-required="false">
    <x-field-desc markdown>消息的内容。可以是一个简单的字符串，也可以是用于多模态内容的数组，结合了文本和图像 (`FileUnionContent`)。</x-field-desc>
  </x-field>
  <x-field data-name="toolCalls" data-type="object[]" data-required="false">
    <x-field-desc markdown>在 `agent` 消息中使用，表示由模型发起的一个或多个工具调用。</x-field-desc>
  </x-field>
  <x-field data-name="toolCallId" data-type="string" data-required="false">
    <x-field-desc markdown>在 `tool` 消息中使用，用于将工具的输出链接回相应的 `toolCalls` 请求。</x-field-desc>
  </x-field>
</x-field-group>

### ChatModelOutput

`ChatModelOutput` 接口标准化了从语言模型接收到的响应。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false">
    <x-field-desc markdown>模型响应的基于文本的内容。</x-field-desc>
  </x-field>
  <x-field data-name="json" data-type="object" data-required="false">
    <x-field-desc markdown>当 `responseFormat` 设置为 `\"json_schema\"` 时，模型返回的 JSON 对象。</x-field-desc>
  </x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false">
    <x-field-desc markdown>模型发出的工具调用请求数组。每个对象都包含函数名和参数。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false">
    <x-field-desc markdown>包含令牌使用统计信息的对象，包括 `inputTokens` 和 `outputTokens`。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>生成响应的模型的标识符。</x-field-desc>
  </x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false">
    <x-field-desc markdown>模型生成的文件数组（如果有）。</x-field-desc>
  </x-field>
</x-field-group>

## ImageModel 抽象

`ImageModel` 是一个用于与图像生成模型对接的抽象类。它为基于文本提示创建或编辑图像提供了一个简化的契约。

### ImageModelInput

`ImageModelInput` 接口定义了图像生成任务的请求结构。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>对所需图像的文本描述。</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false">
    <x-field-desc markdown>一个可选的输入图像数组，用于图像编辑或创建变体等任务。</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false">
    <x-field-desc markdown>要生成的图像数量。默认为 1。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'local' | 'file'" data-required="false">
    <x-field-desc markdown>指定输出图像应保存为本地文件 (`local`) 还是作为 base64 编码的字符串 (`file`) 返回。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="ImageModelInputOptions" data-required="false">
    <x-field-desc markdown>用于存放特定于提供商的选项的容器，例如图像尺寸、质量或风格预设。</x-field-desc>
  </x-field>
</x-field-group>

### ImageModelOutput

`ImageModelOutput` 接口定义了来自图像生成服务的响应结构。

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true">
    <x-field-desc markdown>生成图像的数组。每个元素的格式取决于输入中指定的 `outputFileType`。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false">
    <x-field-desc markdown>包含使用情况统计信息的对象，其中可能包括令牌计数或其他特定于提供商的指标。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>生成图像的模型的标识符。</x-field-desc>
  </x-field>
</x-field-group>

## 文件内容类型

模型通过 `FileUnionContent` 类型处理多模态任务的各种文件输入形式。这种可辨识联合类型允许文件以三种方式表示：

-   **`LocalContent`**：表示存储在本地文件系统上的文件。
    -   `type`: "local"
    -   `path`: 文件的绝对路径。
-   **`UrlContent`**：表示可通过公共 URL 访问的文件。
    -   `type`: "url"
    -   `url`: 文件的 URL。
-   **`FileContent`**：表示为 base64 编码字符串的文件。
    -   `type`: "file"
    -   `data`: 文件的 base64 编码内容。

`Model` 基类包含一个 `transformFileType` 方法，可以根据需要自动在这些格式之间进行转换，从而简化了跨不同 Agent 和模型提供商的文件处理。

## 总结

`ChatModel` 和 `ImageModel` 抽象是使 AIGNE 框架灵活且与提供商无关的核心组件。它们为与广泛的外部 AI 服务交互提供了一个稳定、标准化的接口。

-   要了解如何在实践中使用这些模型，请参阅 [AI Agent](./developer-guide-agents-ai-agent.md) 和 [Image Agent](./developer-guide-agents-image-agent.md) 的文档。
-   有关配置 OpenAI、Anthropic 或 Google Gemini 等特定提供商的详细信息，请参阅 [模型](./models.md) 部分的指南。