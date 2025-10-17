# Ideogram

本文件為開發者提供了一份全面的指南，說明如何在 AIGNE 框架內整合並使用 Ideogram 的圖片生成功能。`@aigne/ideogram` 套件為 Ideogram 的 API 提供了一個無縫介面，能夠從文字提示生成高品質的圖片。

本指南將涵蓋安裝、設定和使用的必要步驟，並附有程式碼範例和詳細的參數說明。有關其他模型的資訊，請參閱 [模型總覽](./models-overview.md)。

## 安裝

首先，將 `@aigne/ideogram` 套件安裝到您的專案中。您可以使用您偏好的套件管理器。

```bash title="npm" icon=logos:npm-icon
npm install @aigne/ideogram
```

```bash title="yarn" icon=logos:yarn
yarn add @aigne/ideogram
```

```bash title="pnpm" icon=logos:pnpm
pnpm add @aigne/ideogram
```

## 設定

正確的設定對於連接到 Ideogram API 至關重要。這包括設定您的 API 金鑰和實例化 `IdeogramImageModel`。

### API 金鑰設定

此模型需要一個 Ideogram API 金鑰進行驗證。建議使用最安全的方法是設定環境變數。

```bash title=".env" icon=mdi:folder-key-outline
export IDEOGRAM_API_KEY="your-ideogram-api-key"
```

或者，您也可以在模型實例化時直接傳入 `apiKey`，但這在生產環境中較不安全。

### 模型實例化

一旦 API 金鑰設定完成，您就可以匯入並建立一個 `IdeogramImageModel` 的實例。

```typescript 實例化模型 icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

// API 金鑰將會從環境變數中自動偵測。
const model = new IdeogramImageModel();

// 或者，直接提供 API 金鑰。
const modelWithApiKey = new IdeogramImageModel({
  apiKey: "your-ideogram-api-key", 
});
```

## 基本用法

若要生成圖片，請使用 `invoke` 方法。此方法接受一個包含提示和任何其他所需參數的物件。唯一必要的參數是 `prompt`。

```typescript 生成圖片 icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel();

async function generateImage() {
  try {
    const result = await model.invoke({
      model: "ideogram-v3",
      prompt: "A serene mountain landscape at sunset with golden light",
    });
    
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### 回應物件

`invoke` 方法會回傳一個 promise，其會解析為一個包含生成圖片和使用元資料的物件。

```json 回應範例 icon=material-symbols:data-object-outline
{
  "images": [
    {
      "type": "url",
      "url": "https://api.ideogram.ai/generation/...",
      "mimeType": "image/png"
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

`invoke` 方法接受多個參數來自訂圖片生成過程。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>您想生成的圖片的文字描述。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="ideogram-v3">
    <x-field-desc markdown>目前僅支援 `ideogram-v3`。</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>要生成的圖片數量。有效範圍為 1 到 8。</x-field-desc>
  </x-field>
  <x-field data-name="seed" data-type="number" data-required="false">
    <x-field-desc markdown>用於可重現圖片生成的隨機種子。必須是 0 到 2147483647 之間的整數。</x-field-desc>
  </x-field>
  <x-field data-name="resolution" data-type="string" data-required="false">
    <x-field-desc markdown>生成圖片的解析度（例如：`"1024x1024"`、`"1792x1024"`）。所有支援的解析度請參閱官方 Ideogram API 文件。</x-field-desc>
  </x-field>
  <x-field data-name="aspectRatio" data-type="string" data-required="false">
    <x-field-desc markdown>圖片的長寬比（例如：`"1x1"`、`"16x9"`）。</x-field-desc>
  </x-field>
  <x-field data-name="renderingSpeed" data-type="string" data-required="false" data-default="DEFAULT">
    <x-field-desc markdown>控制生成速度和品質。可接受的值為 `"TURBO"`、`"DEFAULT"` 或 `"QUALITY"`。</x-field-desc>
  </x-field>
  <x-field data-name="magicPrompt" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>啟用或停用 MagicPrompt 以增強提示。可接受的值為 `"AUTO"`、`"ON"` 或 `"OFF"`。</x-field-desc>
  </x-field>
  <x-field data-name="negativePrompt" data-type="string" data-required="false">
    <x-field-desc markdown>描述要從生成圖片中排除的元素。</x-field-desc>
  </x-field>
  <x-field data-name="styleType" data-type="string" data-required="false" data-default="AUTO">
    <x-field-desc markdown>指定藝術風格。可接受的值為 `"AUTO"`、`"GENERAL"`、`"REALISTIC"`、`"DESIGN"` 或 `"FICTION"`。</x-field-desc>
  </x-field>
  <x-field data-name="colorPalette" data-type="object" data-required="false">
    <x-field-desc markdown>定義生成時使用的特定調色盤的物件。</x-field-desc>
  </x-field>
  <x-field data-name="styleCodes" data-type="string[]" data-required="false">
    <x-field-desc markdown>代表特定風格的 8 個字元十六進位碼列表。</x-field-desc>
  </x-field>
</x-field-group>

## 進階用法

為了對輸出有更多的控制，您可以在單一的 `invoke` 呼叫中結合多個可選參數。

```typescript 進階圖片生成 icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel();

async function generateAdvancedImage() {
  try {
    const result = await model.invoke({
      prompt: "A futuristic cityscape with neon lights and flying cars",
      model: "ideogram-v3",
      n: 4,
      resolution: "1792x1024",
      renderingSpeed: "TURBO",
      styleType: "FICTION",
      negativePrompt: "blurry, low quality, distorted",
      seed: 12345,
    });
    
    console.log(`Generated ${result.images.length} images.`);
    result.images.forEach((image, index) => {
      console.log(`Image ${index + 1}: ${image.url}`);
    });
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateAdvancedImage();
```

## 預設模型選項

您可以在模型實例化期間使用 `modelOptions` 屬性設定預設參數。這些選項將應用於每一次 `invoke` 呼叫，除非在呼叫中被參數覆寫。

```typescript 設定預設選項 icon=logos:typescript-icon
import { IdeogramImageModel } from "@aigne/ideogram";

const model = new IdeogramImageModel({
  modelOptions: {
    styleType: "REALISTIC",
    renderingSpeed: "QUALITY",
    magicPrompt: "ON",
  },
});

async function generateWithDefaults() {
  // 這次呼叫將使用上面定義的預設選項。
  const result = await model.invoke({
    prompt: "A photorealistic portrait of an astronaut on Mars",
  });
  
  console.log(result);
}

generateWithDefaults();
```

## 總結

`@aigne/ideogram` 套件提供了一種直接且高效的方式，將 Ideogram 的圖片生成功能整合到您的應用程式中。透過遵循設定步驟並利用所提供的參數，您可以生成符合您特定需求的高品質圖片。

關於所有參數、支援值和進階功能的完整詳細列表，請參閱官方 [Ideogram API 參考文件](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)。