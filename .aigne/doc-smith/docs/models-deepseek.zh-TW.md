# DeepSeek

本指南說明如何透過 `@aigne/deepseek` 套件在 AIGNE 框架中設定和使用 DeepSeek 模型。內容涵蓋 API 金鑰設定、模型實例化，以及標準和串流回應的範例。

`@aigne/deepseek` 套件提供了與 DeepSeek API 的直接整合，利用其強大的語言模型。它的設計與 AIGNE 框架的 `ChatModel` 介面相容，確保了一致的開發體驗。

## 安裝

首先，請使用您偏好的套件管理器安裝必要的套件。`@aigne/core` 套件是必要的對等依賴項。

```bash tabs
npm install @aigne/deepseek @aigne/core
```

```bash tabs
yarn add @aigne/deepseek @aigne/core
```

```bash tabs
pnpm add @aigne/deepseek @aigne/core
```

## 設定

`DeepSeekChatModel` 類別是與 DeepSeek 模型互動的主要介面。它擴充了 `OpenAIChatModel`，並設定為使用 DeepSeek 特定的 API 端點和驗證方法。

驗證需要您的 DeepSeek API 金鑰。您可透過兩種方式提供：

1.  **直接在建構函式中**：透過 `apiKey` 屬性傳入金鑰。
2.  **環境變數**：設定 `DEEPSEEK_API_KEY` 環境變數。如果未提供 `apiKey` 屬性，模型將自動使用它。

### 參數

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 DeepSeek API 金鑰。如果未提供，客戶端將尋找 `DEEPSEEK_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="deepseek-chat" data-required="false">
    <x-field-desc markdown>用於聊天完成的特定 DeepSeek 模型。預設為 `deepseek-chat`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>傳遞給模型 API 的額外選項，例如 `temperature`、`top_p` 或 `max_tokens`。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.deepseek.com" data-required="false">
    <x-field-desc markdown>DeepSeek API 的基礎 URL。除非您使用自訂代理，否則不應更改此項。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方式

設定完成後，即可使用該模型生成文本完成或串流回應。

### 基本調用

若要生成標準回應，請使用 `invoke` 方法。提供一個訊息列表，該方法將回傳一個 promise，其解析值為模型的完整回應。

```typescript Basic Usage icon=logos:typescript
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  // 直接提供 API 金鑰或使用環境變數 DEEPSEEK_API_KEY
  apiKey: "your-api-key", // 如果已在環境變數中設定，則為選用
  // 指定模型版本（預設為 'deepseek-chat'）
  model: "deepseek-chat",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

`result` 物件包含生成的文本和關於模型使用情況的中繼資料。

**回應範例**

```json
{
  "text": "Hello! I'm an AI assistant powered by DeepSeek's language model.",
  "model": "deepseek-chat",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### 串流回應

對於即時應用程式，您可以從模型串流回應。在 `invoke` 方法的第二個參數中將 `streaming` 選項設定為 `true`。這會回傳一個非同步迭代器，在回應區塊可用時逐一產生。

```typescript Streaming Responses icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DeepSeekChatModel } from "@aigne/deepseek";

const model = new DeepSeekChatModel({
  apiKey: "your-api-key",
  model: "deepseek-chat",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText);
// 預期輸出："Hello! I'm an AI assistant powered by DeepSeek's language model."

console.log(json);
// 預期輸出：{ model: "deepseek-chat", usage: { inputTokens: 7, outputTokens: 12 } }
```

在此範例中，程式碼會迭代處理串流，從每個區塊中累積文本 delta 以建構完整的回應。最後的區塊會提供最終的中繼資料，例如 token 使用量。

## 總結

本指南涵蓋了使用 AIGNE 框架安裝、設定和使用 DeepSeek 模型的基本步驟。透過遵循這些說明，您可以將 DeepSeek 的聊天功能整合到您的應用程式中，適用於單輪和串流使用案例。有關更進階的設定和功能，請參閱 API 參考和其他文件章節。