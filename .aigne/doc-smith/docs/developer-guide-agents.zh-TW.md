# TeamAgent

TeamAgent 協調一組 Agent 共同合作以完成任務。它管理一系列 Agent (其技能) 並根據指定的處理模式來編排其執行。這使得可以建立多個 Agent 協作的複雜工作流程。

TeamAgent 特別適用於：
- 建立一個 Agent 的輸出作為另一個 Agent 輸入的 Agent 工作流程。
- 同時執行多個 Agent 並合併其結果。
- 建立由專業化元件協同工作的複雜 Agent 系統。
- 使用反思機制實現迭代、自我修正的工作流程。
- 透過定義的 Agent 管線批次處理資料項目。

## 運作方式

`TeamAgent` 根據定義的 `ProcessMode`，將輸入路由至其成員 Agent (技能) 進行處理。它可以循序、並行運作，或使用迭代的反思過程來優化結果。下圖說明了高層次的處理邏輯。

```d2
direction: down

Input: { shape: oval; label: "輸入" }

Mode-Selection: {
  label: "處理模式？"
  shape: diamond
}

Sequential-Execution: {
  label: "循序執行"
  Agent-1: "Agent 1"
  Agent-2: "Agent 2"
  Agent-N: "..."
  Agent-1 -> Agent-2 -> Agent-N
}

Parallel-Execution: {
  label: "並行執行"
  p-agent-1: "Agent 1"
  p-agent-2: "Agent 2"
  p-agent-n: "..."
}

Combine-Results: "合併結果"

Reflection-Check: {
  label: "反思？"
  shape: diamond
}

Reviewer: {
  label: "審查者 Agent"
}

Approval-Check: {
  label: "已核准？"
  shape: diamond
}

Output: { shape: oval; label: "輸出" }

Input -> Mode-Selection

Mode-Selection -> Sequential-Execution: "循序"
Mode-Selection -> Parallel-Execution: "並行"

Sequential-Execution.Agent-N -> Reflection-Check
Parallel-Execution -> Combine-Results
Combine-Results -> Reflection-Check

Reflection-Check -> Output: "否"
Reflection-Check -> Reviewer: "是"

Reviewer -> Approval-Check
Approval-Check -> Output: "是"
Approval-Check -> Mode-Selection: "否 (回饋與重試)" {
  style.stroke-dash: 2
}
```

## 關鍵概念

### 處理模式

`TeamAgentOptions` 中的 `mode` 屬性決定了團隊中 Agent 的執行方式。

- **`ProcessMode.sequential`**：Agent 會按照提供的順序逐一處理。每個 Agent 的輸出會被合併並作為序列中下一個 Agent 的輸入。這對於建立多步驟管線非常有用。
- **`ProcessMode.parallel`**：所有 Agent 會同時處理，每個 Agent 都會接收到相同的初始輸入。最終輸出是所有 Agent 結果的組合。這非常適合可以劃分為獨立子任務的任務。

### 反思模式

反思模式啟用了一個迭代優化和驗證的工作流程。配置後，團隊的輸出會傳遞給一個 `reviewer` Agent。審查者會根據特定條件 (`isApproved`) 評估輸出。如果輸出未獲核准，流程將重複，將先前的輸出和審查者的回饋重新送回團隊進行另一次迭代。這個循環會一直持續，直到輸出被核准或達到 `maxIterations` 的上限。

這對於需要品質控制、自我修正或迭代改進的任務非常強大。

### 迭代處理 (`iterateOn`)

`iterateOn` 選項允許 `TeamAgent` 以類似批次的方式處理項目陣列。您指定一個包含陣列的輸入鍵，團隊將對該陣列中的每個項目執行其工作流程。這對於需要對多個資料項目應用相同操作集的批次處理情境非常高效。您可以使用 `concurrency` 選項來控制並行程度。

## 建立 TeamAgent

您可以使用 `TeamAgent.from()` 靜態方法來建立一個 `TeamAgent`，並提供一組技能 (其他 Agent) 和配置選項。

### 循序模式範例

在此範例中，一個 `translator` Agent 的輸出會直接輸入到一個 `sentiment` Agent。

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 將文字翻譯成英文的 Agent
const translator = new AIAgent({
  name: "Translator",
  model,
  instructions: "Translate the following text to English.",
  inputKey: "text",
  outputKey: "translated_text",
});

// 分析文字情感的 Agent
const sentiment = new AIAgent({
  name: "SentimentAnalyzer",
  model,
  instructions: "Analyze the sentiment of the following text. Is it positive, negative, or neutral?",
  inputKey: "translated_text",
  outputKey: "sentiment",
});

