本文件詳細介紹了 `ChatModel` 類別，這是與大型語言模型（LLM）互動的基礎元件。內容涵蓋了該類別的架構、其輸入和輸出格式，以及支援工具呼叫和結構化資料處理等強大功能的相關資料結構。

```d2
direction: down

User-Application: {
  label: "使用者 / 應用程式"
  shape: c4-person
}

ChatModel-System: {
  label: "ChatModel 系統"
  shape: rectangle

  ChatModel: {
    label: "ChatModel 執行個體"
  }

  LLM: {
    label: "大型語言模型"
    shape: cylinder
  }

  Tools: {
    label: "工具 / 函式"
  }
}

User-Application -> ChatModel-System.ChatModel: "1. 叫用(輸入)"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "2. 傳送格式化請求"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "3. 接收 LLM 回應"

# 路徑 A：簡單文字回應
ChatModel-System.ChatModel -> User-Application: "4a. 傳回帶有文字的輸出"

# 路徑 B：工具呼叫回應
ChatModel-System.ChatModel -> ChatModel-System.Tools: "4b. 執行工具呼叫"
ChatModel-System.Tools -> ChatModel-System.ChatModel: "5b. 傳回工具結果"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "6b. 傳送結果以取得最終答案"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "7b. 接收最終回應"
ChatModel-System.ChatModel -> User-Application: "8b. 傳回最終輸出"
```

## ChatModel

`ChatModel` 類別是一個用於與大型語言模型（LLM）互動的抽象基礎類別。它擴充了 `Agent` 類別，並提供了一個用於管理模型輸入、輸出和功能的標準化介面。針對特定模型（例如 OpenAI、Anthropic）的具體實作應繼承此類別。

### 核心概念

- **可擴充性**：`ChatModel` 的設計使其易於擴充，讓開發者可以透過實作抽象的 `process` 方法，為各種 LLM 建立自訂連接器。
- **統一介面**：它為串流和非串流回應提供了一致的 API，簡化了與不同模型的互動。
- **工具整合**：該類別內建對工具呼叫的支援，使模型能夠與外部函式和資料來源互動。
- **結構化輸出**：`ChatModel` 可以強制模型輸出符合 JSON 結構描述，確保資料的可靠性和結構化。
- **自動重試**：它包含一個預設的重試機制，用於處理網路錯誤和結構化輸出生成問題。

### 關鍵方法

#### `constructor(options?: ChatModelOptions)`

建立一個新的 `ChatModel` 執行個體。

<x-field-group>
  <x-field data-name="options" data-type="ChatModelOptions" data-required="false" data-desc="Agent 的組態選項。">
    <x-field data-name="model" data-type="string" data-required="false" data-desc="要使用的模型的名稱或識別碼。"></x-field>
    <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="每次叫用時傳遞給模型的預設選項。"></x-field>
    <x-field data-name="retryOnError" data-type="boolean | object" data-required="false" data-desc="錯誤重試的組態。預設對網路和結構化輸出錯誤重試 3 次。"></x-field>
  </x-field>
</x-field-group>

#### `process(input: ChatModelInput, options: AgentInvokeOptions)`

所有子類別都必須實作的核心抽象方法。它處理與底層 LLM 的直接通訊，包括傳送請求和處理回應。

<x-field-group>
  <x-field data-name="input" data-type="ChatModelInput" data-required="true" data-desc="包含訊息、工具和模型選項的標準化輸入。"></x-field>
  <x-field data-name="options" data-type="AgentInvokeOptions" data-required="true" data-desc="Agent 叫用的選項，包括上下文和限制。"></x-field>
</x-field-group>

#### `preprocess(input: ChatModelInput, options: AgentInvokeOptions)`

在主 `process` 方法被呼叫之前執行操作。這包括驗證權杖限制並將工具名稱標準化以與 LLM 相容。

#### `postprocess(input: ChatModelInput, output: ChatModelOutput, options: AgentInvokeOptions)`

在 `process` 方法完成後執行操作。其主要作用是更新叫用上下文中的權杖使用統計資料。

### 輸入資料結構

#### `ChatModelInput`

`ChatModel` 的主要輸入介面。

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true" data-desc="要傳送給模型的訊息陣列。"></x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false" data-desc="指定所需的輸出格式（例如，文字或 JSON）。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="檔案輸出的所需格式（'local' 或 'file'）。"></x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false" data-desc="模型可以使用的工具清單。"></x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false" data-desc="工具選擇的策略（例如，'auto'、'required'）。"></x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="模型特定的組態選項。"></x-field>
</x-field-group>

#### `ChatModelInputMessage`

代表對話歷史中的單一訊息。

<x-field-group>
    <x-field data-name="role" data-type="Role" data-required="true" data-desc="訊息作者的角色（'system'、'user'、'agent' 或 'tool'）。"></x-field>
    <x-field data-name="content" data-type="ChatModelInputMessageContent" data-required="false" data-desc="訊息的內容，可以是字串或豐富內容陣列。"></x-field>
    <x-field data-name="toolCalls" data-type="object[]" data-required="false" data-desc="對於 'agent' 角色，模型請求的工具呼叫清單。"></x-field>
    <x-field data-name="toolCallId" data-type="string" data-required="false" data-desc="對於 'tool' 角色，此訊息所回應的工具呼叫 ID。"></x-field>
</x-field-group>

#### `ChatModelInputTool`

定義模型可以叫用的工具。

<x-field-group>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="工具的類型。目前僅支援 'function'。"></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="函式定義。">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="函式的名稱。"></x-field>
        <x-field data-name="description" data-type="string" data-required="false" data-desc="關於函式功能的描述。"></x-field>
        <x-field data-name="parameters" data-type="object" data-required="true" data-desc="定義函式參數的 JSON 結構描述物件。"></x-field>
    </x-field>
</x-field-group>

### 輸出資料結構

#### `ChatModelOutput`

`ChatModel` 的主要輸出介面。

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="來自模型的文字回應。"></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="來自模型的 JSON 回應，如果請求了 JSON 結構描述。"></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false" data-desc="模型想要執行的工具呼叫清單。"></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="叫用的權杖使用統計資料。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="產生回應的模型的名稱。"></x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false" data-desc="模型產生的檔案清單。"></x-field>
</x-field-group>

#### `ChatModelOutputToolCall`

代表模型請求的單一工具呼叫。

<x-field-group>
    <x-field data-name="id" data-type="string" data-required="true" data-desc="此工具呼叫的唯一識別碼。"></x-field>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="工具的類型。"></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="函式呼叫的詳細資訊。">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="要呼叫的函式的名稱。"></x-field>
        <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="要傳遞給函式的參數，解析為 JSON 物件。"></x-field>
    </x-field>
</x-field-group>

#### `ChatModelOutputUsage`

提供有關權杖消耗的資訊。

<x-field-group>
    <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="輸入提示中使用的權杖數量。"></x-field>
    <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="輸出中產生的權杖數量。"></x-field>
    <x-field data-name="aigneHubCredits" data-type="number" data-required="false" data-desc="如果使用 AIGNE Hub 服務，所消耗的點數。"></x-field>
</x-field-group>