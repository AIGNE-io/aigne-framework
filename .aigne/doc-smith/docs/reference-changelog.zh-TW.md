AIGNE 支援多種模型提供商，讓開發者可以選擇最適合其需求的模型。本節將詳細介紹支援的提供商以及如何使用它們。

### 支援的模型提供商

支援以下模型提供商：

- **OpenAI**：來自 OpenAI 的模型，包括 GPT 系列。
- **Anthropic**：來自 Anthropic 的模型，例如 Claude。
- **Gemini**：Google 的 Gemini 模型。
- **Bedrock**：Amazon 的 Bedrock 服務，提供對一系列模型的存取。
- **DeepSeek**：來自 DeepSeek 的模型。
- **Doubao**：豆包模型。
- **Ideogram**：來自 Ideogram 的圖像生成模型。
- **Ollama**：使用 Ollama 在本地運行開源模型。
- **OpenRouter**：透過 OpenRouter 服務存取各種模型。
- **Poe**：透過 Poe 提供的模型。
- **XAI**：來自 XAI 的模型。
- **AIGNE Hub**：一個用於存取和管理各種模型的中央中樞。

這些提供商可以在您的 AIGNE 應用程式中進行設定和使用，為您的 AI agents 提供靈活性和強大功能。

### 支援模型的圖示

下圖說明了 AIGNE 模型支援的架構，其核心框架連接到各種模型提供商。

AIGNE 支援多種模型提供商，讓開發者可以選擇最適合其需求的模型。本節將詳細介紹支援的提供商以及如何使用它們。

### 支援的模型提供商

支援以下模型提供商：

- **OpenAI**：來自 OpenAI 的模型，包括 GPT 系列。
- **Anthropic**：來自 Anthropic 的模型，例如 Claude。
- **Gemini**：Google 的 Gemini 模型。
- **Bedrock**：Amazon 的 Bedrock 服務，提供對一系列模型的存取。
- **DeepSeek**：來自 DeepSeek 的模型。
- **Doubao**：豆包模型。
- **Ideogram**：來自 Ideogram 的圖像生成模型。
- **Ollama**：使用 Ollama 在本地運行開源模型。
- **OpenRouter**：透過 OpenRouter 服務存取各種模型。
- **Poe**：透過 Poe 提供的模型。
- **XAI**：來自 XAI 的模型。
- **AIGNE Hub**：一個用於存取和管理各種模型的中央中樞。

這些提供商可以在您的 AIGNE 應用程式中進行設定和使用，為您的 AI agents 提供靈活性和強大功能。

### 支援模型的圖示

下圖說明了 AIGNE 模型支援的架構，其核心框架連接到各種模型提供商。

```d2
direction: down

AIGNE: {
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Model-Providers: {
  label: "支援的模型提供商"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 3

  OpenAI
  Anthropic
  Gemini
  Bedrock
  DeepSeek
  Doubao
  Ideogram
  Ollama
  OpenRouter
  Poe
  XAI
  AIGNE-Hub: "AIGNE Hub"
}

AIGNE -> Model-Providers: "連接至"
```

### 在 AIGNE 中使用模型

要使用模型，您首先需要安裝對應的套件。例如，要使用 OpenAI 模型，您需要安裝 `@aigne/openai` 套件。

```bash
npm install @aigne/openai
```

然後，您可以匯入模型並在您的 agent 定義中使用它。

```javascript
import { OpenAIChatModel } from '@aigne/openai';

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});
```

### AIGNE Hub

AIGNE Hub 是一項服務，可讓您從單一位置存取和管理各種模型。要使用它，您需要將您的 AIGNE CLI 連接到 Hub。

```bash
aigne hub connect
```

這將引導您完成向 AIGNE Hub 進行身份驗證的過程。連接後，您就可以使用任何支援的模型，而無需管理個別的 API 金鑰。

### 模型設定

您可以透過將選項物件傳遞給模型的建構函式來設定模型。可用的選項取決於模型提供商。例如，`OpenAIChatModel` 支援 `temperature`、`max_tokens` 和 `top_p` 等選項。

```javascript
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 1024,
});
```

### 各提供商支援的模型

下表列出了每個提供商支援的模型。請參閱提供商的文件以獲取最新的清單。

| 提供商 | 支援的模型 |
| --- | --- |
| **OpenAI** | `gpt-4`、`gpt-4-32k`、`gpt-4-turbo`、`gpt-3.5-turbo` 等。 |
| **Anthropic** | `claude-2`、`claude-instant-1` 等。 |
| **Gemini** | `gemini-pro` 等。 |
| **Bedrock** | 來自 AI21 Labs、Anthropic、Cohere、Meta 和 Stability AI 的各種模型。 |
| **DeepSeek** | `deepseek-coder`、`deepseek-llm` 等。 |
| **Doubao** | `doubao-pro-4k`、`doubao-pro-32k` 等。 |
| **Ideogram** | 圖像生成模型。 |
| **Ollama** | 各種開源模型。 |
| **OpenRouter** | 來自不同提供商的各種模型。 |
| **Poe** | 透過 Poe 平台提供的模型。 |
| **XAI** | `grok-1` 等。 |
| **AIGNE Hub**| 上述所有提供商的模型。 |