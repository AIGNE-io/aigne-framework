# 模型

AIGNE 框架設計為模型無關 (model-agnostic)，讓您可以連接各種第三方 AI 模型供應商。這種靈活性是透過一個模型適配器系統實現的，其中每個適配器都為特定服務（如 OpenAI、Anthropic 或 Google Gemini）提供標準化介面。

本節為每個官方支援的模型供應商提供安裝、設定和使用的詳細指南。無論您需要強大的語言模型、專業的圖像和影片生成，還是本地託管模型的隱私性，您都可以在這裡找到適合的整合方案。

## 支援的模型供應商

以下是我們精選的支援供應商列表。每張卡片都連結到一篇專門的指南，其中包含安裝說明、設定細節和實用的程式碼範例。

### 基礎模型

這些是與主要 AI 模型供應商的直接整合，用於聊天完成和其他基於語言的任務。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    與 OpenAI 的模型套件整合，包括功能強大的 GPT-4o，用於聊天完成和函式呼叫。
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    利用 Anthropic 的 Claude 模型，該模型以其在複雜推理和對話方面的強大表現而聞名。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    連接到 Google 的 Gemini 多模態模型系列，以實現進階的文字和圖像理解。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    透過 AWS Bedrock 存取來自 Anthropic、Cohere 和 Amazon 等供應商的各種基礎模型。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    利用 DeepSeek 強大且高效的語言模型來執行一系列自然語言處理任務。
  </x-card>
  <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    與豆包的語言模型整合，用於建立對話式 AI 和其他基於文字的應用程式。
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    連接 xAI 的 Grok 模型，該模型專為即時資訊處理和獨特的對話風格而設計。
  </x-card>
</x-cards>

### 圖像生成模型

專為從文字提示建立視覺內容而設的整合。

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    使用 Ideogram 的先進合成模型生成高品質圖像，並具有可靠的文字渲染效果。
  </x-card>
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    使用 DALL-E 3 和其他模型，以實現富有創意和多樣化的圖像生成能力。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    利用 Gemini 和 Imagen 模型，結合語言功能，進行多功能的圖像生成和編輯。
  </x-card>
</x-cards>

### 影片生成模型

用於從文字或圖像輸入生成影片內容的整合。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
     使用 OpenAI 的 Sora 模型，從文字或圖像提示生成高品質的影片內容。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    使用 Google 的 Veo 模型從文字或圖像建立影片，以實現動態內容生成。
  </x-card>
    <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    透過統一的 API 端點存取 OpenAI Sora 和 Google Veo 等影片生成模型。
  </x-card>
</x-cards>

### 本地及聚合器服務

連接到本地執行個體或透過單一 API 提供對多個模型存取的服務。

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    在您自己的硬體上本地執行 Llama 3 等開源模型，以獲得最大的隱私和離線存取能力。
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    透過 LMStudio 應用程式連接到本地執行的模型，提供一種簡單的方式來實驗開源 AI。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    透過單一、統一的 API 存取來自不同供應商的各種模型，並提供備援選項。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    與 Poe 平台上可用的各種模型整合，提供多樣化的 AI 功能。
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    使用 AIGNE Hub 作為統一的代理，無縫切換多個 LLM 供應商，而無需更改用戶端程式碼。
  </x-card>
</x-cards>

## 摘要

AIGNE 框架的模組化設計使其能夠輕鬆地與最適合您特定需求的 AI 模型整合。每個供應商都有一個專用套件來處理底層 API 的複雜性，為您提供一個一致且直接的介面。

要開始使用，請從上面的列表中選擇一個供應商，並按照連結的指南獲取詳細說明。若想對模型適配器在框架中的運作方式有一個高層次的了解，請參閱 [總覽](./models-overview.md) 頁面。