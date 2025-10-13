# 模型

模型是 AIGNE 平台的核心元件，提供了一個標準化介面，用以與各種第三方 AI 模型互動。本文件涵蓋了基本的模型架構，列出了可用的模型，並提供了如何使用它們的範例。

## 總覽

AIGNE 模型系統採用階層式結構設計。基礎是 `Agent`，它為任何處理單元定義了基本介面。在此之上擴展的是通用的 `Model` 類別，這是一個抽象類別，為不同資料類型（特別是檔案內容）引入了專門的處理方式。

每個第三方 AI 供應商（例如 OpenAI 或 Anthropic）都有 `Model` 類別的具體實作。例如，`OpenAIChatModel` 和 `AnthropicChatModel` 就是處理各自服務獨特 API 和需求的特定類別。這種架構讓您能夠以一致的方式使用不同的模型。

```d2
direction: down

Agent: {
  label: "Agent\n（基本介面）"
  shape: rectangle
}

Model: {
  label: "Model\n（抽象類別）\n處理檔案內容"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
}

Concrete-Models: {
  label: "具體模型實作"
  grid-columns: 2
  grid-gap: 100

  Chat-Models: {
    label: "聊天模型"
    shape: rectangle
    grid-columns: 3

    OpenAIChatModel
    AnthropicChatModel
    BedrockChatModel
    DeepSeekChatModel
    GeminiChatModel
    OllamaChatModel
    OpenRouterChatModel
    XAIChatModel
    DoubaoChatModel
    PoeChatModel
    AIGNEHubChatModel
  }

  Image-Models: {
    label: "圖像模型"
    shape: rectangle
    grid-columns: 2

    OpenAIImageModel
    GeminiImageModel
    IdeogramImageModel
    DoubaoImageModel
    AIGNEHubImageModel
  }
}

Model -> Agent: "extends"
Concrete-Models.Chat-Models -> Model: "implements"
Concrete-Models.Image-Models -> Model: "implements"

```

## 核心概念

### 通用模型類別

抽象的 `Model` 類別定義於 `packages/core/src/agents/model.ts` 中，是所有特定模型實作的基礎。其主要職責包括：

-   **標準化互動**：提供一致的 API 來呼叫模型，無論底層供應商為何。
-   **檔案處理**：自動在不同格式之間轉換檔案內容。這是一項簡化資料處理的關鍵功能。`Model` 類別可以接受以下格式的檔案資料：
    -   **URL**：指向檔案的公開 URL。模型將會下載並處理它。
    -   **本機檔案**：本機檔案系統上的檔案路徑。
    -   **Base64 編碼**：編碼為 base64 字串的檔案內容。

該類別會管理這些格式之間的轉換，確保資料符合所用特定模型的正確格式。

## 可用模型

AIGNE 支援來自多家供應商的各種聊天和圖像生成模型。

### 聊天模型

下表列出了可用的聊天模型，這些模型可以被實例化並用於基於文字的互動。

| 供應商 / 類別名稱 | 別名 | API 金鑰環境變數 |
| :--- | :--- | :--- |
| `OpenAIChatModel` | | `OPENAI_API_KEY` |
| `AnthropicChatModel` | | `ANTHROPIC_API_KEY` |
| `BedrockChatModel` | | `AWS_ACCESS_KEY_ID` |
| `DeepSeekChatModel` | | `DEEPSEEK_API_KEY` |
| `GeminiChatModel` | `google` | `GEMINI_API_KEY`, `GOOGLE_API_KEY` |
| `OllamaChatModel` | | `OLLAMA_API_KEY` |
| `OpenRouterChatModel`| | `OPEN_ROUTER_API_KEY` |
| `XAIChatModel` | | `XAI_API_KEY` |
| `DoubaoChatModel` | | `DOUBAO_API_KEY` |
| `PoeChatModel` | | `POE_API_KEY` |
| `AIGNEHubChatModel` | | `AIGNE_HUB_API_KEY` |

### 圖像模型

下表列出了可用於生成視覺內容的圖像模型。

| 供應商 / 類別名稱 | 別名 | API 金鑰環境變數 |
| :--- | :--- | :--- |
| `OpenAIImageModel` | | `OPENAI_API_KEY` |
| `GeminiImageModel` | `google` | `GEMINI_API_KEY` |
| `IdeogramImageModel` | | `IDEOGRAM_API_KEY` |
| `DoubaoImageModel` | | `DOUBAO_API_KEY` |
| `AIGNEHubImageModel` | | `AIGNE_HUB_API_KEY` |

## 使用方式

您可以輕易地實例化並使用任何支援的模型。系統提供了輔助函式，可根據供應商字串尋找並載入正確的模型。

### 解析模型識別碼

模型通常由 `provider/model_name` 格式的字串來識別，例如 `openai/gpt-4o`。`parseModel` 公用程式可用於將此字串分解為其組成部分。

```typescript
import { parseModel } from "models/aigne-hub/src/utils/model.ts";

const { provider, model } = parseModel("openai/gpt-4o");

console.log(provider); // "openai"
console.log(model);    // "gpt-4o"
```

### 尋找並建立模型

`findModel` 函式讓您能從可用模型清單中找到正確的模型類別。然後，您可以使用匹配模型的 `create` 方法將其實例化。

此範例示範了如何透過供應商名稱尋找模型並建立其一個實例。

```typescript
import { findModel, parseModel } from "models/aigne-hub/src/utils/model.ts";

// 完整的模型識別碼字串
const modelIdentifier = "openai/gpt-4o";

// 1. 解析識別碼以取得供應商和模型名稱
const { provider, model: modelName } = parseModel(modelIdentifier);

// 2. 尋找對應的可載入模型組態
const { match } = findModel(provider);

if (match) {
  // 3. 建立一個模型實例
  const chatModel = match.create({
    model: modelName,
    // modelOptions 可用於傳遞額外參數
    modelOptions: {
      temperature: 0.7,
    },
    // API 金鑰也可以直接傳遞，但建議使用
    // 環境變數。
    // apiKey: "sk-...",
  });

  // 現在您可以使用 chatModel 實例進行 API 呼叫
  console.log(`Successfully created model: ${chatModel.constructor.name}`);
} else {
  console.error(`Model provider "${provider}" not found.`);
}
```

這種模組化的方法讓您只需最少的程式碼變更，就能輕鬆切換不同的 AI 模型，從而提升您應用程式的靈活性和可重用性。