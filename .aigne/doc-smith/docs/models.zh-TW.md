# 模型

AIGNE 框架設計為模型無關（model-agnostic），讓您可以連接各種第三方 AI 模型供應商。這種靈活性是透過模型適配器系統實現的，每個適配器為特定服務（如 OpenAI、Anthropic 或 Google Gemini）提供標準化介面。

本節為每個官方支援的模型供應商提供詳細的安裝、設定和使用指南。無論您需要強大的語言模型、專門的圖像生成，還是本地託管模型的隱私，您都可以在這裡找到合適的整合方案。

## 支援的模型供應商

以下是精選的支援供應商列表。每張卡片都連結到一個專門的指南，其中包含安裝說明、設定詳細資訊和實用的程式碼範例。

### 基礎模型

這些是與主要 AI 模型供應商的直接整合。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    與 OpenAI 的模型套件整合，包括強大的 GPT-4o，用於聊天完成和函數呼叫。
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    利用 Anthropic 的 Claude 模型，該模型以其在複雜推理和對話方面的強大性能而聞名。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    連接到 Google 的 Gemini 多模態模型系列，以實現進階的文本和圖像理解。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    透過 AWS Bedrock 存取來自 Anthropic、Cohere 和 Amazon 等供應商的各種基礎模型。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    利用 DeepSeek 強大而高效的語言模型，執行各種自然語言處理任務。
  </x-card>
    <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    與豆包的語言模型整合，以建立對話式 AI 和其他基於文本的應用程式。
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    連接到 xAI 的 Grok 模型，該模型專為即時資訊處理和獨特的對話風格而設計。
  </x-card>
</x-cards>

### 圖像生成模型

用於創建視覺內容的專門整合。

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    使用 Ideogram 的進階圖像合成模型，從文本提示生成高品質圖像。
  </x-card>
    <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    使用 Gemini 和 Imagen 模型，在其語言功能之外，還能提供多功能的圖像生成能力。
  </x-card>
</x-cards>

### 本地和聚合器服務

連接到本地實例或透過單一 API 提供對多個模型存取權限的服務。

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    在您自己的硬體上本地運行像 Llama 3 這樣的開源模型，以獲得最大的隱私和離線存取權限。
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    透過 LMStudio 應用程式連接到本地運行的模型，為體驗開源 AI 提供了一種簡單的方式。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    透過單一、統一的 API 存取來自不同供應商的各種模型，並提供備援選項。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    與 Poe 平台提供的各種模型整合，提供多樣化的 AI 功能。
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    使用 AIGNE Hub 作為統一代理，在多個 LLM 供應商之間無縫切換，而無需更改客戶端程式碼。
  </x-card>
</x-cards>

## 總結

AIGNE 框架的模組化設計使其能夠輕鬆地與最適合您特定需求的 AI 模型整合。每個供應商都有一個專用套件，負責處理底層 API 的複雜性，為您提供一個一致且直接的介面。

要開始使用，請從上面的列表中選擇一個供應商，並按照連結的指南獲取詳細說明。有關模型適配器在框架內如何工作的高層次概述，請參閱 [總覽](./models-overview.md) 頁面。