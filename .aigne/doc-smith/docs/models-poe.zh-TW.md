使用者想要修正 D2 圖表的語法錯誤。
錯誤訊息 `invalid style keyword: "font-family"` 指出 `font-family` 在 D2 中不是一個有效的樣式屬性。
我需要在 D2 程式碼中移除或修正此行。

基於 ISTJ 人格特質，我將執行以下步驟：
1.  **分析請求：** 使用者已提供有關 D2 語法錯誤的回饋。目標是修正圖表並重新產生文件。
2.  **識別錯誤：** 錯誤是 `invalid style keyword: "font-family"`。這是 D2 程式碼中的一個事實性錯誤。
3.  **制定修正方案：** 我必須從 D2 圖表的 `style` 區塊中移除 `font-family` 屬性。
4.  **重新產生文件：** 我將使用修正後的 D2 程式碼重新產生整個文件。我將確保所有其他資訊保持準確並遵循既定結構。
5.  **審查輸出：** 在最終定稿前，我將再次檢查產生的 Markdown 和修正後的 D2 區塊，以確保其語法正確且邏輯合理。

讓我們來分解文件內容的產生過程。

**計畫：**

1.  **簡介：** 首先概述 `@aigne/poe` 套件，解釋其用途：將 AIGNE 框架與 Poe API 連接，該 API 提供了對各種第三方模型的存取。提及它使用與 OpenAI 相容的 API。連結到主要的「模型總覽」頁面。
2.  **圖表：** 產生一個修正後的 D2 圖表來說明架構。該圖表應顯示 AIGNE 應用程式、`@aigne/poe` 套件、Poe API 以及底層的語言模型（如 GPT、Claude）。不正確的 `font-family` 樣式將被移除。
3.  **安裝：** 提供清晰、可複製貼上的指令，用於使用 npm、yarn 和 pnpm 安裝必要的套件（`@aigne/poe` 和 `@aigne/core`）。這是一個標準的實用步驟。
4.  **設定：** 詳細說明 `PoeChatModel` 的設定選項。
    *   解釋提供 API 金鑰的兩種方式（`apiKey` 屬性與 `POE_API_KEY` 環境變數）。這對設定至關重要。
    *   使用 `<x-field-group>` 以結構化且易於閱讀的格式呈現建構函式選項（`apiKey`、`model`、`modelOptions`、`baseURL`）。
    *   為每個欄位提供精確的描述，包括預設值（`gpt-5-mini`、`https://api.poe.com/v1`）。這些資訊可在原始碼（`models/poe/src/poe.ts`）中找到。
5.  **使用方法部分：**
    *   **標準呼叫：** 提供一個完整、可運作的 TypeScript 範例，展示如何實例化 `PoeChatModel` 並呼叫 `invoke` 方法。使用一個清晰實用的範例（例如，詢問模型它是什麼）。該範例可在 README 中找到。
    *   顯示預期的 JSON 輸出。這有助於使用者驗證他們的實作。
    *   **串流回應：** 提供第二個完整的 TypeScript 範例，示範如何使用 `streaming: true` 選項。展示處理區塊的迴圈（`isAgentResponseDelta`）。這是 README 中提到的一個關鍵功能。
    *   顯示預期的串流輸出，包括最終文字和元資料是如何組合的。
6.  **延伸閱讀 / 摘要：** 最後提供相關外部文件（官方 Poe 文件）和內部文件（核心概念：模型）的連結。這為使用者提供了明確的下一步。

此計畫有條不紊、基於事實，並直接滿足了使用者對技術指南的需求，同時修正了回饋中指出的具體錯誤。它遵循了 ISTJ 的方法，優先考慮準確性、結構和實用性。# Poe

