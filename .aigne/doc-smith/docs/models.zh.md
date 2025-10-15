# 模型

AIGNE 框架被设计为模型无关的，允许您连接到各种第三方 AI 模型提供商。这种灵活性是通过模型适配器系统实现的，每个适配器都为特定服务（如 OpenAI、Anthropic 或 Google Gemini）提供标准化的接口。

本节为每个官方支持的模型提供商提供了安装、配置和使用的详细指南。无论您需要强大的语言模型、专业的图像生成，还是本地托管模型的隐私性，都可以在这里找到合适的集成方案。

## 支持的模型提供商

以下是支持的提供商精选列表。每个卡片都链接到一份专门的指南，其中包含安装说明、配置详情和实用的代码示例。

### 基础模型

这些是与主要 AI 模型提供商的直接集成。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    与 OpenAI 的模型套件集成，包括强大的 GPT-4o，用于聊天补全和函数调用。
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    利用 Anthropic 的 Claude 模型，该模型以其在复杂推理和对话方面的强大性能而闻名。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    连接到 Google 的 Gemini 多模态模型系列，以实现高级文本和图像理解。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    通过 AWS Bedrock 访问来自 Anthropic、Cohere 和 Amazon 等提供商的各种基础模型。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    利用 DeepSeek 强大而高效的语言模型，执行一系列自然语言处理任务。
  </x-card>
    <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    与豆包的语言模型集成，用于构建对话式 AI 和其他基于文本的应用。
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    连接到 xAI 的 Grok 模型，该模型专为实时信息处理和独特的对话风格而设计。
  </x-card>
</x-cards>

### 图像生成模型

用于创建视觉内容的专业集成。

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    使用 Ideogram 的高级图像合成模型，通过文本提示生成高质量图像。
  </x-card>
    <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    使用 Gemini 和 Imagen 模型，在其语言功能之外，还提供多功能的图像生成能力。
  </x-card>
</x-cards>

### 本地和聚合器服务

连接到本地实例或通过单一 API 提供对多个模型访问的服务。

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    在您自己的硬件上本地运行像 Llama 3 这样的开源模型，以实现最大程度的隐私和离线访问。
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    通过 LMStudio 应用程序连接到本地运行的模型，为体验开源 AI 提供了一种简单的方式。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    通过单一、统一的 API 访问来自不同提供商的各种模型，并提供回退选项。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    与 Poe 平台上提供的各种模型集成，获取多样化的 AI 功能。
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    使用 AIGNE Hub 作为统一代理，在多个 LLM 提供商之间无缝切换，而无需更改客户端代码。
  </x-card>
</x-cards>

## 总结

AIGNE 框架的模块化设计使其能够轻松地与最适合您特定需求的 AI 模型集成。每个提供商都有一个专用包来处理底层 API 的复杂性，为您提供一个一致且直接的接口。

要开始使用，请从上面的列表中选择一个提供商，并按照链接的指南获取详细说明。有关模型适配器在框架内工作原理的概览，请参阅[概述](./models-overview.md)页面。