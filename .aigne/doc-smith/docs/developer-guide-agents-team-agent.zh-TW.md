# Team Agent

`TeamAgent` 是一種專門的 Agent，它負責協調一組其他的 Agent（稱為「技能」）來執行複雜的任務。它扮演著管理者的角色，根據定義好的策略來引導資訊流並協調其技能的執行。這使得我們可以創建複雜的工作流程，讓多個專業的 Agent 協同合作，以達成單一 Agent 無法獨力完成的目標。

`TeamAgent` 支援幾種關鍵的 Agent 編排模式：
-   **循序執行**：Agent 依序執行，形成一個處理管線。
-   **平行執行**：Agent 同時執行，並將其結果合併。
-   **迭代處理**：團隊處理清單中的每個項目，適合批次操作。
-   **反思**：團隊的輸出會被審查並在一個循環中進行精煉，直到符合特定標準為止。

此元件是建構模組化且功能強大的人工智慧系統的基礎。關於可作為團隊一部分的個別 Agent 的詳細資訊，請參閱 [AI Agent](./developer-guide-agents-ai-agent.md) 和 [Function Agent](./developer-guide-agents-function-agent.md) 的文件。

```d2
direction: down

Team-Agent-Orchestration: {
  label: "Team Agent 編排工作流程"
  grid-columns: 2
  grid-gap: 100

  Sequential-Execution: {
    label: "循序執行 (管線)"
    shape: rectangle
    style.fill: "#f0f4f8"

    Input: { shape: oval }
    Skill-A: "技能 A"
    Skill-B: "技能 B"
    Output: { shape: oval }
  }

  Parallel-Execution: {
    label: "平行執行"
    shape: rectangle
    style.fill: "#f0f4f8"

    Input: { shape: oval }
    Skill-A: "技能 A"
    Skill-B: "技能 B"
    Merge: "合併結果"
    Output: { shape: oval }
  }

  Iterative-Processing: {
    label: "迭代處理 (批次)"
    shape: rectangle
    style.fill: "#f0f4f8"

    Input-List: { label: "輸入清單"; shape: oval }
    Process-Item: { label: "處理項目\n(使用技能)" }
    Output-List: { label: "輸出清單"; shape: oval }
  }

  Reflection: {
    label: "反思 (精煉循環)"
    shape: rectangle
    style.fill: "#f0f4f8"

    Generate-Draft: "產生草稿"
    Review: { label: "審查草稿"; shape: diamond }
    Refine-Draft: "精煉草稿"
    Final-Output: { label: "最終輸出"; shape: oval }
  }
}

# Connections
seq: Team-Agent-Orchestration.Sequential-Execution
seq.Input -> seq.Skill-A -> seq.Skill-B -> seq.Output

par: Team-Agent-Orchestration.Parallel-Execution
par.Input -> par.Skill-A
par.Input -> par.Skill-B
par.Skill-A -> par.Merge
par.Skill-B -> par.Merge
par.Merge -> par.Output

iter: Team-Agent-Orchestration.Iterative-Processing
iter.Input-List -> iter.Process-Item: "針對每個項目"
iter.Process-Item -> iter.Process-Item: "下一個項目"
iter.Process-Item -> iter.Output-List: "完成"

refl: Team-Agent-Orchestration.Reflection
refl.Generate-Draft -> refl.Review
refl.Review -> refl.Final-Output: "符合標準"
refl.Review -> refl.Refine-Draft: "需要精煉"
refl.Refine-Draft -> refl.Generate-Draft
```

## 設定

`TeamAgent` 透過一組選項進行設定，這些選項定義了其行為、執行模式以及迭代和反思等進階功能。

<x-field-group>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="組成團隊的 Agent 實例陣列。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-required="false">
    <x-field-desc markdown="Agent 的執行策略。可以是 `sequential` 或 `parallel`。"></x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="用於啟用迭代式自我修正流程的設定。"></x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown="包含陣列的輸入欄位鍵值。團隊將對陣列中的每個項目執行一次。"></x-field-desc>
  </x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false">
    <x-field-desc markdown="使用 `iterateOn` 時，此設定可指定同時處理的項目數量。"></x-field-desc>
  </x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown="若為 `true`，在 `iterateOn` 循環中處理一個項目的輸出會被合併回去，並提供給下一個項目的執行使用。這要求 `concurrency` 必須為 1。"></x-field-desc>
  </x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown="在 `sequential` 模式下，若為 `true`，則每個中介 Agent 的輸出都會包含在最終結果中，而不僅僅是最後一個。"></x-field-desc>
  </x-field>
