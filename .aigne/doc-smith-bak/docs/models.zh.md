# 模型

AIGNE 框架设计为模型无关，允许您连接到各种第三方 AI 模型提供商。这种灵活性是通过模型适配器系统实现的，其中每个适配器都为特定服务（如 OpenAI、Anthropic 或 Google Gemini）提供标准化的接口。

本节为每个官方支持的模型提供商提供了详细的安装、配置和使用指南。无论您需要强大的语言模型、专业的图像和视频生成，还是本地托管模型的隐私性，都可以在这里找到合适的集成方案。

## 支持的模型提供商

以下是受支持提供商的精选列表。每张卡片都链接到一份专门的指南，其中包含安装说明、配置详情和实用的代码示例。

### 基础模型

这些是与主要 AI 模型提供商的直接集成，用于聊天补全和其他基于语言的任务。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    与 OpenAI 的模型套件集成，包括强大的 GPT-4o，用于聊天补全和函数调用。
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    利用 Anthropic 的 Claude 模型，该模型以其在复杂推理和对话方面的强大性能而闻名。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    连接到 Google 的 Gemini 多模态模型系列，以实现先进的文本和图像理解。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    通过 AWS Bedrock 访问来自 Anthropic、Cohere 和 Amazon 等提供商的各种基础模型。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    利用 DeepSeek 强大而高效的语言模型，完成一系列自然语言处理任务。
  </x-card>
  <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    与豆包的语言模型集成，用于构建对话式 AI 和其他基于文本的应用程序。
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    连接到 xAI 的 Grok 模型，该模型专为实时信息处理和独特的对话风格而设计。
  </x-card>
</x-cards>

### 图像生成模型

用于根据文本提示创建视觉内容的专门集成。

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    使用 Ideogram 的先进合成模型，生成具有可靠文本渲染的高质量图像。
  </x-card>
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    使用 DALL-E 3 和其他模型，实现富有创意和多样化的图像生成能力。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    利用 Gemini 和 Imagen 模型，在语言功能之外实现多功能的图像生成和编辑。
  </x-card>
</x-cards>

### 视频生成模型

用于根据文本或图像输入生成视频内容的集成。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
     使用 OpenAI 的 Sora 模型，根据文本或图像提示生成高质量的视频内容。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    使用 Google 的 Veo 模型，通过文本或图像创建视频，实现动态内容生成。
  </x-card>
    <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    通过统一的 API 端点访问 OpenAI Sora 和 Google Veo 等视频生成模型。
  </x-card>
</x-cards>

### 本地和聚合器服务

连接到本地实例或通过单一 API 提供对多个模型的访问的服务。

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    在您自己的硬件上本地运行 Llama 3 等开源模型，以实现最大程度的隐私和离线访问。
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    通过 LMStudio 应用程序连接到本地运行的模型，为试验开源 AI 提供了一种简单的方式。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    通过单一、统一的 API 访问来自不同提供商的各种模型，并提供备用选项。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    与 Poe 平台上可用的各种模型集成，提供多样化的 AI 功能。
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    使用 AIGNE Hub 作为统一代理，在多个 LLM 提供商之间无缝切换，而无需更改客户端代码。
  </x-card>
</x-cards>

## 总结

AIGNE 框架的模块化设计使其可以轻松地与最适合您特定需求的 AI 模型集成。每个提供商都有一个专门的包来处理底层 API 的复杂性，为您呈现一个一致且直接的接口。

要开始使用，请从上面的列表中选择一个提供商，并按照链接的指南获取详细说明。有关模型适配器在框架内工作方式的高级概述，请参阅[概述](./models-overview.md)页面。