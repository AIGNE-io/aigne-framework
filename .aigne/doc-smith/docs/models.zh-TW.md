# AIGNE 模型

AIGNE 提供了一套全方位的 SDK，旨在與各式各樣的 AI 模型供應商無縫整合。這些套件在整個 AIGNE 框架中提供了一致且統一的介面，使開發人員能夠輕鬆利用不同 AI 模型的強大功能，而無需更改其核心應用程式邏輯。

無論您是使用 OpenAI 的 GPT 模型、Anthropic 的 Claude、Google 的 Gemini，還是透過 Ollama 本地託管的模型，AIGNE 模型 SDK 都能簡化開發流程。每個 SDK 都針對特定供應商的 API 進行了客製化，同時遵循標準化的 `invoke` 方法，以支援聊天完成、串流及其他功能。

此外，透過 `@aigne/aigne-hub`，您可以透過單一閘道存取多個供應商，從而簡化 API 金鑰管理，並實現動態模型切換和備援。本介紹將概述可用的模型，並引導您完成其安裝和使用。

```d2
direction: down

Developer-Application: {
  label: "開發者的應用程式"
  shape: rectangle
}

AIGNE-Ecosystem: {
  label: "AIGNE SDK 生態系統"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
  grid-gap: 100

  AIGNE-SDKs: {
    label: "AIGNE SDKs"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    aigne-core: {
      label: "@aigne/core\n(基礎)"
      style.fill: "#d1e7dd"
    }

    aigne-hub: {
      label: "@aigne/aigne-hub\n(閘道)"
      style.fill: "#cfe2ff"
    }
    aigne-open-router: {
      label: "@aigne/open-router\n(閘道)"
      style.fill: "#cfe2ff"
    }
    aigne-poe: {
      label: "@aigne/poe\n(閘道)"
      style.fill: "#cfe2ff"
    }

    aigne-openai: { label: "@aigne/openai" }
    aigne-anthropic: { label: "@aigne/anthropic" }
    aigne-gemini: { label: "@aigne/gemini" }
    aigne-bedrock: { label: "@aigne/bedrock" }
    aigne-deepseek: { label: "@aigne/deepseek" }
    aigne-doubao: { label: "@aigne/doubao" }
    aigne-ideogram: { label: "@aigne/ideogram" }
    aigne-ollama: { label: "@aigne/ollama" }
    aigne-xai: { label: "@aigne/xai" }
  }

  AI-Model-Providers: {
    label: "AI 模型供應商 (外部服務)"
    shape: rectangle
    grid-columns: 4
    grid-gap: 40

    OpenAI: { label: "OpenAI\n(GPT, DALL-E)" }
    Anthropic: { label: "Anthropic\n(Claude)" }
    Google: { label: "Google\n(Gemini, Imagen)" }
    AWS-Bedrock: { label: "AWS Bedrock" }
    Deepseek: { label: "Deepseek" }
    Doubao: { label: "Doubao" }
    Ideogram: { label: "Ideogram" }
    Ollama: { label: "Ollama\n(本地服務)" }
    OpenRouter: { label: "OpenRouter" }
    Poe: { label: "Poe" }
    xAI: { label: "xAI\n(Grok)" }
  }
}

Developer-Application -> AIGNE-Ecosystem.AIGNE-SDKs: "使用 SDKs"

AIGNE-Ecosystem.AIGNE-SDKs.aigne-openai -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-anthropic -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-gemini -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-bedrock -> AIGNE-Ecosystem.AI-Model-Providers.AWS-Bedrock
AIGNE-Ecosystem.AIGNE-SDKs.aigne-deepseek -> AIGNE-Ecosystem.AI-Model-Providers.Deepseek
AIGNE-Ecosystem.AIGNE-SDKs.aigne-doubao -> AIGNE-Ecosystem.AI-Model-Providers.Doubao
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ideogram -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
AIGNE-Ecosystem.AIGNE-SDKs.aigne-ollama -> AIGNE-Ecosystem.AI-Model-Providers.Ollama
AIGNE-Ecosystem.AIGNE-SDKs.aigne-open-router -> AIGNE-Ecosystem.AI-Model-Providers.OpenRouter
AIGNE-Ecosystem.AIGNE-SDKs.aigne-poe -> AIGNE-Ecosystem.AI-Model-Providers.Poe
AIGNE-Ecosystem.AIGNE-SDKs.aigne-xai -> AIGNE-Ecosystem.AI-Model-Providers.xAI

AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.OpenAI
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Anthropic
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Google
AIGNE-Ecosystem.AIGNE-SDKs.aigne-hub -> AIGNE-Ecosystem.AI-Model-Providers.Ideogram
```

