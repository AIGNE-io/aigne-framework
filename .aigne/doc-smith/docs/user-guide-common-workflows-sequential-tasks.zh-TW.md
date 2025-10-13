# TeamAgent

## 總覽

`TeamAgent` 是一種專門的 Agent，它負責協調一組其他的 Agent（稱為「技能」）來完成複雜的任務。它扮演著管理者的角色，指導其技能 Agent 之間的工作流程和資料流。這使得創建複雜、多步驟的 AI 系統成為可能，其中每個 Agent 都可以專注於特定的專業領域。

`TeamAgent` 支援多種強大的工作流程模式：

*   **順序處理 (Sequential Processing)**：Agent 們一個接一個地執行，形成一個處理管線。
*   **並行處理 (Parallel Processing)**：Agent 們同時執行，適用於可以獨立執行的任務。
*   **反思 (Reflection)**：一個迭代過程，其中一個「審查者」Agent 提供回饋以改善輸出，直到滿足特定標準為止。
*   **迭代 (Iteration)**：對一個項目列表進行批次處理，將相同的工作流程應用於每個項目。

透過結合這些模式，您可以建構模組化、可擴展且功能強大的 AI 解決方案。

## 關鍵概念

### 處理模式

`TeamAgent` 可以在兩種主要模式下運作，由 `ProcessMode` 列舉定義。該模式決定了團隊中 Agent 的執行方式。

*   `ProcessMode.sequential`：在此模式下，Agent 們按順序執行。第一個 Agent 的輸出與初始輸入合併後，傳遞給第二個 Agent，依此類推。這創建了一個管線，其中每一步都建立在前一步的基礎上。它非常適合具有明確依賴關係的任務。

*   `ProcessMode.parallel`：在此模式下，所有 Agent 同時執行。每個 Agent 都會接收完全相同的初始輸入。然後，它們各自的輸出會被合併以形成最終結果。這對於可以同時運行的獨立子任務而言非常有效率。

## 建立 TeamAgent

您可以透過提供一個 `skills` 列表（它將管理的 Agent）和一個處理 `mode` 來建立一個 `TeamAgent`。

### 順序處理

在順序模式下，Agent 們形成一個鏈。每個 Agent 的輸出都作為額外輸入傳遞給下一個 Agent，使其非常適合多階段的工作流程。

**使用案例**：一個內容創作管線，其中文字首先被生成，然後被翻譯，最後進行格式審查。

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1：將內容翻譯成中文
const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("The text content to translate"),
  }),
  instructions: "Translate the text to Chinese:\n{{content}}",
  outputKey: "translation",
});

// Agent 2：潤飾翻譯後的文本
const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("The translated text"),
  }),
  instructions: "Prettier the following text:\n{{translation}}",
  outputKey: "formatted",
});

// 建立一個順序執行的團隊
const sequentialTeam = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

當這個團隊被調用時，`translatorAgent` 會首先運行。它的輸出 `{ translation: "..." }` 會與原始輸入合併，然後傳遞給 `prettierAgent`。

### 並行處理

在並行模式下，所有 Agent 都會接收相同的輸入並同時運行。它們的輸出會被收集並合併。這非常適合需要對相同資料進行多個獨立分析的任務。

**使用案例**：分析一個產品描述，以同時提取其主要功能和目標受眾。

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1：提取產品功能
const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify and list the key features of the product.",
  outputKey: "features",
});

// Agent 2：識別目標受眾
const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify the target audience for this product.",
  outputKey: "audience",
});

// 建立一個並行執行的團隊
const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

當這個團隊被調用並提供一個產品描述時，`featureAnalyzer` 和 `audienceAnalyzer` 會同時運行，它們的輸出會被合併成一個單一的結果：`{ features: "...", audience: "..." }`。

## 進階工作流程

除了簡單的順序和並行執行外，`TeamAgent` 還為更複雜的場景提供了進階功能。

### 反思模式

反思模式啟用了一個迭代式的改善工作流程。團隊的輸出會由一個指定的 `reviewer` Agent 進行審查。如果輸出未被批准，該過程將會重複，並將先前的輸出和回饋作為下一次嘗試的上下文。此循環將持續進行，直到輸出被批准或達到最大迭代次數為止。

這對於品質保證、自我修正以及需要高度準確性的任務非常有用。

**設定 (`ReflectionMode`)**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="負責評估團隊輸出的 Agent。"></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean>) | string" data-required="true" data-desc="一個函數或審查者輸出中的欄位名稱，用於判斷結果是否被批准。如果是一個字串，則會檢查對應欄位的真值。"></x-field>
  <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="在拋出錯誤前，最大的審查週期次數。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="若為 true，則在達到最大迭代次數時返回最後生成的輸出，而不是拋出錯誤。"></x-field>
</x-field-group>

### 迭代器模式

迭代器模式專為批次處理而設計。當您使用 `iterateOn` 選項指定一個輸入欄位時，`TeamAgent` 將會對該欄位陣列中的每個項目進行迭代。整個團隊工作流程將對每個項目執行。

**設定**

<x-field-group>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="true" data-desc="包含要迭代陣列的輸入欄位的鍵。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="可同時處理的最大項目數量。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="若為 true，處理一個項目後的輸出會被合併回來，使其可用於陣列中的後續項目。這要求並行數為 1。"></x-field>
</x-field-group>

## API 參考

### TeamAgentOptions

這些是使用 `TeamAgent.from()` 建立 `TeamAgent` 時可用的設定選項。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 的唯一名稱。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="關於 Agent 用途的描述。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="組成團隊的一組 Agent 陣列。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="ProcessMode.sequential" data-required="false" data-desc="團隊的處理模式，可以是「sequential」或「parallel」。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="用於啟用迭代式反思工作流程的設定。"></x-field>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="false" data-desc="用於批次處理時進行迭代的輸入欄位鍵。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="迭代器模式的並行等級。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="在批次處理期間，是否將一次迭代的輸出回饋給下一次迭代。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="在順序模式下，若為 true，最終輸出將包含所有中間步驟的輸出，而不僅僅是最後一個步驟的輸出。"></x-field>
</x-field-group>