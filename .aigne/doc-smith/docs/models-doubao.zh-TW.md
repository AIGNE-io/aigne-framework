# Doubao

`@aigne/doubao` 套件提供了 AIGNE 框架與豆包強大的語言和圖像生成模型之間的無縫整合。本指南為在您的 AIGNE 應用程式中設定和使用豆包模型提供了完整的參考。

此整合讓開發人員可以透過 AIGNE 框架一致且統一的介面，來利用豆包的先進 AI 功能。

## 安裝

首先，使用您偏好的套件管理器安裝必要的套件。您將需要 `@aigne/core` 和豆包專用的套件。

```bash
npm install @aigne/doubao @aigne/core
```

```bash
yarn add @aigne/doubao @aigne/core
```

```bash
pnpm add @aigne/doubao @aigne/core
```

## 設定

若要使用豆包模型，您必須提供一個 API 金鑰。金鑰可以透過以下兩種方式之一進行設定，優先順序如下：

1.  **直接實例化**：在模型的建構函式中直接傳入 `apiKey`。此方法明確，並會覆寫任何其他設定。
2.  **環境變數**：設定 `DOUBAO_API_KEY` 環境變數。如果建構函式中未提供金鑰，模型將自動使用此變數。

```typescript "設定範例" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

// 方法 1：直接實例化
const modelWithApiKey = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
});

// 方法 2：環境變數
// 在您的 .env 檔案或 shell 中設定 DOUBAO_API_KEY
// DOUBAO_API_KEY="your-doubao-api-key"
const modelFromEnv = new DoubaoChatModel();
```

豆包 API 的基礎 URL 已預先設定為 `https://ark.cn-beijing.volces.com/api/v3`，但如有必要，可以透過向建構函式傳入 `baseURL` 選項來覆寫它。

## 聊天模型

對於對話型任務，`DoubaoChatModel` 提供了與豆包語言模型的介面。它利用了與 OpenAI 相容的 API 結構，確保了熟悉的開發體驗。

### 基本用法

若要執行聊天補全，請實例化 `DoubaoChatModel` 並使用 `invoke` 方法。

```typescript "基本聊天補全" icon=logos:typescript
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key", // 或使用環境變數
  model: "doubao-seed-1-6-250615",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Introduce yourself" }],
});

console.log(result);
```

**回應範例**

```json
{
  "text": "Hello! I'm an AI assistant powered by Doubao's language model.",
  "model": "doubao-seed-1-6-250615",
  "usage": {
    "inputTokens": 7,
    "outputTokens": 12
  }
}
```

### 串流回應

對於即時應用程式，您可以從模型串流傳輸回應。在 `invoke` 呼叫中將 `streaming` 選項設定為 `true`，並迭代產生的串流以在區塊到達時進行處理。

```typescript "串流聊天回應" icon=logos:typescript
import { isAgentResponseDelta } from "@aigne/core";
import { DoubaoChatModel } from "@aigne/doubao";

const model = new DoubaoChatModel({
  apiKey: "your-doubao-api-key",
  model: "doubao-seed-1-6-250615",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Introduce yourself" }],
  },
  { streaming: true }
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在文字區塊到達時印出
    }
    if (chunk.delta.json) {
      Object.assign(json, chunk.delta.json);
    }
  }
}

console.log("\n--- Final Data ---");
console.log(fullText);
console.log(json);
```

### 聊天模型參數

`DoubaoChatModel` 建構函式接受以下選項：

<x-field-group>
  <x-field data-name="apiKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的豆包 API 金鑰。若未提供，將使用 `DOUBAO_API_KEY` 環境變數。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seed-1-6-250615">
    <x-field-desc markdown>要使用的特定聊天模型。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-required="false" data-default="https://ark.cn-beijing.volces.com/api/v3">
    <x-field-desc markdown>豆包 API 端點的基礎 URL。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>傳遞給模型 API 的額外選項，例如 `temperature`、`top_p` 等。這些是標準的 OpenAI 相容參數。</x-field-desc>
  </x-field>
</x-field-group>

## 圖像模型

`DoubaoImageModel` 類別透過與豆包的圖像模型介接來啟用圖像生成。

### 基本用法

實例化 `DoubaoImageModel` 並使用提示呼叫 `invoke` 方法以生成圖像。

```typescript "圖像生成" icon=logos:typescript
import { DoubaoImageModel } from "@aigne/doubao";

async function generateImage() {
  const imageModel = new DoubaoImageModel({
    apiKey: "your-doubao-api-key", // 或使用環境變數
    model: "doubao-seedream-4-0-250828",
  });

  const result = await imageModel.invoke({
    prompt: "A photorealistic image of a cat programming on a laptop",
    modelOptions: {
      size: "1024x1024",
      watermark: false,
    },
  });

  console.log(result);
}

generateImage();
```

**回應範例**

```json
{
  "images": [
    {
      "type": "file",
      "data": "...", // base64 編碼的圖像資料
      "mimeType": "image/jpeg"
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 1
  },
  "model": "doubao-seedream-4-0-250828"
}
```

### 圖像模型參數

`DoubaoImageModel` 的 `invoke` 方法接受一個具有以下屬性的輸入物件。請注意，參數的可用性可能因模型而異。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>所需圖像的文字描述。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="doubao-seedream-4-0-250828">
    <x-field-desc markdown>要使用的圖像模型的識別碼。</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnion" data-required="false">
    <x-field-desc markdown>對於圖像轉圖像模型 (`doubao-seededit-3-0-i2i`)，提供輸入圖像。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>包含模型特定參數的物件。</x-field-desc>
    <x-field data-name="size" data-type="string" data-required="false">
      <x-field-desc markdown>生成圖像的所需尺寸 (例如 `\"1024x1024\"`)。</x-field-desc>
    </x-field>
    <x-field data-name="seed" data-type="number" data-required="false">
      <x-field-desc markdown>用於可重現結果的種子值。由 `doubao-seedream-3-0-t2i` 和 `doubao-seededit-3-0-i2i` 支援。</x-field-desc>
    </x-field>
    <x-field data-name="guidanceScale" data-type="number" data-required="false">
      <x-field-desc markdown>控制生成圖像與提示的符合程度。由 `doubao-seedream-3-0-t2i` 和 `doubao-seededit-3-0-i2i` 支援。</x-field-desc>
    </x-field>
    <x-field data-name="stream" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>若為 `true`，則串流傳輸生成結果。由 `doubao-seedream-4` 模型支援。</x-field-desc>
    </x-field>
    <x-field data-name="watermark" data-type="boolean" data-required="false" data-default="false">
      <x-field-desc markdown>若為 `false`，則停用生成圖像上的浮水印。</x-field-desc>
    </x-field>
    <x-field data-name="sequentialImageGeneration" data-type="boolean" data-required="false">
      <x-field-desc markdown>啟用循序圖像生成。由 `doubao-seedream-4` 模型支援。</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### 支援的圖像模型

下表列出了支援的圖像模型及其主要特性。

| 模型系列 | 支援的模型 | 主要使用案例 |
| --------------------------- | ------------------------------- | --------------------- |
| `doubao-seedream-4` | `doubao-seedream-4-0-250828` | 文字轉圖像 (T2I) |
| `doubao-seedream-3-0-t2i` | (具體模型名稱各不相同) | 文字轉圖像 (T2I) |
| `doubao-seededit-3-0-i2i` | (具體模型名稱各不相同) | 圖像轉圖像 (I2I) |