## 開始使用

首先，您需要安裝核心的 AIGNE 套件以及您希望使用的 AI 模型供應商的特定 SDK。

### 安裝

使用您偏好的套件管理器安裝必要的套件。例如，若要使用 OpenAI SDK：

**使用 npm**
```bash
npm install @aigne/openai @aigne/core
```

**使用 yarn**
```bash
yarn add @aigne/openai @aigne/core
```

**使用 pnpm**
```bash
pnpm add @aigne/openai @aigne/core
```

## 支援的供應商

AIGNE 支援多種 AI 模型供應商，每個供應商都有其專屬的 SDK 以實現最佳整合。以下是每個支援供應商的詳細指南。

### AIGNE Hub

`@aigne/aigne-hub` 透過單一閘道服務，提供對多個 LLM 供應商的統一存取。它讓您可以在 OpenAI、Anthropic 和 Google 等供應商的模型之間切換，而無需更改您的客戶端程式碼。

**主要功能：**
-   透過單一端點將請求路由至任何支援的供應商。
-   使用單一的 `accessKey` 安全地管理 API 金鑰。
-   支援聊天完成、串流和圖片生成。

#### 安裝
```bash
npm install @aigne/aigne-hub @aigne/core
```

#### 基本聊天用法
```typescript
import { AIGNEHubChatModel } from "@aigne/aigne-hub";

const model = new AIGNEHubChatModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/gpt-4o-mini",
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, world!" }],
});

console.log(result);
/* Example Output:
  {
    text: "Hello! How can I help you today?",
    model: "openai/gpt-4o-mini",
    usage: {
      inputTokens: 8,
      outputTokens: 9
    }
  }
*/
```

#### 圖片生成
AIGNE Hub 支援來自多個供應商的圖片生成。只需指定模型名稱即可在它們之間切換。

**OpenAI DALL-E 範例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "openai/dall-e-3",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with flying cars and neon lights",
  n: 1,
  size: "1024x1024",
});
```

**Google Imagen 範例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "google/imagen-4.0-generate-001",
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset",
});
```

**Ideogram 範例**
```typescript
import { AIGNEHubImageModel } from "@aigne/aigne-hub";

const model = new AIGNEHubImageModel({
  url: "https://your-aigne-hub-instance/ai-kit",
  accessKey: "your-access-key-secret",
  model: "ideogram/ideogram-v3",
});

const result = await model.invoke({
  prompt: "A cyberpunk character with glowing blue eyes",
  resolution: "1024x1024",
});
```

### OpenAI

`@aigne/openai` SDK 提供了與 OpenAI GPT 模型的無縫整合。它支援聊天完成、函式呼叫和串流回應。

#### 安裝
```bash
npm install @aigne/openai @aigne/core
```

#### 基本用法
```typescript
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  // 直接提供 API 金鑰，或使用環境變數 OPENAI_API_KEY
  apiKey: "your-api-key", // 若已在環境變數中設定則為選用
  model: "gpt-4o", // 若未指定，預設為 "gpt-4o-mini"
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

#### 串流回應
```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({
  apiKey: "your-api-key",
  model: "gpt-4o",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, who are you?" }],
  },
  { streaming: true },
);

let fullText = "";
for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
  }
}
console.log(fullText);
```

### Anthropic

`@aigne/anthropic` SDK 與 Anthropic 的 Claude AI 模型整合，提供對聊天完成、工具呼叫和串流的支援。

#### 安裝
```bash
npm install @aigne/anthropic @aigne/core
```

#### 基本用法
```typescript
import { AnthropicChatModel } from "@aigne/anthropic";