</x-field-group>

## 執行模式

`mode` 屬性決定了團隊的基本工作流程。

### 循序模式

在 `sequential` 模式下，Agent 會依序執行。每個 Agent 的輸出會與初始輸入合併，並傳遞給序列中的下一個 Agent。這會建立一個管線，適用於需要一系列轉換或步驟的任務。

```typescript team-agent-sequential.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";
import { model } from "./model"; // 假設 model 是一個已初始化的 ChatModel

const writerAgent = new AIAgent({
  name: "writer",
  model,
  instructions: "You are a creative writer. Write a short story based on the topic: {{topic}}.",
  outputKey: "story",
});

const editorAgent = new AIAgent({
  name: "editor",
  model,
  instructions: "You are an editor. Review the following story and correct any grammatical errors: {{story}}.",
  outputKey: "editedStory",
});

const sequentialTeam = new TeamAgent({
  name: "writingTeam",
  mode: ProcessMode.sequential,
  skills: [writerAgent, editorAgent],
});

// 叫用方式：
// const result = await aigne.invoke(sequentialTeam, { topic: "a journey to the moon" });
// console.log(result.editedStory);
```

在此範例中，`writerAgent` 首先產生一個 `story`。包含 `story` 鍵值的輸出接著被傳遞給 `editorAgent`，後者利用它來產生最終的 `editedStory`。

### 平行模式

在 `parallel` 模式下，所有 Agent 會使用相同的初始輸入同時執行。它們的輸出隨後會被合併成一個單一的結果。這對於需要同時產生多個獨立資訊片段的任務非常有效率。

如果多個 Agent 嘗試寫入同一個輸出鍵值，第一個為該鍵值產生值的 Agent 將「佔有」它，而其他 Agent 後續對該鍵值的寫入將被忽略。

```typescript team-agent-parallel.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";
import { model } from "./model"; // 假設 model 是一個已初始化的 ChatModel

const researcherAgent = new AIAgent({
  name: "researcher",
  model,
  instructions: "Research the key facts about {{topic}}.",
  outputKey: "facts",
});

const summaryAgent = new AIAgent({
  name: "summarizer",
  model,
  instructions: "Provide a brief, one-paragraph summary of {{topic}}.",
  outputKey: "summary",
});

const parallelTeam = new TeamAgent({
  name: "researchTeam",
  mode: ProcessMode.parallel,
  skills: [researcherAgent, summaryAgent],
});

// 叫用方式：
// const result = await aigne.invoke(parallelTeam, { topic: "the Roman Empire" });
// console.log(result.facts);
// console.log(result.summary);
```
在此，兩個 Agent 同時開始。一旦兩個 Agent 都完成工作，最終結果將包含 `facts` 和 `summary`。

## 進階功能

### 使用 `iterateOn` 進行迭代

`iterateOn` 屬性可啟用批次處理。您需要提供一個持有陣列的輸入鍵值名稱。`TeamAgent` 接著會對該陣列中的每個項目執行其完整的工作流程。這對於使用同一組 Agent 處理多筆資料記錄非常有效。

```typescript team-agent-iteration.ts icon=logos:typescript
import { AIAgent, TeamAgent, ProcessMode } from "@aigne/core";
import { model } from "./model"; // 假設 model 是一個已初始化的 ChatModel

const translatorAgent = new AIAgent({
  name: "translator",
  model,
  instructions: "Translate the following text to French: {{text}}.",
  outputKey: "translatedText",
});

const sentimentAgent = new AIAgent({
  name: "sentiment",
  model,
  instructions: "Analyze the sentiment of the following text (positive, negative, or neutral): {{text}}.",
  outputKey: "sentiment",
});

const processingTeam = new TeamAgent({
  name: "batchProcessor",
  mode: ProcessMode.parallel,
  skills: [translatorAgent, sentimentAgent],
  iterateOn: "reviews", // 持有陣列的鍵值
});

const inputData = {
  reviews: [
    { text: "This product is amazing!" },
    { text: "I am very disappointed with the quality." },
    { text: "It works as expected." },
  ],
};

// 叫用方式：
// const result = await aigne.invoke(processingTeam, inputData);
// console.log(result.reviews);
/*
輸出會是：
[
  { translatedText: "Ce produit est incroyable !", sentiment: "positive" },
  { translatedText: "Je suis très déçu de la qualité.", sentiment: "negative" },
  { translatedText: "Cela fonctionne comme prévu.", sentiment: "neutral" }
]
*/
```

