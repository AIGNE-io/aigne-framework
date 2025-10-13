# @aigne/ollama

`@aigne/ollama` SDK 提供了 AIGNE 框架與透過 Ollama 本地託管的 AI 模型之間的無縫整合。這讓開發者可以在他們的 AIGNE 應用程式中輕鬆利用開源語言模型，提供一致的介面，同時確保隱私和對 AI 功能的離線存取。

```d2
direction: down

AIGNE-Application: {
  label: "您的 AIGNE 應用程式"
  shape: rectangle
}

aigne-ollama: {
  label: "@aigne/ollama SDK"
  shape: rectangle
}

Ollama-Instance: {
  label: "Ollama 實例\n(本地執行)"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  API-Server: {
    label: "API 伺服器\n(localhost:11434)"
    shape: rectangle
  }

  Local-Models: {
    label: "本地 AI 模型"
    shape: rectangle
    grid-columns: 2

    Llama3: { shape: rectangle }
    Mistral: { shape: rectangle }
    "and more...": { shape: rectangle }
  }
}

AIGNE-Application -> aigne-ollama: "使用 `OllamaChatModel`"
aigne-ollama -> Ollama-Instance.API-Server: "傳送 HTTP API 請求"
Ollama-Instance.API-Server -> Ollama-Instance.Local-Models: "載入並執行模型"
Ollama-Instance.Local-Models -> Ollama-Instance.API-Server: "返回完成結果"
```

## 功能

*   **直接整合 Ollama**：直接連接到本地的 Ollama 實例。
*   **支援本地模型**：使用透過 Ollama 託管的各種開源模型。
*   **聊天完成**：完整支援與所有相容 Ollama 模型一起使用的聊天完成 API。
*   **串流回應**：透過支援串流回應，實現即時、反應靈敏的應用程式。
*   **型別安全**：受益於所有 API 和模型的全面 TypeScript 型別定義。
*   **一致的介面**：與 AIGNE 框架的模型介面平滑整合。
*   **注重隱私**：在本地執行模型，無需將資料傳送到外部服務。
*   **完整設定**：存取廣泛的設定選項以微調模型行為。

## 前提條件

在使用此套件之前，您必須在您的機器上安裝並執行 [Ollama](https://ollama.ai/)。您還需要拉取至少一個模型。請按照 [Ollama 網站](https://ollama.ai/) 上的官方說明完成設定。

## 安裝

使用您偏好的套件管理器安裝此套件及其核心依賴項。

### npm

```bash
npm install @aigne/ollama @aigne/core
```

### yarn

```bash
yarn add @aigne/ollama @aigne/core
```

### pnpm

```bash
pnpm add @aigne/ollama @aigne/core
```

## 設定

主要的進入點是 `OllamaChatModel` 類別，它會連接到您的本地 Ollama 實例。

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // 您的 Ollama 實例的基礎 URL。
  // 預設為 `http://localhost:11434`。
  baseURL: "http://localhost:11434",

  // 用於完成的 Ollama 模型。
  // 預設為 'llama3'。
  model: "llama3",

  // 傳遞給模型的額外選項。
  modelOptions: {
    temperature: 0.8,
  },
});
```

建構函式接受以下選項：

| 參數 | 型別 | 說明 | 預設值 |
| :--- | :--- | :--- | :--- |
| `model` | `string` | 要使用的 Ollama 模型名稱。 | `llama3.2` |
| `baseURL` | `string` | Ollama 伺服器的基礎 URL。也可以透過 `OLLAMA_BASE_URL` 環境變數設定。 | `http://localhost:11434/v1` |
| `modelOptions` | `object` | 包含模型特定參數的物件，例如 `temperature`、`top_p` 等。 | `{}` |
| `apiKey` | `string` | 用於驗證的 API 金鑰。也可以透過 `OLLAMA_API_KEY` 設定。 | `ollama` |

## 基本用法

若要產生回應，請使用 `invoke` 方法。傳入一個訊息列表，它將返回一個單一、完整的回應。

```typescript
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Tell me what model you're using" }],
});

console.log(result);
```

**輸出：**

```json
{
  "text": "I'm an AI assistant running on Ollama with the llama3 model.",
  "model": "llama3"
}
```

## 串流回應

對於更具互動性的應用程式，您可以在回應產生時進行串流。在 `invoke` 呼叫中設定 `streaming: true` 選項，以接收非同步的回應區塊串流。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me what model you're using" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  // 使用 isAgentResponseDelta 型別防護來處理 delta
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在文字到達時印出
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log("Full Text:", fullText);
console.log("JSON:", json);
```

**輸出：**

```
I'm an AI assistant running on Ollama with the llama3 model.
--- Final Data ---
Full Text: I'm an AI assistant running on Ollama with the llama3 model.
JSON: { "model": "llama3" }
```

## 授權

此套件根據 [Elastic-2.0 授權](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 授權。