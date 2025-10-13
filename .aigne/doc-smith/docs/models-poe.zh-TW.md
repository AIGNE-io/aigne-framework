# @aigne/poe

AIGNE Poe SDK，用於在 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)中與 Poe 語言模型及 API 服務整合。

## 簡介

`@aigne/poe` 提供了 AIGNE 框架與 Poe 語言模型及 API 服務之間的無縫整合。此套件讓開發者能夠輕鬆地在其 AIGNE 應用程式中利用 Poe 的模型，在整個框架中提供一致的介面，同時發揮 Poe 先進的 AI 功能。

```d2
direction: down

Developer: {
  shape: c4-person
}

AIGNE-Application: {
  label: "AIGNE 應用程式"
  shape: rectangle

  App-Code: {
    label: "應用程式碼\n（例如 `model.invoke()`）"
    shape: rectangle
  }

  Dependencies: {
    label: "依賴項"
    shape: rectangle

    aigne-core: {
      label: "@aigne/core"
      shape: rectangle
    }

    aigne-poe: {
      label: "@aigne/poe\n(PoeChatModel)"
      shape: rectangle
    }
  }
}

Poe-API: {
  label: "Poe API 服務"
  shape: cylinder

  Poe-Models: {
    label: "Poe 語言模型\n（例如 claude-3-opus）"
    shape: rectangle
  }
}

Developer -> AIGNE-Application.App-Code: "編寫並執行程式碼"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.Dependencies.aigne-core: "依賴並實作\n核心介面"
AIGNE-Application.App-Code -> AIGNE-Application.Dependencies.aigne-poe: "1. 呼叫 'invoke()'"
AIGNE-Application.Dependencies.aigne-poe -> Poe-API: "2. 發送 API 請求"
Poe-API -> AIGNE-Application.Dependencies.aigne-poe: "3. 回傳回應\n（單一物件或串流）"
AIGNE-Application.Dependencies.aigne-poe -> AIGNE-Application.App-Code: "4. 將結果交付給應用程式"
```

## 功能

*   **Poe API 整合**：直接連接到 Poe 的 API 服務。
*   **聊天完成**：支援 Poe 的聊天完成 API，涵蓋所有可用模型。
*   **函式呼叫**：內建對函式呼叫功能的支援。
*   **串流回應**：支援串流回應，以實現更具響應性的應用程式。
*   **型別安全**：為所有 API 和模型提供全面的 TypeScript 型別定義。
*   **一致的介面**：與 AIGNE 框架的模型介面相容。
*   **錯誤處理**：穩健的錯誤處理與重試機制。
*   **完整的設定選項**：提供廣泛的設定選項以微調行為。

## 安裝

使用您偏好的套件管理器來安裝此套件：

### npm

```bash
npm install @aigne/poe @aigne/core
```

### yarn

```bash
yarn add @aigne/poe @aigne/core
```

### pnpm

```bash
pnpm add @aigne/poe @aigne/core
```

## 設定

首先，實例化 `PoeChatModel`。其建構函式接受一個 `options` 物件進行設定。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 選項
});
```

**建構函式選項**

<x-field-group>
    <x-field data-name="apiKey" data-type="string" data-required="false" data-desc="您的 Poe API 金鑰。若未提供，SDK 將會使用 `POE_API_KEY` 環境變數。"></x-field>
    <x-field data-name="model" data-type="string" data-required="false" data-default="'gpt-5-mini'" data-desc="用於完成的特定 Poe 模型（例如 'claude-3-opus'）。"></x-field>
    <x-field data-name="baseURL" data-type="string" data-required="false" data-default="'https://api.poe.com/v1'" data-desc="Poe API 的基礎 URL。"></x-field>
    <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="傳遞給模型 API 的額外選項，例如 `temperature`、`top_p` 等。"></x-field>
</x-field-group>

您的 API 金鑰可以透過兩種方式設定：
1.  直接在建構函式中設定：`new PoeChatModel({ apiKey: "your-api-key" })`
2.  設定為名為 `POE_API_KEY` 的環境變數。

## 使用方法

### 基本呼叫

若要向 Poe API 發送請求，請使用 `invoke` 方法。此方法接受一個包含 `messages` 陣列的物件，並回傳一個 promise，該 promise 會解析為模型的回應。

```typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 金鑰或使用 POE_API_KEY 環境變數
  apiKey: "your-api-key", // 若已在環境變數中設定，則此項為可選
  // 指定模型（預設為 'gpt-5-mini'）
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* 輸出：
  {
    text: "我由 Poe 提供支援，使用的是 Anthropic 的 Claude 3 Opus 模型。",
    model: "claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

### 串流回應

對於即時應用程式，您可以從模型中串流回應。在 `invoke` 方法的第二個參數中設定 `streaming: true` 選項。這會回傳一個非同步迭代器，它會在回應區塊可用時逐一產出。

```typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-api-key",
  model: "claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
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

console.log(fullText); // 輸出："我由 Poe 提供支援，使用的是 Anthropic 的 Claude 3 Opus 模型。"
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 授權條款

此套件採用 [Elastic-2.0 授權條款](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE.md) 授權。