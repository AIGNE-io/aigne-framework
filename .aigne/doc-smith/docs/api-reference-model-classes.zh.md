# 模型类

模型类是为与各种 AI 模型（如大型语言模型 (LLM) 和图像生成模型）进行交互而设计的抽象基类。通过扩展这些类，您可以为不同的 AI 服务提供商创建自定义集成，同时在 AIGNE 框架内保持一致的 API。

本节记录了两个主要的模型基类：用于基于文本交互的 `ChatModel` 和用于图像生成任务的 `ImageModel`。

## ChatModel

`ChatModel` 是用于与大型语言模型 (LLM) 交互的抽象基类。它扩展了 `Agent` 类，并为处理基于文本的输入、输出、工具调用和其他模型功能提供了一个通用接口。具体的模型实现（如 OpenAI、Anthropic 等）应从此类继承。

### ChatModelOptions

这些选项用于配置 `ChatModel` 实例。

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="特定的模型标识符（例如，'gpt-4-turbo'）。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="每次请求时传递的模型特定配置选项。">
    <x-field-desc markdown>有关详细信息，请参阅 `ChatModelInputOptions`。</x-field-desc>
  </x-field>
  <x-field data-name="retryOnError" data-type="boolean | object" data-required="false" data-default="{ retries: 3, ... }">
    <x-field-desc markdown>用于在网络错误或 `StructuredOutputError` 时重试的配置。默认为 3 次重试。</x-field-desc>
  </x-field>
</x-field-group>

### ChatModelInput

此接口定义了发送到 `ChatModel` 的 `process` 方法的输入的结构。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true" data-desc="构成对话历史的消息数组。"></x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false" data-desc="指定模型响应的所需格式。">
    <x-field data-name="type" data-type="'text' | 'json_schema'" data-required="true" data-desc="响应格式的类型。"></x-field>
    <x-field data-name="jsonSchema" data-type="object" data-required="false" data-desc="如果类型为 'json_schema'，则此项为必需。定义 JSON 输出的模式。">
      <x-field data-name="name" data-type="string" data-required="true" data-desc="模式的名称。"></x-field>
      <x-field data-name="description" data-type="string" data-required="false" data-desc="模式的描述。"></x-field>
      <x-field data-name="schema" data-type="object" data-required="true" data-desc="JSON 模式定义。"></x-field>
      <x-field data-name="strict" data-type="boolean" data-required="false" data-desc="是否强制执行严格的模式验证。"></x-field>
    </x-field>
  </x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="为任何输出文件指定所需的文件格式（例如，'local'、'file'）。"></x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false" data-desc="模型可以选择调用的工具列表。"></x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false" data-desc="控制模型如何使用工具。可以是 'auto'、'none'、'required' 或指定函数的对象。"></x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="此请求的模型特定配置选项。"></x-field>
</x-field-group>

#### ChatModelInputMessage

<x-field-group>
  <x-field data-name="role" data-type="'system' | 'user' | 'agent' | 'tool'" data-required="true" data-desc="消息作者的角色。"></x-field>
  <x-field data-name="content" data-type="string | UnionContent[]" data-required="false" data-desc="消息内容，可以是简单字符串或用于多模态内容的数组。"></x-field>
  <x-field data-name="toolCalls" data-type="object[]" data-required="false" data-desc="对于 'agent' 角色，模型请求的工具调用列表。">
      <x-field data-name="id" data-type="string" data-required="true" data-desc="工具调用的唯一标识符。"></x-field>
      <x-field data-name="type" data-type="'function'" data-required="true" data-desc="工具的类型，目前仅为 'function'。"></x-field>
      <x-field data-name="function" data-type="object" data-required="true" data-desc="要调用的函数的详细信息。">
          <x-field data-name="name" data-type="string" data-required="true" data-desc="函数的名称。"></x-field>
          <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="传递给函数的参数。"></x-field>
      </x-field>
  </x-field>
  <x-field data-name="toolCallId" data-type="string" data-required="false" data-desc="对于 'tool' 角色，此消息所响应的工具调用的 ID。"></x-field>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="消息发送者的名称，在多 Agent 场景中很有用。"></x-field>
</x-field-group>

#### ChatModelInputOptions

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="此特定请求的模型名称或版本。"></x-field>
  <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制随机性 (0-1)。值越高意味着输出越随机。"></x-field>
  <x-field data-name="topP" data-type="number" data-required="false" data-desc="通过核心采样控制多样性。"></x-field>
  <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根据新词元在文本中至今的现有频率对其进行惩罚。"></x-field>
  <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根据新词元是否已在文本中出现过对其进行惩罚。"></x-field>
  <x-field data-name="parallelToolCalls" data-type="boolean" data-required="false" data-desc="是否允许模型进行并行工具调用。"></x-field>
  <x-field data-name="modalities" data-type="('text' | 'image' | 'audio')[]" data-required="false" data-desc="指定模型应处理的模态。"></x-field>
  <x-field data-name="preferInputFileType" data-type="'file' | 'url'" data-required="false" data-desc="处理文件输入的首选格式。"></x-field>
