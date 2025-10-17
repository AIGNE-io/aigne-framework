# LMStudio

`@aigne/lmstudio` 套件提供了一個模型適配器，用於將 AIGNE 與透過 [LM Studio](https://lmstudio.ai/) 在本地託管的大型語言模型 (LLM) 整合。這讓開發者能夠在 AIGNE 框架內利用本地模型的強大功能，提供更佳的隱私性、控制權和成本效益。

本指南涵蓋了 LM Studio 的必要設定，並示範如何使用 `LMStudioChatModel` 與您的本地模型互動。有關其他本地模型提供者的資訊，請參閱 [Ollama](./models-ollama.md) 文件。

## 先決條件

在使用此套件之前，您必須完成以下步驟：

1.  **安裝 LM Studio**：從官方網站下載並安裝 LM Studio 應用程式：[https://lmstudio.ai/](https://lmstudio.ai/)。
2.  **下載模型**：使用 LM Studio 介面搜尋並下載一個模型。熱門選擇包括 Llama 3.2、Mistral 和 Phi-3 的變體。
3.  **啟動本地伺服器**：在 LM Studio 中導覽至「Local Server」分頁（伺服器圖示），從下拉選單中選擇您下載的模型，然後點擊「Start Server」。這將會公開一個與 OpenAI 相容的 API 端點，通常位於 `http://localhost:1234/v1`。

## 安裝

若要將 LMStudio 套件新增至您的專案，請在您的終端機中執行以下其中一個指令：

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

一旦 LM Studio 伺服器開始運行，您就可以使用 `LMStudioChatModel` 與您的本地模型互動。以下範例示範如何實例化模型並發送一個簡單的請求。

```typescript 快速入門 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

// 1. 實例化模型
// 確保模型名稱與 LM Studio 中載入的名稱相符。
const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

// 2. 叫用模型
async function main() {
  try {
    const response = await model.invoke({
      messages: [
        { role: "user", content: "What is the capital of France?" }
      ],
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error invoking model:", error);
  }
}

main();
```

如果請求成功，輸出將會是：

```text
The capital of France is Paris.
```

## 設定

`LMStudioChatModel` 可以透過其建構函式或使用環境變數進行設定。

### 建構函式選項

`LMStudioChatModel` 擴充了標準的 `OpenAIChatModel` 並接受以下選項：

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown="要使用的模型名稱，必須與 LM Studio 伺服器中載入的模型檔案相符。預設為 `llama-3.2-3b-instruct`。"></x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false">
    <x-field-desc markdown="LM Studio 伺服器的基礎 URL。預設為 `http://localhost:1234/v1`。"></x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown="API 金鑰，如果您已在 LM Studio 伺服器上設定了身份驗證。預設情況下，LM Studio 運行時無需身份驗證，金鑰被設定為一個佔位符值 `not-required`。"></x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown="用於控制模型生成的額外選項。"></x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制隨機性。較低的值（例如 0.2）使輸出更具確定性。預設為 0.7。"></x-field>
    <x-field data-name="maxTokens" data-type="number" data-required="false" data-desc="在回應中生成的最大 token 數量。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心取樣參數。"></x-field>
    <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="根據新 token 現有的頻率對其進行懲罰。"></x-field>
    <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="根據新 token 是否已在文本中出現過對其進行懲罰。"></x-field>
  </x-field>
</x-field-group>

以下是一個自訂設定的範例：

```typescript 設定範例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  baseURL: "http://localhost:1234/v1",
  model: "Mistral-7B-Instruct-v0.2-GGUF",
  modelOptions: {
    temperature: 0.8,
    maxTokens: 4096,
  },
});
```

### 環境變數

您也可以透過設定環境變數來設定模型。如果兩者都提供，建構函式選項將具有較高優先級。

-   `LM_STUDIO_BASE_URL`：設定伺服器的基礎 URL。預設為 `http://localhost:1234/v1`。
-   `LM_STUDIO_API_KEY`：設定 API 金鑰。僅在您的伺服器需要身份驗證時才需要。

```bash .env
LM_STUDIO_BASE_URL=http://localhost:1234/v1
# LM_STUDIO_API_KEY=your-key-if-needed
```

## 功能

`LMStudioChatModel` 支援多項進階功能，包括串流、工具呼叫和結構化輸出。

### 串流

對於即時應用程式，您可以在回應生成時以串流方式傳輸。在 `invoke` 方法中設定 `streaming: true` 選項。

```typescript 串流範例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

async function streamStory() {
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
}

streamStory();
```

### 工具呼叫

許多本地模型支援與 OpenAI 相容的工具呼叫（也稱為函式呼叫）。您可以向模型提供一個工具列表，它將生成呼叫這些工具所需的參數。

```typescript 工具呼叫範例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_weather",
      description: "Get the current weather for a specified location.",
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

async function checkWeather() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "What's the weather like in New York?" }
    ],
    tools,
  });

  if (response.toolCalls?.length) {
    console.log("Tool calls:", JSON.stringify(response.toolCalls, null, 2));
  }
}

checkWeather();
```

### 結構化輸出

為確保模型的輸出符合特定的 JSON 結構，您可以定義一個 `responseFormat`。這對於需要可靠、機器可讀資料的任務非常有用。

```typescript 結構化輸出範例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel({
  model: "llama-3.2-3b-instruct",
});

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

async function getWeatherAsJson() {
  const response = await model.invoke({
    messages: [
      { role: "user", content: "What is the weather in Paris? Respond in the requested JSON format." }
    ],
    responseFormat,
  });

  console.log(response.json);
}

getWeatherAsJson();
```

## 支援的模型

LM Studio 支援多種 GGUF 格式的模型。確切的模型名稱必須與 LM Studio 使用者介面中顯示的名稱相符。熱門的相容模型包括：

| 模型家族 | 變體 |
| :----------- | :------------------------------------- |
| **Llama 3.2** | 3B, 8B, 70B Instruct |
| **Llama 3.1** | 8B, 70B, 405B Instruct |
| **Mistral** | 7B, 8x7B Instruct |
| **Phi-3** | Mini, Small, Medium Instruct |
| **CodeLlama** | 7B, 13B, 34B Instruct |
| **Qwen** | 各種大小 |

## 疑難排解

如果您遇到問題，請參閱以下常見問題和解決方案列表。

| 問題 | 解決方案 |
| :------------------ | :--------------------------------------------------------------------------------------------------------- |
| **連線被拒** | 請確認 LM Studio 本地伺服器正在運行，且您程式碼中的 `baseURL` 是正確的。 |
| **找不到模型** | 請確保您程式碼中的 `model` 名稱與 LM Studio 伺服器中載入的模型檔案名稱完全相符。 |
| **回應緩慢** | 如果可用，請在 LM Studio 的伺服器設定中啟用 GPU 加速。使用較小的模型也可能有所幫助。 |
| **記憶體不足** | 模型可能需要比您系統可用記憶體更多的 RAM。請嘗試使用較小的模型或減少上下文長度。 |

### 錯誤處理

將您的模型呼叫包裝在 `try...catch` 區塊中是一個好習慣，以處理潛在的執行階段錯誤，例如網路問題。

```typescript 錯誤處理範例 icon=logos:typescript
import { LMStudioChatModel } from "@aigne/lmstudio";

const model = new LMStudioChatModel();

async function safeInvoke() {
  try {
    const response = await model.invoke({
      messages: [{ role: "user", content: "Hello!" }],
    });
    console.log(response.text);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("Connection failed. Please ensure the LM Studio server is running.");
    } else {
      console.error("An unexpected error occurred:", error.message);
    }
  }
}

safeInvoke();
```

---

欲了解更多詳細資訊，請參閱官方 [LM Studio 文件](https://lmstudio.ai/docs)。若要探索其他模型整合，您可以繼續閱讀 [AIGNE Hub](./models-aigne-hub.md) 的文件。