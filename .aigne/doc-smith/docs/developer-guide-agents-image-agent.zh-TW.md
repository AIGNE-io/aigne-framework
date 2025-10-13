# ImageAgent

`ImageAgent` 是一個特製化 Agent，它擴充了基礎的 `Agent` 類別，以協助從文字指令生成圖片。它與底層的 `ImageModel` 整合，以根據動態輸入建立視覺內容。

此 Agent 非常適合需要自動化圖片建立的任務，例如生成頭像、藝術插圖或基於資料的視覺化。

## 運作方式

`ImageAgent` 透過以下關鍵元件來協調圖片生成過程：

1.  **PromptBuilder**：它使用 `PromptBuilder` 為圖片模型建構詳細的提示。初始化時提供的 `instructions` 作為範本，可以用輸入的動態資料來填充。
2.  **ImageModel**：它需要在執行上下文中存在一個 `ImageModel`。此模型負責根據從 `PromptBuilder` 收到的提示進行實際的圖片渲染。
3.  **處理**：當 Agent 被呼叫時，其 `process` 方法會建構最終的提示，使用該提示和任何指定的模型選項來呼叫 `ImageModel`，並回傳生成的圖片輸出。

此圖說明了 `ImageAgent` 與其核心依賴項之間的關係：

```d2
direction: down

ImageAgent: {
  label: "ImageAgent"
  shape: rectangle
}

PromptBuilder: {
  label: "PromptBuilder"
  shape: rectangle
}

ImageModel: {
  label: "ImageModel\n（來自執行上下文）"
  shape: rectangle
}

ImageAgent -> PromptBuilder: "1. 使用指令建構提示"
ImageAgent -> ImageModel: "2. 使用提示和選項呼叫"
ImageModel -> ImageAgent: "3. 回傳生成的圖片"
```

## 類別定義

`ImageAgent` 類別提供了用於建立和設定圖片生成 Agent 的主要介面。

### `ImageAgent.from(options)`

一個靜態方法，用於建立 `ImageAgent` 的新實例。

**參數**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="Agent 的設定選項。"></x-field>
</x-field-group>

**回傳**

<x-field data-name="" data-type="ImageAgent" data-desc="一個新的 ImageAgent 實例。"></x-field>

### `new ImageAgent(options)`

`ImageAgent` 類別的建構函數。

**參數**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="Agent 的設定選項。"></x-field>
</x-field-group>

## `ImageAgentOptions`

用於設定 `ImageAgent` 的選項物件。它擴充了基礎的 `AgentOptions`。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true" data-desc="一個字串範本或 `PromptBuilder` 實例，用於定義生成圖片的指令。可以使用預留位置來插入輸入資料（例如 `{{object}}`）。"></x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false" data-desc="一個選項字典，直接傳遞給底層的圖片模型，從而可以對生成過程進行微調控制（例如，解析度、品質）。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="指定輸出圖片所需的檔案格式（例如 'png'、'jpeg'）。"></x-field>
</x-field-group>

## 使用範例

您可以在 TypeScript 中以程式化方式或使用 YAML 以宣告方式定義和使用 `ImageAgent`。

### 程式化使用（TypeScript）

以下是在您的程式碼中建立和呼叫 `ImageAgent` 的方法。

```typescript
import { ImageAgent } from "@AIGNE/core"; // 假設 AIGNE 是套件名稱

// 1. 建立 ImageAgent 的實例
const drawingAgent = new ImageAgent({
  name: "drawing-agent",
  description: "一個根據描述和風格繪製圖片的 Agent。",
  instructions: "Draw an image of a {{object}} in the {{style}} style.",
});

// 2. 為 Agent 定義輸入
const input = {
  object: "a serene lake at sunrise",
  style: "impressionistic",
};

// 3. 呼叫 Agent 以生成圖片
// 在呼叫 invoke 的上下文中必須有可用的 imageModel。
async function generateImage() {
  try {
    const result = await context.invoke(drawingAgent, input);
    // result.output 將包含生成的圖片資料
    console.log("Image generated:", result.output);
    return result.output;
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### 宣告式使用（YAML）

Agent 也可以在 YAML 設定檔中定義，這對於在不同環境中載入它們很有用。

以下範例定義了一個 `ImageAgent`，它以指定風格繪製一個物件。

```yaml
# packages/core/test-agents/image.yaml
type: image
name: test-image-agent
instructions: |
  Draw an image of a {{object}} in the {{style}} style.
input_schema:
  type: object
  properties:
    object:
      type: string
      description: 要繪製的物件。
    style:
      type: string
      description: 圖片的風格。
  required:
    - object
    - style
```

這種宣告式方法將 Agent 的定義與應用程式邏輯分開，使其易於管理和更新。