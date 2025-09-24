# AI 模型

AIGNE 框架设计灵活，允许您将 AI Agent 连接到各种强大的 AI 模型。无论您是想使用 OpenAI 和 Google 等主要提供商的最新模型，探索专用模型，还是为了最大程度地保护隐私而在您自己的计算机上本地运行模型，AIGNE 都能满足您的需求。

每个集成都设计得简单直接，因此您可以在模型之间切换，而无需重写 Agent 的核心逻辑。

## AIGNE Hub：统一网关

要以最简单的方式访问多个模型，我们建议使用 AIGNE Hub。它作为许多流行 AI 提供商的单一入口点，因此您只需管理一个连接。这简化了开发过程，并让您能够轻松地尝试不同的模型，以找到最适合您需求的模型。

![AIGNE Hub 架构](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-hub.png)

## 支持的模型提供商

探索不断增长的支持的 AI 模型提供商列表。点击任何提供商即可查看有关如何在 AIGNE 框架内连接和使用其模型的详细文档。

<x-cards data-columns="2">
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    连接到多个 LLM 提供商的统一代理，管理额度，并简化 API 密钥管理。
  </x-card>
  <x-card data-title="Anthropic (Claude)" data-icon="lucide:brain-circuit" data-href="/models/anthropic">
    利用 Anthropic 的 Claude 模型，该模型以其在复杂推理和创意任务中的强大性能而闻名。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="lucide:server-cog" data-href="/models/aws-bedrock">
    通过亚马逊完全托管的 AWS Bedrock 服务，访问来自领先 AI 公司的基础模型。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:search-code" data-href="/models/deepseek">
    集成 DeepSeek 强大的开源语言模型，以获得强大的编码和推理能力。
  </x-card>
  <x-card data-title="Doubao" data-icon="lucide:message-square-plus" data-href="/models/doubao">
    连接豆包的 AI 模型，用于广泛的语言和图像生成任务。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="lucide:gem" data-href="/models/gemini">
    使用谷歌的 Gemini 系列多模态模型，处理涉及文本、图像等任务。
  </x-card>
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    使用 Ideogram 的高级图像合成模型，通过文本提示生成高质量图像。
  </x-card>
  <x-card data-title="OpenAI" data-icon="lucide:sparkles" data-href="/models/openai">
    集成 OpenAI 强大的 GPT 模型，包括聊天补全和 DALL-E 图像生成。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    通过单一、统一的 OpenRouter API 访问来自多个提供商的多样化模型市场。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:bot" data-href="/models/poe">
    通过其与 OpenAI 兼容的 API，与 Poe 平台上可用的各种 AI 模型集成。
  </x-card>
  <x-card data-title="xAI (Grok)" data-icon="lucide:star" data-href="/models/xai">
    连接到 xAI 的模型，如 Grok，这些模型以其独特的个性和实时信息访问能力而闻名。
  </x-card>
</x-cards>

## 本地运行模型

为了实现最终的隐私和控制，AIGNE 支持使用 Ollama 和 LM Studio 等工具直接在您自己的机器上运行开源模型。这意味着您的数据永远不会离开您的计算机，并且您可以完全离线操作。

<x-cards data-columns="2">
  <x-card data-title="LM Studio" data-icon="lucide:laptop" data-href="/models/lm-studio">
    通过 LM Studio 的 OpenAI 兼容服务器，在您自己的机器上运行本地语言模型。
  </x-card>
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    通过 Ollama 服务器，在您的机器上本地运行各种开源模型。
  </x-card>
</x-cards>