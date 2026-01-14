# 記憶體

`MemoryAgent` 為 Agent 提供了一種機制，使其能夠在多次互動中維持狀態並記住資訊。它作為一個特化的協調器，不直接處理訊息，而是透過兩個關鍵元件來管理記憶體操作：用於儲存資訊的 `Recorder` 和用於回憶資訊的 `Retriever`。這種關注點分離的設計，實現了彈性且可插拔的記憶體儲存解決方案。

## 核心元件

記憶體系統由三個主要類別組成：

1.  **`MemoryAgent`**：管理記憶體操作的中央 Agent。它配置了一個 recorder 和一個 retriever，並提供 `record()` 和 `retrieve()` 方法來與記憶體儲存互動。
2.  **`MemoryRecorder`**：一個負責將資訊寫入持久性儲存後端（例如，資料庫、檔案系統或向量儲存）的 Agent。您必須提供資料儲存方式和位置的實作。
3.  **`MemoryRetriever`**：一個負責根據指定條件（例如搜尋查詢或限制數量）從儲存後端擷取資訊的 Agent。您必須提供擷取邏輯的實作。

<!-- DIAGRAM_IMAGE_START:architecture:16:9 -->
![Memory](assets/diagram/memory-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 運作方式

`MemoryAgent` 將任務委派給其下屬的 Agent。當您在 `MemoryAgent` 上呼叫 `record()` 方法時，它會呼叫其設定的 `MemoryRecorder` 來持久化儲存資料。同樣地，當您呼叫 `retrieve()` 時，它會呼叫 `MemoryRetriever` 來查詢並回傳儲存的資訊。

這種架構讓開發者能夠定義自訂的儲存和擷取邏輯，而無需更改核心的 Agent 工作流程。例如，您可以實作一個將對話歷史記錄儲存到 PostgreSQL 資料庫的 recorder，以及一個使用向量嵌入來尋找語意上相似的過去互動的 retriever。

## `MemoryAgent`

`MemoryAgent` 是記憶體管理的主要介面。它的設計並不是要在處理 Agent 鏈中直接呼叫，而是作為一個有狀態的服務，供其他 Agent 或您的應用程式邏輯使用。

### 設定

要建立一個 `MemoryAgent`，您需要為其提供一個 `recorder` 和一個 `retriever`。它們可以是 `MemoryRecorder` 和 `MemoryRetriever` 的實例，也可以是其各自 `process` 方法的函式定義。

```typescript Agent 初始化 icon=logos:typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@aigne/core";
import { v7 as uuidv7 } from "@aigne/uuid";

// 1. 為示範定義一個簡單的記憶體內儲存
const memoryStore: Map<string, any> = new Map();

// 2. 實作 recorder 邏輯
const recorder = new MemoryRecorder({
  async process({ content }) {
    const memories = content.map((item) => {
      const memory = {
        id: uuidv7(),
        content: item,
        createdAt: new Date().toISOString(),
      };
      memoryStore.set(memory.id, memory);
      return memory;
    });
    return { memories };
  },
});

// 3. 實作 retriever 邏輯
const retriever = new MemoryRetriever({
  async process({ search, limit = 10 }) {
    // 這是一個簡化的搜尋。實際的實作可能會使用資料庫查詢或向量搜尋。
    const allMemories = Array.from(memoryStore.values());
    const filteredMemories = search
      ? allMemories.filter((m) => JSON.stringify(m.content).includes(search as string))
      : allMemories;

    return { memories: filteredMemories.slice(0, limit) };
  },
});

// 4. 實例化 MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder,
  retriever,
});
```

上面的範例展示了如何使用一個簡單的記憶體內儲存機制來建立 `MemoryAgent`。在生產環境中，您會將其替換為更穩健的解決方案，例如資料庫。

### `MemoryAgentOptions`

<x-field-group>
  <x-field data-name="recorder" data-type="MemoryRecorder | MemoryRecorderOptions['process'] | MemoryRecorderOptions" data-required="false">
    <x-field-desc markdown>負責儲存記憶的 Agent 或函式。它可以是一個完整的 `MemoryRecorder` 實例、一個設定物件，或者僅僅是處理函式。</x-field-desc>
  </x-field>
  <x-field data-name="retriever" data-type="MemoryRetriever | MemoryRetrieverOptions['process'] | MemoryRetrieverOptions" data-required="false">
    <x-field-desc markdown>負責擷取記憶的 Agent 或函式。它可以是一個完整的 `MemoryRetriever` 實例、一個設定物件，或者僅僅是處理函式。</x-field-desc>
  </x-field>
  <x-field data-name="autoUpdate" data-type="boolean" data-required="false">
    <x-field-desc markdown>若為 `true`，Agent 將在完成操作後自動記錄資訊，以建立互動歷史。</x-field-desc>
  </x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="要訂閱以進行自動訊息記錄的主題。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="一組可作為技能使用的其他 Agent。recorder 和 retriever 會自動新增到此列表中。"></x-field>
</x-field-group>

## `MemoryRecorder`

`MemoryRecorder` 是一個抽象的 Agent 類別，它定義了儲存記憶的合約。您必須為其 `process` 方法提供具體的實作。

### `MemoryRecorderInput`

`MemoryRecorder` 的 `process` 方法會接收一個 `MemoryRecorderInput` 物件。

<x-field-group>
  <x-field data-name="content" data-type="array" data-required="true">
    <x-field-desc markdown>一個要作為記憶儲存的物件陣列。每個物件可以包含一個 `input`、`output` 和 `source`，以提供記憶的上下文。</x-field-desc>
    <x-field data-name="input" data-type="Message" data-required="false" data-desc="導致此記憶的輸入訊息（例如，使用者的提示）。"></x-field>
    <x-field data-name="output" data-type="Message" data-required="false" data-desc="產生的輸出訊息（例如，AI 的回應）。"></x-field>
    <x-field data-name="source" data-type="string" data-required="false" data-desc="產生輸出的 Agent 或系統的識別碼。"></x-field>
  </x-field>
</x-field-group>

### `MemoryRecorderOutput`

`process` 方法必須回傳一個 `MemoryRecorderOutput` 物件。

<x-field-group>
  <x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="新建立的記憶物件陣列，每個物件都包含其唯一的 ID、原始內容和建立時間戳。"></x-field>
</x-field-group>

## `MemoryRetriever`

`MemoryRetriever` 是一個抽象的 Agent 類別，它定義了從儲存中擷取記憶的合約。您必須為其 `process` 方法提供具體的實作。

### `MemoryRetrieverInput`

`MemoryRetriever` 的 `process` 方法會接收一個 `MemoryRetrieverInput` 物件，以篩選和限制結果。

<x-field-group>
  <x-field data-name="limit" data-type="number" data-required="false">
    <x-field-desc markdown>要回傳的最大記憶數量。可用於分頁或保持較小的上下文視窗。</x-field-desc>
  </x-field>
  <x-field data-name="search" data-type="string | Message" data-required="false">
    <x-field-desc markdown>用於篩選記憶的搜尋詞或訊息物件。實作方式決定了如何使用此值（例如，關鍵字搜尋、向量相似度）。</x-field-desc>
  </x-field>
</x-field-group>

### `MemoryRetrieverOutput`

`process` 方法必須回傳一個 `MemoryRetrieverOutput` 物件。

<x-field-group>
  <x-field data-name="memories" data-type="Memory[]" data-required="true" data-desc="符合擷取條件的記憶物件陣列。"></x-field>
</x-field-group>

## 使用範例

一旦 `MemoryAgent` 設定完成，您就可以在應用程式的上下文中使用它來記錄和擷取資訊。

```typescript AIGNE 互動 icon=logos:typescript
import { AIGNE } from "@aigne/core";

// 假設 memoryAgent 已如第一個範例所示進行設定
const aigne = new AIGNE({
  // ...other configurations
});

async function run() {
  // 記錄一筆新記憶
  const recordedMemory = await aigne.invoke(memoryAgent.record.bind(memoryAgent), {
    content: [{ input: { query: "What is the capital of France?" } }],
  });
  console.log("Recorded:", recordedMemory.memories[0].id);

  // 擷取記憶
  const retrievedMemories = await aigne.invoke(memoryAgent.retrieve.bind(memoryAgent), {
    search: "France",
    limit: 5,
  });
  console.log("Retrieved:", retrievedMemories.memories);
}

run();
```
此範例展示了如何使用 `aigne.invoke` 方法來呼叫 `memoryAgent` 實例上的 `record` 和 `retrieve` 函式，從而在多次互動中有效地管理 Agent 的狀態。

## 總結

`MemoryAgent` 為管理 Agent 應用程式中的狀態提供了一個強大而靈活的抽象層。透過將協調（`MemoryAgent`）與實作細節（`MemoryRecorder`、`MemoryRetriever`）分離，您可以輕鬆整合各種儲存後端，從簡單的記憶體內陣列到複雜的向量資料庫。

有關核心執行引擎的更多資訊，請參閱 [AIGNE](./developer-guide-core-concepts-aigne-engine.md) 文件。要了解工作的基本建構模組，請參閱 [Agents](./developer-guide-core-concepts-agents.md) 頁面。