`@aigne/poe` 套件提供了一個標準化介面，用於與 [Poe](https://poe.com/) 整合。Poe 是一項服務，提供對各種第三方語言模型的存取，包括來自 OpenAI、Anthropic 和 Google 的模型。透過利用一個與 OpenAI 相容的 API 端點，此套件讓您能夠在 AIGNE 框架內無縫使用各種模型。

本指南提供安裝、設定和使用 `PoeChatModel` 的逐步流程。有關模型整合的更多一般資訊，請參閱[模型總覽](./models-overview.md)文件。

```d2
direction: down

Developer-App: {
  label: "開發者的\n應用程式"
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  aigne-poe: {
    label: "@aigne/poe\nPoeChatModel"
    shape: rectangle
  }
}

Poe-Service: {
  label: "Poe 服務"
  shape: rectangle

  Poe-API: {
    label: "與 OpenAI 相容的 API"
  }

  Third-Party-Models: {
    label: "第三方語言模型"
    grid-columns: 3
    OpenAI: {}
    Anthropic: {}
    Google: {}
  }
}

Developer-App -> AIGNE-Framework.aigne-poe: "1. 使用 PoeChatModel"
AIGNE-Framework.aigne-poe -> Poe-Service.Poe-API: "2. 傳送 API 請求"
Poe-Service.Poe-API -> Poe-Service.Third-Party-Models: "3. 路由至選定模型"
Poe-Service.Third-Party-Models -> Poe-Service.Poe-API: "4. 產生回應"
Poe-Service.Poe-API -> AIGNE-Framework.aigne-poe: "5. 回傳回應串流"
AIGNE-Framework.aigne-poe -> Developer-App: "6. 交付結果"
```

## 安裝

首先，使用您偏好的套件管理器安裝必要的套件。您將需要 `@aigne/core` 和 Poe 專用的套件。

```bash
npm install @aigne/poe @aigne/core
```

```bash
yarn add @aigne/poe @aigne/core
```

```bash
pnpm add @aigne/poe @aigne/core
```

## 設定

`PoeChatModel` 類別是與 Poe API 互動的主要介面。要將其實例化，您必須提供您的 Poe API 金鑰並指定所需的模型。

您的 API 金鑰可以透過兩種方式設定：
1.  直接在建構函式中透過 `apiKey` 屬性設定。
2.  作為名為 `POE_API_KEY` 的環境變數。

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 Poe API 金鑰。雖然這在建構函式中是選用的，但金鑰必須在此處或在 `POE_API_KEY` 環境變數中提供，驗證才能成功。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-default="gpt-5-mini" data-required="false">
    <x-field-desc markdown>您希望使用的模型的識別碼。Poe 提供了對 `claude-3-opus`、`gpt-4o` 等模型的存取。如果未指定，則預設為 `gpt-5-mini`。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>傳遞給模型 API 的額外選項，例如 `temperature`、`topP` 或 `maxTokens`。這些參數會直接傳送給底層的模型提供者。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="https://api.poe.com/v1" data-required="false">
    <x-field-desc markdown>Poe API 的基礎 URL。除非您使用自訂代理，否則不應更改此項。</x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

以下範例示範如何建立 `PoeChatModel` 實例，並將其用於標準和串流聊天完成。

### 標準呼叫

對於簡單的請求-回應互動，請使用 `invoke` 方法。此方法會傳送請求並等待模型回傳完整的回應。

```typescript 基本用法 icon=logos:typescript
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  // 直接提供 API 金鑰或設定 POE_API_KEY 環境變數
  apiKey: "your-poe-api-key",
  // 指定透過 Poe 可用的所需模型
  model: "claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
```

`invoke` 方法會回傳一個結構化的回應，其中包含模型的輸出和使用情況元資料。

```json 預期輸出 icon=material-symbols:data-object-outline
{
  "text": "我由 Poe 驅動，使用來自 Anthropic 的 Claude 3 Opus 模型。",
  "model": "claude-3-opus",
  "usage": {
    "inputTokens": 5,
    "outputTokens": 14
  }
}
```

### 串流回應

對於即時應用程式，您可以在回應產生時以串流方式接收。在 `invoke` 呼叫中設定 `streaming: true` 選項，以接收非同步的回應區塊串流。

```typescript 串流範例 icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { PoeChatModel } from "@aigne/poe";

const model = new PoeChatModel({
  apiKey: "your-poe-api-key",
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
    if (text) {
      fullText += text;
      process.stdout.write(text);
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Assembled Data ---");
console.log("Full Text:", fullText);
console.log("Metadata:", json);
```

在迭代串流時，每個區塊都會提供回應的增量。完整的文字和元資料必須從這些個別的區塊中組合而成。

```text 預期輸出 icon=material-symbols:terminal
我由 Poe 驅動，使用來自 Anthropic 的 Claude 3 Opus 模型。
--- 最終組合資料 ---
完整文字： 我由 Poe 驅動，使用來自 Anthropic 的 Claude 3 Opus 模型。
元資料： { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## 延伸閱讀

- 有關可用模型及其功能的完整清單，請參閱官方 [Poe 文件](https://developer.poe.com/docs/server-bots-and-apis)。
- 要了解模型如何融入更廣泛的 AIGNE 架構，請參閱[核心概念：模型](./developer-guide-core-concepts-models.md) 頁面。