# 模型

模型是特化的 Agent，作為一個關鍵的抽象層，為與外部 AI 服務 (例如大型語言模型 (LLM) 和圖像生成平台) 的互動提供了一個標準化介面。它們封裝了 API 通訊的複雜性，讓開發者能透過一個一致且統一的合約來與各種 AI 供應商合作。

AIGNE 框架定義了一個基礎的 `Model` 類別，它被兩個主要的特化類別所擴展：`ChatModel` 用於基於文本的對話式 AI，而 `ImageModel` 則用於圖像生成任務。這些抽象是建構更高級別 Agent (如 `AIAgent` 和 `ImageAgent`) 的基礎。

## 核心概念

`Model` 層的設計旨在簡化與不同 AI 供應商的互動。您無需為每個服務 (如 OpenAI、Anthropic 或 Google Gemini) 編寫特定於供應商的程式碼，而是與標準化的 `ChatModel` 或 `ImageModel` 介面互動。AIGNE 框架透過特定的模型套件 (例如 `@aigne/openai`) 來處理這種標準格式與供應商原生 API 之間的轉換。

這種設計提供了幾個關鍵優勢：
- **供應商無關：** 只需最少的程式碼變更即可更換底層的 AI 模型。例如，您可以僅透過更改模型的實例化，就從 OpenAI 的 GPT-4 切換到 Anthropic 的 Claude 3。
- **標準化的資料結構：** 所有模型都使用一致的輸入和輸出結構 (`ChatModelInput`、`ImageModelOutput` 等)，從而簡化了資料處理和 Agent 的組合。
- **簡化的 API：** 模型提供了一個清晰、高級的 API，它抽象化了每個外部服務在驗證、請求格式化和錯誤處理方面的細微差異。

下圖說明了基礎 `Agent`、`Model` 抽象以及它們所連接的外部 AI 服務之間的關係。

```d2
direction: down

Application-Layer: {
  label: "應用層 (您的程式碼)"
  shape: rectangle

  AIAgent: {
    label: "AIAgent"
    shape: rectangle
  }

  ImageAgent: {
    label: "ImageAgent"
    shape: rectangle
  }
}

AIGNE-Framework: {
  label: "AIGNE 框架 (抽象層)"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Model-Abstractions: {
    grid-columns: 2

    ChatModel: {
      label: "ChatModel"
      shape: rectangle
    }
  
    ImageModel: {
      label: "ImageModel"
      shape: rectangle
    }
  }
}

External-AI-Services: {
  label: "外部 AI 服務"
  shape: rectangle
  grid-columns: 3

  OpenAI: {
    label: "OpenAI\n(GPT-4, etc.)"
    shape: cylinder
  }

  Anthropic: {
    label: "Anthropic\n(Claude 3, etc.)"
    shape: cylinder
  }

  Google: {
    label: "Google\n(Gemini, etc.)"
    shape: cylinder
  }
}

Application-Layer.AIAgent -> AIGNE-Framework.Model-Abstractions.ChatModel: "使用 (ChatModelInput/Output)"
Application-Layer.ImageAgent -> AIGNE-Framework.Model-Abstractions.ImageModel: "使用 (ImageModelInput/Output)"
AIGNE-Framework.Model-Abstractions.ChatModel -> External-AI-Services: "連接至 LLM 供應商"
AIGNE-Framework.Model-Abstractions.ImageModel -> External-AI-Services: "連接至圖像供應商"
```

## ChatModel 抽象

`ChatModel` 是一個為與大型語言模型 (LLM) 互動而設計的抽象類別。它提供了一種結構化的方式來處理對話互動，包括多輪對話、工具使用和結構化資料提取。

### ChatModelInput

`ChatModelInput` 介面定義了發送給語言模型的請求的資料結構。它標準化了訊息、工具和其他設定的傳遞方式。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true">
    <x-field-desc markdown>構成對話歷史和當前提示的訊息物件陣列。</x-field-desc>
  </x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false">
    <x-field-desc markdown>指定模型輸出的期望格式，例如純文字或基於所提供綱要的結構化 JSON。</x-field-desc>
  </x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false">
    <x-field-desc markdown>模型可以請求調用以執行操作或檢索資訊的可用工具 (函式) 列表。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false">
    <x-field-desc markdown>控制模型如何使用提供的工具。可以設定為 `"auto"`、`"none"`、`"required"`，或強制進行特定的函式調用。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false">
    <x-field-desc markdown>一個用於存放特定於供應商選項的容器，例如 `temperature`、`topP` 或 `parallelToolCalls`。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'local' | 'file'" data-required="false">
    <x-field-desc markdown>指定任何基於檔案的輸出的期望格式，可以是本地檔案路徑 (`local`) 或 base64 編碼的字串 (`file`)。</x-field-desc>
  </x-field>
</x-field-group>

#### ChatModelInputMessage

`messages` 陣列中的每條訊息都遵循定義好的結構。

