本文件為 `@aigne/lmstudio` 套件提供了一份全面的使用指南，此套件是一個 AIGNE 模型適配器，用於透過 LM Studio 與本地託管的 AI 模型進行整合。

## 總覽

`@aigne/lmstudio` 模型適配器提供了與 LM Studio 的 OpenAI 相容 API 的無縫整合，讓您可以透過 AIGNE 框架執行本地的大型語言模型 (LLM)。LM Studio 提供了一個使用者友好的介面，用於下載、管理和執行本地 AI 模型，並內建一個模仿 OpenAI API 的伺服器。

此適配器繼承自 `@aigne/openai` 套件，這意味著它支援熟悉的 OpenAI API 結構，可用於聊天、串流、工具/函式呼叫和結構化輸出等操作。

## 前提條件

在使用此套件之前，您必須完成以下步驟：

1.  **安裝 LM Studio**：從官方網站下載並安裝 LM Studio 應用程式：[https://lmstudio.ai/](https://lmstudio.ai/)
2.  **下載模型**：使用 LM Studio 介面搜尋並下載一個本地模型。熱門選擇包括 Llama 3.2、Mistral 和 Phi-3。
3.  **啟動本地伺服器**：在 LM Studio 中導覽至「Local Server」分頁，選擇您下載的模型，然後點擊「Start Server」。這將會公開一個本地端點 (通常是 `http://localhost:1234/v1`)，適配器將會連線至此端點。

## 安裝

使用您偏好的套件管理器將此套件安裝到您的專案中：

```bash
npm install @aigne/lmstudio
```

```bash
pnpm add @aigne/lmstudio
```

```bash
yarn add @aigne/lmstudio
```

## 快速入門

以下範例示範如何建立一個 `LMStudioChatModel` 的實例並發出一個基本請求。

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. 建立一個新的 LM Studio 聊天模型實例
const model = new LMStudioChatModel({
  // baseURL 應與您的 LM Studio 本地伺服器位址相符
  baseURL: "http://localhost:1234/v1",
  // 模型名稱必須與 LM Studio 中載入的名稱完全相符
  model: "llama-3.2-3b-instruct",
  modelOptions: {
    temperature: 0.7,
    maxTokens: 2048,
  },
});

// 2. 使用使用者訊息叫用模型
const response = await model.invoke({
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

// 3. 印出回應文字
console.log(response.text);
// 預期輸出：「The capital of France is Paris.」
```

## 設定

您可以透過 `LMStudioChatModel` 的建構函式或使用環境變數來進行設定。

### 建構函式選項

`LMStudioChatModel` 擴充了 `OpenAIChatModel`，因此它接受標準的 OpenAI 選項。

```typescript
const model = new LMStudioChatModel({
  // LM Studio 伺服器的基礎 URL (預設為 http://localhost:1234/v1)
  baseURL: "http://localhost:1234/v1",
  
  // 模型識別碼，必須與 LM Studio 中載入的名稱相符
  model: "llama-3.2-3b-instruct",

  // 本地 LM Studio 實例不需要 API 金鑰
  // 預設為 "not-required"
  // apiKey: "your-key-if-needed",

  // 標準模型選項
  modelOptions: {
    temperature: 0.7,     // 控制隨機性 (0.0 至 2.0)
    maxTokens: 2048,      // 回應中的最大 token 數量
    topP: 0.9,            // 核心取樣 (Nucleus sampling)
    frequencyPenalty: 0,  // 根據新 token 的頻率進行懲罰
    presencePenalty: 0,   // 根據新 token 是否已存在進行懲罰
  },
});
```

### 環境變數

若要進行更靈活的設定，您可以使用環境變數：

```bash
# 設定 LM Studio 伺服器 URL (預設：http://localhost:1234/v1)
LM_STUDIO_BASE_URL=http://localhost:1234/v1

# 本地 LM Studio 預設不需要 API 金鑰。
# 僅在您已在伺服器上設定驗證時才需設定此項。
# LM_STUDIO_API_KEY=your-key-if-needed
```

**注意：** LM Studio 通常在本地執行，無需驗證。API 金鑰預設設定為佔位符值 `"not-required"`，以滿足底層 OpenAI 用戶端的需求。

## 功能

此適配器支援多項進階功能，包括串流、工具呼叫和結構化 JSON 輸出。

### 串流支援

若要取得即時回應，您可以串流模型的輸出。這對於聊天機器人等希望在回應生成時即時顯示的應用程式非常有用。

```typescript
const model = new LMStudioChatModel();

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot who discovers music." }],
  },
  { streaming: true }
);

for await (const chunk of stream) {
  if (chunk.type === "delta" && chunk.delta.text) {
    process.stdout.write(chunk.delta.text.text);
  }
}
```

### 工具與函式呼叫

此適配器支援與 OpenAI 相容的函式呼叫，讓模型能夠請求叫用外部工具。

```typescript
// 定義工具規格
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather information for a specified location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g., San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  },
];