const model = new AnthropicChatModel({
  // 直接提供 API 金鑰，或使用環境變數 ANTHROPIC_API_KEY
  apiKey: "your-api-key", // 若已在環境變數中設定則為選用
  model: "claude-3-haiku-20240307", // 預設為 'claude-3-7-sonnet-latest'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```

### Google Gemini

`@aigne/gemini` SDK 連接到 Google 的 Gemini AI 模型，支援多模態輸入、函式呼叫以及使用 Imagen 進行圖片生成。

#### 安裝
```bash
npm install @aigne/gemini @aigne/core
```

#### 基本聊天用法
```typescript
import { GeminiChatModel } from "@aigne/gemini";

const model = new GeminiChatModel({
  // 直接提供 API 金鑰，或使用環境變數 GOOGLE_API_KEY
  apiKey: "your-api-key", // 若已在環境變數中設定則為選用
  model: "gemini-1.5-flash", // 預設為 'gemini-1.5-pro'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hi there, introduce yourself" }],
});

console.log(result);
```

#### 圖片生成
```typescript
import { GeminiImageModel } from "@aigne/gemini";

const model = new GeminiImageModel({
  apiKey: "your-api-key", 
  model: "imagen-4.0-generate-001", // 預設 Imagen 模型
});

const result = await model.invoke({
  prompt: "A serene mountain landscape at sunset with golden light",
  n: 1,
});

console.log(result);
```

### AWS Bedrock

`@aigne/bedrock` SDK 與託管在 AWS Bedrock 上的基礎模型整合，包括 Claude、Llama 和 Titan，提供了一個安全且可擴展的解決方案。

#### 安裝
```bash
npm install @aigne/bedrock @aigne/core
```

#### 基本用法
```typescript
import { BedrockChatModel } from "@aigne/bedrock";

const model = new BedrockChatModel({
  // 使用環境變數 AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  model: "us.amazon.nova-premier-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(result);
```

### Deepseek

`@aigne/deepseek` SDK 連接到 Deepseek 的語言模型，為聊天完成提供了一個強大且具成本效益的選擇。

#### 安裝
```bash
npm install @aigne/deepseek @aigne/core
```

#### 基本用法
```typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 金鑰，或使用環境變數 DEEPSEEK_API_KEY
  apiKey: "your-api-key",
  model: "deepseek-chat", // 預設為 'deepseek-chat'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Doubao

`@aigne/doubao` SDK 提供了與 Doubao 語言模型的整合。

#### 安裝
```bash
npm install @aigne/doubao @aigne/core
```

#### 基本用法
```typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  // 直接提供 API 金鑰，或使用環境變數 DOUBAO_API_KEY
  apiKey: "your-api-key",
  model: "doubao-seed-1-6-250615", // 預設模型
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

### Ideogram

`@aigne/ideogram` SDK 專門用於與 Ideogram 的進階圖片生成模型整合。

#### 安裝
```bash
npm install @aigne/ideogram @aigne/core
```

#### 基本用法
```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key", // 若已在環境變數中設定則為選用
});

const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

console.log(result);
```

### Ollama

`@aigne/ollama` SDK 讓您能透過 Ollama 連接到本地託管的開源模型，確保隱私並能離線存取 AI 功能。

#### 安裝
```bash
npm install @aigne/ollama @aigne/core
```

#### 先決條件
確保 [Ollama](https://ollama.ai/) 已在您的機器上安裝並正在執行。

#### 基本用法
```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  baseURL: "http://localhost:11434", // 預設為 localhost
  model: "llama3", // 預設為 'llama3'
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

### OpenRouter

`@aigne/open-router` SDK 提供了一個統一的 API，可透過單一整合存取來自 OpenAI、Anthropic 和 Google 等多個供應商的模型。

#### 安裝
```bash
npm install @aigne/open-router @aigne/core
```

#### 基本用法
```typescript
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // 直接提供 API 金鑰，或使用環境變數 OPEN_ROUTER_API_KEY
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus", // 預設為 'openai/gpt-4o'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### Poe

`@aigne/poe` SDK 與 Poe 的 API 整合，讓您能存取該平台上提供的各種語言模型。

#### 安裝
```bash
npm install @aigne/poe @aigne/core
```

#### 基本用法
```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 金鑰，或使用環境變數 POE_API_KEY
  apiKey: "your-api-key",
  model: "claude-3-opus", // 預設為 'openai/gpt-4o'
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

### xAI

`@aigne/xai` SDK 連接到 XAI 的語言模型，包括以其獨特性格和即時資訊存取而聞名的 Grok。

#### 安裝
```bash
npm install @aigne/xai @aigne/core
```

#### 基本用法
```typescript
import { XAIChatModel } from "@aigne/xai";

const model = new XAIChatModel({
  // 直接提供 API 金鑰，或使用環境變數 XAI_API_KEY
  apiKey: "your-api-key",
  model: "grok-2-latest", // 預設為 'grok-2-latest'
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me about yourself" }],
});

console.log(result);
```