// 一個循序團隊，其中翻譯在情感分析之前進行
const sequentialTeam = TeamAgent.from({
  name: "SequentialTranslatorTeam",

  // Agent (技能) 將按此順序執行
  skills: [translator, sentiment],
  
  // 將模式設定為循序
  mode: ProcessMode.sequential, 
});

const result = await sequentialTeam.invoke({
  text: "Me encanta este producto, es fantástico.",
});

console.log(result);
// 預期輸出：
// {
//   translated_text: "I love this product, it's fantastic.",
//   sentiment: "positive" 
// }
```

### 並行模式範例

在這裡，兩個獨立的 Agent 同時執行，以從相同的輸入文字中收集不同的資訊。

```typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";

// 提取主要主題的 Agent
const topicExtractor = new AIAgent({
  name: "TopicExtractor",
  model,
  instructions: "Identify the main topic of the text.",
  inputKey: "text",
  outputKey: "topic",
});

// 總結文字的 Agent
const summarizer = new AIAgent({
  name: "Summarizer",
  model,
  instructions: "Provide a one-sentence summary of the text.",
  inputKey: "text",
  outputKey: "summary",
});

// 一個並行團隊，其中兩個 Agent 同時執行
const parallelTeam = TeamAgent.from({
  name: "ParallelAnalysisTeam",
  skills: [topicExtractor, summarizer],
  mode: ProcessMode.parallel, // 將模式設定為並行
});

const result = await parallelTeam.invoke({
  text: "The new AI model shows remarkable improvements in natural language understanding and can be applied to various industries, from healthcare to finance.",
});

console.log(result);
// 預期輸出：
// {
//   topic: "AI Model Improvements",
//   summary: "A new AI model has significantly advanced in natural language understanding, with broad industry applications."
// }
```

### 反思模式範例

此範例展示了一個 `writer` Agent 產生內容，以及一個 `reviewer` Agent 檢查內容是否符合特定的字數要求。團隊將重複執行，直到滿足條件為止。

```typescript
import { AIAgent, TeamAgent, FunctionAgent } from "@aigne/core";
import { z } from "zod";

const writer = new AIAgent({
  name: "Writer",
  model,
  instructions: "Write a short paragraph about the benefits of teamwork. If you receive feedback, use it to revise the text.",
  inputKey: "request",
  outputKey: "paragraph",
});

const reviewer = new FunctionAgent({
  name: "Reviewer",
  inputSchema: z.object({ paragraph: z.string() }),
  outputSchema: z.object({
    approved: z.boolean(),
    feedback: z.string().optional(),
  }),
  process: ({ paragraph }) => {
    if (paragraph.split(" ").length >= 50) {
      return { approved: true };
    } else {
      return {
        approved: false,
        feedback: "The paragraph is too short. Please expand it to at least 50 words.",
      };
    }
  },
});

const reflectionTeam = TeamAgent.from({
  name: "ReflectiveWriterTeam",
  skills: [writer],
  reflection: {
    reviewer: reviewer,
    isApproved: "approved", // 檢查審查者輸出中的 'approved' 欄位
    maxIterations: 3,
  },
});

const result = await reflectionTeam.invoke({
  request: "Write about teamwork.",
});

console.log(result);
// 輸出將是一段關於團隊合作且至少 50 個字的段落。
```

## 配置選項 (`TeamAgentOptions`)

`TeamAgent` 可以使用以下選項進行配置：

<x-field-group>
  <x-field data-name="mode" data-type="ProcessMode" data-required="false" data-desc="Agent 的處理模式。可以是 `ProcessMode.sequential` 或 `ProcessMode.parallel`。預設為 `sequential`。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="組成團隊的 Agent 實例陣列。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="反思模式的配置，可啟用迭代審查和優化。">
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="負責審查團隊輸出的 Agent。"></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="一個函式或審查者輸出中布林值欄位的名稱，用於確定結果是否被核准。"></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="在停止前，審查-優化迭代的最大次數。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="若為 true，則在達到最大迭代次數時返回最後一次的輸出，即使未獲核准。否則，將拋出錯誤。"></x-field>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="包含陣列的輸入欄位的鍵。團隊將對陣列中的每個項目執行其工作流程。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="使用 `iterateOn` 時的最大並行操作數。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="若為 true，則迭代的輸出將合併回項目中，使其可用於後續迭代。僅在 `concurrency` 為 1 時有效。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="在循序模式下，若為 true，輸出流將包含所有中間步驟的區塊，而不僅僅是最終步驟的區塊。"></x-field>
</x-field-group>