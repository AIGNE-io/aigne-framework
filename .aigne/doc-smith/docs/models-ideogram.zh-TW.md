# @aigne/ideogram SDK

`@aigne/ideogram` 套件提供了 AIGNE 框架與 Ideogram 強大圖像生成模型之間的無縫整合。此 SDK 使開發者能夠在其 AIGNE 應用程式中輕鬆利用 Ideogram 的進階圖像生成功能，並提供了一致且簡化的介面。

本指南將引導您完成 `@aigne/ideogram` SDK 的安裝過程、基本用法和進階功能。

## 安裝

您可以使用您偏好的套件管理器來安裝此套件。

### 使用 npm

```bash
npm install @aigne/ideogram
```

### 使用 yarn

```bash
yarn add @aigne/ideogram
```

### 使用 pnpm

```bash
pnpm add @aigne/ideogram
```

## 驗證

若要使用 Ideogram API，您需要一組 API 金鑰。您可以透過以下兩種方式提供金鑰：

1.  **直接在建構函式中傳遞：** 在選項物件中傳入 `apiKey`。
2.  **使用環境變數：** SDK 會自動偵測 `IDEOGRAM_API_KEY` 環境變數。

```bash
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

## 基本用法

以下是一個如何從文字提示生成圖像的簡單範例：

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

// 初始化模型
const model = new IdeogramImageModel({
  apiKey: "your-api-key", // 如果已設定 IDEOGRAM_API_KEY，此項為選填
});

// 定義生成參數
const result = await model.invoke({
  model: "ideogram-v3",
  prompt: "A serene mountain landscape at sunset with golden light",
});

// 記錄輸出
console.log(result);
```

### 範例回應

```json
{
  "images": [
    {
      "url": "https://api.ideogram.ai/generation/..."
    }
  ],
  "usage": {
    "inputTokens": 0,
    "outputTokens": 0
  },
  "model": "ideogram-v3"
}
```

## 輸入參數

`invoke` 方法接受一個包含數個參數的物件，用以自訂您的圖像生成。

### 必要參數

| 參數 | 類型 | 說明 |
| :-------- | :----- | :---------------------------------------------------- |
| `prompt` | string | 您想生成的圖像的文字描述。 |

### 選用參數

| 參數 | 類型 | 說明 |
| :--------------- | :--------- | :-------------------------------------------------------------------------------------------------------- |
| `model` | string | 用於生成的模型。目前僅支援 `ideogram-v3`。 |
| `n` | number | 要生成的圖像數量。必須介於 1 到 8 之間。預設為 1。 |
| `seed` | number | 用於可重現結果的隨機種子。必須介於 0 和 2147483647 之間。 |
| `resolution` | string | 生成圖像的解析度（例如："1024x1024"、"1792x1024"）。 |
| `aspectRatio` | string | 圖像的長寬比（例如："1x1"、"16x9"）。 |
| `renderingSpeed` | string | 生成速度。可以是 "TURBO"、"DEFAULT" 或 "QUALITY"。 |
| `magicPrompt` | string | 啟用或停用 MagicPrompt。可以是 "AUTO"、"ON" 或 "OFF"。 |
| `negativePrompt` | string | 描述要從圖像中排除的內容。 |
| `colorPalette` | object | 用於影響生成的調色盤。 |
| `styleCodes` | string[] | 一個包含 8 個字元的十六進位樣式代碼清單。 |
| `styleType` | string | 要應用的樣式類型。可以是 "AUTO"、"GENERAL"、"REALISTIC"、"DESIGN" 或 "FICTION"。 |

有關所有參數的完整詳細清單，請參閱 [Ideogram 官方 API 參考](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)。

## 進階用法

您可以結合多個參數，以對生成的圖像獲得更多控制。

```typescript
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  apiKey: "your-api-key",
});

const result = await model.invoke({
  prompt: "A futuristic cityscape with neon lights and flying cars",
  model: "ideogram-v3",
  n: 4,
  resolution: "1792x1024",
  renderingSpeed: "TURBO",
  styleType: "FICTION",
  negativePrompt: "blurry, low quality, distorted",
  seed: 12345
});

console.log(result.images);
```

## 預設模型選項

在建立 `IdeogramImageModel` 實例時設定預設選項，這些選項將應用於所有後續的 `invoke` 呼叫。這些預設值可以在個別呼叫中被覆寫。

```typescript
const model = new IdeogramImageModel({
  apiKey: "your-api-key",
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON"
  }
});

// 這次呼叫將使用預設的模型選項
const result = await model.invoke({
  prompt: "A photorealistic portrait of an astronaut on Mars",
});
```