// 使用工具叫用模型
const response = await model.invoke({
  messages: [
    { role: "user", content: "What's the weather like in New York?" }
  ],
  tools,
});

// 檢查模型是否請求了工具呼叫
if (response.toolCalls?.length) {
  console.log("Tool calls:", response.toolCalls);
  // 範例輸出：
  // Tool calls: [ { id: '...', type: 'function', function: { name: 'get_weather', arguments: '{"location":"New York"}' } } ]
}
```

### 結構化輸出 (JSON)

您可以指示模型生成符合特定 JSON 結構描述的回應。

```typescript
// 為輸出定義所需的 JSON 結構描述
const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "weather_response",
    schema: {
      type: "object",
      properties: {
        location: { type: "string" },
        temperature: { type: "number" },
        description: { type: "string" },
      },
      required: ["location", "temperature", "description"],
    },
  },
};

// 使用回應格式叫用模型
const response = await model.invoke({
  messages: [
    { role: "user", content: "Get the current weather for Paris in JSON format." }
  ],
  responseFormat,
});

// 解析後的 JSON 物件可在 `response.json` 欄位中取得
console.log(response.json);
```

## 支援的模型

LM Studio 支援多種開源模型。設定中使用的模型名稱必須與您 LM Studio 介面中顯示的名稱完全相符。熱門選擇包括：

-   **Llama 3.2** (3B、8B、70B 等版本)
-   **Llama 3.1** (8B、70B、405B 等版本)
-   **Mistral** (7B、8x7B 等版本)
-   **CodeLlama** (7B、13B、34B 等版本)
-   **Qwen** (各種大小)
-   **Phi-3** (mini、small、medium 等版本)

## 錯誤處理

與本地伺服器互動時，處理潛在的連線錯誤非常重要。一個常見問題是 LM Studio 伺服器未啟動。

```typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

try {
  const response = await model.invoke({
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(response.text);
} catch (error) {
  // 特別檢查連線被拒的錯誤
  if (error.code === "ECONNREFUSED") {
    console.error("Connection failed: The LM Studio server is not running. Please start the local server.");
  } else {
    console.error("An unexpected error occurred:", error.message);
  }
}
```

## 疑難排解

以下是常見問題的解決方案：

1.  **連線被拒 (Connection Refused)**：當 LM Studio 本地伺服器未執行時，會發生此錯誤 (`ECONNREFUSED`)。請確保您已在 LM Studio 應用程式的「Local Server」分頁中啟動伺服器。
2.  **找不到模型 (Model Not Found)**：如果您收到「model not found」錯誤，請確認您設定中的 `model` 名稱與 LM Studio 中載入的模型檔案名稱完全相符。
3.  **記憶體不足 (Out of Memory)**：大型模型可能會消耗大量系統資源。如果您遇到當機或記憶體問題，請嘗試使用較小的模型 (例如 3B 或 8B 參數的版本) 或減少上下文長度 (`maxTokens`)。
4.  **回應緩慢 (Slow Responses)**：回應速度取決於您的硬體 (CPU/GPU) 和模型大小。若要加快推論速度，如果您的硬體支援並已在 LM Studio 中正確設定，請考慮使用 GPU 加速。