</x-field-group>

### ChatModelOutput

此接口定义了 `ChatModel` 返回的输出的结构。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="模型响应的文本内容。"></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="如果 `responseFormat` 设置为 `json_schema`，则为模型返回的 JSON 对象。"></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false" data-desc="模型请求执行的工具调用列表。"></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="请求的词元使用情况统计。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="生成响应的模型的标识符。"></x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false" data-desc="模型生成的文件数组。"></x-field>
</x-field-group>

#### ChatModelOutputToolCall

<x-field-group>
  <x-field data-name="id" data-type="string" data-required="true" data-desc="工具调用的唯一标识符。"></x-field>
  <x-field data-name="type" data-type="'function'" data-required="true" data-desc="工具的类型，目前仅为 'function'。"></x-field>
  <x-field data-name="function" data-type="object" data-required="true" data-desc="要调用的函数的详细信息。">
    <x-field data-name="name" data-type="string" data-required="true" data-desc="要调用的函数的名称。"></x-field>
    <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="传递给函数的参数，通常为 JSON 对象。"></x-field>
  </x-field>
</x-field-group>

#### ChatModelOutputUsage

<x-field-group>
  <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="输入提示中的词元数。"></x-field>
  <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="生成响应中的词元数。"></x-field>
  <x-field data-name="aigneHubCredits" data-type="number" data-required="false" data-desc="如果请求通过 AIGNE Hub 处理，则为信用点数使用情况。"></x-field>
</x-field-group>

## ImageModel

`ImageModel` 是用于与图像生成和编辑模型交互的抽象基类。它为发送提示和接收图像数据提供了一个标准化的接口。

### ImageModelOptions

这些选项用于配置 `ImageModel` 实例。

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="特定的图像模型标识符（例如，'dall-e-3'）。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="每次请求时传递的模型特定配置选项。">
    <x-field-desc markdown>有关详细信息，请参阅 `ImageModelInputOptions`。</x-field-desc>
  </x-field>
</x-field-group>

### ImageModelInput

此接口定义了发送到 `ImageModel` 的输入的结构。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="描述所需图像的文本提示。"></x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false" data-desc="用于编辑或获取灵感的源图像数组。"></x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-desc="要生成的图像数量。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="为输出图像指定所需的文件格式（例如，'local'、'file'）。"></x-field>
  <x-field data-name="modelOptions" data-type="ImageModelInputOptions" data-required="false" data-desc="此请求的模型特定配置选项。"></x-field>
</x-field-group>

#### ImageModelInputOptions

<x-field-group>
    <x-field data-name="model" data-type="string" data-required="false" data-desc="此特定请求的模型名称或版本。"></x-field>
    <x-field data-name="preferInputFileType" data-type="'file' | 'url'" data-required="false" data-desc="处理输入图像的首选格式。"></x-field>
</x-field-group>

### ImageModelOutput

此接口定义了 `ImageModel` 返回的输出的结构。

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true" data-desc="生成图像的数组。"></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="请求的词元和资源使用情况统计。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="生成图像的模型的标识符。"></x-field>
</x-field-group>

## 文件内容类型

`ChatModel` 和 `ImageModel` 都使用一组通用的类型来表示基于文件的内容。这使得可以灵活处理本地文件、远程 URL 和 base64 编码的数据。

### UrlContent

表示位于远程 URL 的文件。

<x-field-group>
  <x-field data-name="type" data-type="'url'" data-required="true" data-desc="字面类型标识符。"></x-field>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="文件的 URL。"></x-field>
  <x-field data-name="filename" data-type="string" data-required="false" data-desc="内容的可选文件名。"></x-field>
  <x-field data-name="mimeType" data-type="string" data-required="false" data-desc="文件的 MIME 类型。"></x-field>
</x-field-group>

### FileContent

表示以 base64 编码字符串形式的文件。

<x-field-group>
  <x-field data-name="type" data-type="'file'" data-required="true" data-desc="字面类型标识符。"></x-field>
  <x-field data-name="data" data-type="string" data-required="true" data-desc="经过 base64 编码的文件数据。"></x-field>
  <x-field data-name="filename" data-type="string" data-required="false" data-desc="内容的可选文件名。"></x-field>
  <x-field data-name="mimeType" data-type="string" data-required="false" data-desc="文件的 MIME 类型。"></x-field>
</x-field-group>

### LocalContent

表示存储在本地文件系统上的文件。

<x-field-group>
  <x-field data-name="type" data-type="'local'" data-required="true" data-desc="字面类型标识符。"></x-field>
  <x-field data-name="path" data-type="string" data-required="true" data-desc="文件在本地文件系统中的路径。"></x-field>
  <x-field data-name="filename" data-type="string" data-required="false" data-desc="内容的可选文件名。"></x-field>
  <x-field data-name="mimeType" data-type="string" data-required="false" data-desc="文件的 MIME 类型。"></x-field>
</x-field-group>