<x-field-group>
  <x-field data-name="role" data-type="'system' | 'user' | 'agent' | 'tool'" data-required="true">
    <x-field-desc markdown>訊息發送者的角色。`system` 提供指令，`user` 代表使用者輸入，`agent` 用於模型回應，而 `tool` 則用於工具調用的輸出。</x-field-desc>
  </x-field>
  <x-field data-name="content" data-type="string | UnionContent[]" data-required="false">
    <x-field-desc markdown>訊息的內容。可以是一個簡單的字串，也可以是一個用於多模態內容的陣列，結合了文字和圖像 (`FileUnionContent`)。</x-field-desc>
  </x-field>
  <x-field data-name="toolCalls" data-type="object[]" data-required="false">
    <x-field-desc markdown>在 `agent` 訊息中使用，表示由模型發起的一個或多個工具調用。</x-field-desc>
  </x-field>
  <x-field data-name="toolCallId" data-type="string" data-required="false">
    <x-field-desc markdown>在 `tool` 訊息中使用，將工具的輸出連結回對應的 `toolCalls` 請求。</x-field-desc>
  </x-field>
</x-field-group>

### ChatModelOutput

`ChatModelOutput` 介面標準化了從語言模型收到的回應。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false">
    <x-field-desc markdown>模型回應的基於文本的內容。</x-field-desc>
  </x-field>
  <x-field data-name="json" data-type="object" data-required="false">
    <x-field-desc markdown>當 `responseFormat` 設定為 `"json_schema"` 時，模型返回的 JSON 物件。</x-field-desc>
  </x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false">
    <x-field-desc markdown>模型發出的工具調用請求陣列。每個物件都包含函式名稱和參數。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false">
    <x-field-desc markdown>一個包含 token 使用統計資訊的物件，包括 `inputTokens` 和 `outputTokens`。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>生成回應的模型的識別碼。</x-field-desc>
  </x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false">
    <x-field-desc markdown>模型生成的檔案陣列 (如果有的話)。</x-field-desc>
  </x-field>
</x-field-group>

## ImageModel 抽象

`ImageModel` 是一個用於與圖像生成模型互動的抽象類別。它為根據文本提示創建或編輯圖像提供了一個簡化的合約。

### ImageModelInput

`ImageModelInput` 介面定義了圖像生成任務的請求結構。

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true">
    <x-field-desc markdown>對所需圖像的文本描述。</x-field-desc>
  </x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false">
    <x-field-desc markdown>一個可選的輸入圖像陣列，用於圖像編輯或創建變體等任務。</x-field-desc>
  </x-field>
  <x-field data-name="n" data-type="number" data-required="false">
    <x-field-desc markdown>要生成的圖像數量。預設為 1。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'local' | 'file'" data-required="false">
    <x-field-desc markdown>指定輸出圖像應儲存為本地檔案 (`local`) 還是以 base64 編碼的字串 (`file`) 形式返回。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="ImageModelInputOptions" data-required="false">
    <x-field-desc markdown>一個用於存放特定於供應商選項的容器，例如圖像尺寸、品質或風格預設。</x-field-desc>
  </x-field>
</x-field-group>

### ImageModelOutput

`ImageModelOutput` 介面定義了來自圖像生成服務的回應結構。

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true">
    <x-field-desc markdown>生成圖像的陣列。每個元素的格式取決於輸入中指定的 `outputFileType`。</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false">
    <x-field-desc markdown>一個包含使用統計資訊的物件，其中可能包括 token 計數或其他特定於供應商的指標。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false">
    <x-field-desc markdown>生成圖像的模型的識別碼。</x-field-desc>
  </x-field>
</x-field-group>

## 檔案內容類型

模型透過 `FileUnionContent` 類型處理多模態任務的各種檔案輸入形式。這種可辨識聯合類型允許檔案以三種方式表示：

-   **`LocalContent`**：代表儲存在本地檔案系統上的檔案。
    -   `type`：「local」
    -   `path`：檔案的絕對路徑。
-   **`UrlContent`**：代表可透過公開 URL 存取的檔案。
    -   `type`：「url」
    -   `url`：檔案的 URL。
-   **`FileContent`**：代表以 base64 編碼字串形式呈現的檔案。
    -   `type`：「file」
    -   `data`：檔案的 base64 編碼內容。

`Model` 基礎類別包含一個 `transformFileType` 方法，可根據需要在這些格式之間自動進行轉換，從而簡化跨不同 Agent 和模型供應商的檔案處理。

## 總結

`ChatModel` 和 `ImageModel` 抽象是使 AIGNE 框架靈活且與供應商無關的核心元件。它們為與廣泛的外部 AI 服務互動提供了一個穩定、標準化的介面。

-   要了解如何在實踐中使用這些模型，請參閱 [AI Agent](./developer-guide-agents-ai-agent.md) 和 [Image Agent](./developer-guide-agents-image-agent.md) 的文件。
-   有關設定特定供應商 (如 OpenAI、Anthropic 或 Google Gemini) 的詳細資訊，請參閱 [模型](./models.md) 部分的指南。