### 反思

反思提供了一種自我修正和品質保證的機制。設定後，`TeamAgent` 的輸出會被傳遞給指定的 `reviewer` Agent。審查者會根據特定標準評估輸出。如果輸出未被「核准」，整個流程會再次執行，並將前一次的輸出和審查者的回饋饋入下一次迭代。此循環會持續進行，直到輸出被核准或達到 `maxIterations` 的限制為止。

反思的設定是在 `reflection` 鍵值下提供。

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="負責評估團隊輸出的 Agent。"></x-field>
  <x-field data-name="isApproved" data-type="string | Function" data-required="true">
    <x-field-desc markdown="核准的條件。若為 `string`，則為審查者輸出中布林值欄位的名稱。若為 `function`，它會接收審查者的輸出，且必須回傳一個真值 (truthy value) 才算核准。"></x-field-desc>
  </x-field>
  <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="失敗前可執行的審查-精煉循環最大次數。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false">
    <x-field-desc markdown="若為 `true`，當達到 `maxIterations` 時，流程會回傳最後一次產生的輸出，而不是拋出錯誤。"></x-field-desc>
  </x-field>
  <x-field data-name="customErrorMessage" data-type="string" data-required="false" data-desc="當達到最大迭代次數仍未獲核准時，可拋出的自訂錯誤訊息。"></x-field-group>

```typescript team-agent-reflection.ts icon=logos:typescript
import { AIAgent, TeamAgent } from "@aigne/core";
import { model } from "./model"; // 假設 model 是一個已初始化的 ChatModel

const planGenerator = new AIAgent({
  name: "planGenerator",
  model,
  instructions: `Generate a 3-step marketing plan for a new {{product}}. 
  If you received feedback, incorporate it. Feedback: {{feedback}}`,
  outputKey: "plan",
});

const planReviewer = new AIAgent({
  name: "planReviewer",
  model,
  instructions: `Review the marketing plan: {{plan}}. 
  Does it include a budget allocation? If not, provide feedback to add one. 
  Output JSON with an 'approved' (boolean) and 'feedback' (string) field.`,
  output: {
    json: {
      schema: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          feedback: { type: "string" },
        },
      },
    },
  },
});

const reflectionTeam = new TeamAgent({
  name: "planningTeam",
  skills: [planGenerator],
  reflection: {
    reviewer: planReviewer,
    isApproved: "approved", // 檢查審查者輸出中的 'approved' 欄位
    maxIterations: 3,
  },
});

// 叫用方式：
// const result = await aigne.invoke(reflectionTeam, { product: "smart watch" });
// console.log(result.plan);
```

在此流程中，`planGenerator` 建立一個初始計畫。`planReviewer` 檢查該計畫。如果沒有提到預算，它會將 `approved` 設為 `false` 並提供回饋。`TeamAgent` 接著會重新執行 `planGenerator`，這次會包含回饋，直到計畫被核准為止。

## YAML 定義

您也可以使用 YAML 以宣告方式定義 `TeamAgent`。

```yaml team-agent-definition.yaml icon=mdi:language-yaml
type: team
name: test-team-agent
description: Test team agent
skills:
  - sandbox.js # 指向另一個 Agent 定義的路徑
  - chat.yaml
mode: parallel
iterate_on: sections
concurrency: 2
include-all-steps-output: true
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

此 YAML 定義了一個平行團隊，它會迭代一個名為 `sections` 的輸入欄位，並且還包含一個用於品質控制的反思步驟。

## 總結

`TeamAgent` 是一個功能強大的工具，用於協調多個 Agent 來解決複雜問題。透過將 Agent 組合在 `sequential` 或 `parallel` 工作流程中，並利用如 `iterateOn` 進行批次處理和 `reflection` 進行自我修正等進階功能，您可以建構出穩健且精密的 AI 應用程式。

要了解更多關於團隊組成要素的資訊，請參閱 [AI Agent](./developer-guide-agents-ai-agent.md) 和 [Function Agent](./developer-guide-agents-function-agent.md) 的文件。