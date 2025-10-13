# Team Agent

`TeamAgent` 是一種專門的 Agent，可編排一組其他 Agent (稱為「技能」) 來執行複雜的任務。它管理這些 Agent 如何協同工作，並處理它們之間的資訊流。

您可以設定 `TeamAgent` 以兩種主要方式執行其技能：
- **循序模式**：Agent 依序執行，一個 Agent 的輸出會成為下一個 Agent 的輸入。這非常適合用於建立多步驟的工作流程。
- **並行模式**：所有 Agent 使用相同的輸入同時執行，其輸出會被合併。這適用於需要一次產生多個獨立資訊片段的任務。

除了基本的編排功能，`TeamAgent` 還提供進階功能，例如：
- **迭代**：自動處理輸入陣列中的每個項目，適用於批次處理。
- **反思**：使用「審查者」Agent 來驗證並迭代修正團隊的輸出，直到符合特定標準為止，從而實現自我修正的工作流程。

這些功能的組合使 `TeamAgent` 成為一個強大的工具，可用於建構複雜、多步驟且資料密集的精密多 Agent 系統。

## 運作方式

`TeamAgent` 接收一個輸入，根據設定的模式將其傳遞給其技能 Agent 團隊，然後將結果匯總成最終輸出。下圖說明了不同的處理流程。

```d2
direction: down

Input

TeamAgent: {
  label: "Team Agent 編排"
  shape: rectangle
  style.stroke-dash: 2

  Sequential-Mode: {
    label: "循序模式"
    shape: rectangle
    style.fill: "#f0f8ff"
    Skill-A: "技能 A"
    Skill-B: "技能 B"
    Skill-C: "技能 C"
    Skill-A -> Skill-B -> Skill-C
  }

  Parallel-Mode: {
    label: "並行模式"
    shape: rectangle
    style.fill: "#f0fff0"
    Skill-X: "技能 X"
    Skill-Y: "技能 Y"
    Skill-Z: "技能 Z"
    Combine-Results: "合併結果"
    Skill-X -> Combine-Results
    Skill-Y -> Combine-Results
    Skill-Z -> Combine-Results
  }

  Advanced-Workflow: {
    label: "進階工作流程 (反思與迭代)"
    shape: rectangle
    style.fill: "#fff8f0"
    Process-Item: {
      label: "對於輸入陣列中的每個項目..."
      shape: rectangle
      style.stroke-dash: 2
      Team-Execution: "團隊執行\n(循序或並行)"
      Initial-Output: "初始輸出"
      Reviewer-Agent: "審查者 Agent"
      Meets-Criteria: {
        label: "符合標準？"
        shape: diamond
      }
      Team-Execution -> Initial-Output
      Initial-Output -> Reviewer-Agent
      Reviewer-Agent -> Meets-Criteria
      Meets-Criteria -> Team-Execution: "否，修正"
    }
  }
}

Final-Output

Input -> TeamAgent.Sequential-Mode.Skill-A: "單一輸入"
TeamAgent.Sequential-Mode.Skill-C -> Final-Output

Input -> TeamAgent.Parallel-Mode.Skill-X
Input -> TeamAgent.Parallel-Mode.Skill-Y
Input -> TeamAgent.Parallel-Mode.Skill-Z
TeamAgent.Parallel-Mode.Combine-Results -> Final-Output

Input -> TeamAgent.Advanced-Workflow.Process-Item.Team-Execution: "輸入陣列"
TeamAgent.Advanced-Workflow.Process-Item.Meets-Criteria -> Final-Output: "是"

```

## 設定

您可以使用以下選項設定 `TeamAgent`。

### 基本設定

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 的唯一識別碼。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="Agent 用途的簡要說明。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="此團隊將編排的 Agent 實例陣列。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="sequential" data-desc="處理模式。可為 `sequential` (循序執行) 或 `parallel` (同步執行)。"></x-field>
  <x-field data-name="input_schema" data-type="object" data-required="false" data-desc="定義預期輸入格式的 JSON 結構描述。"></x-field>
  <x-field data-name="output_schema" data-type="object" data-required="false" data-desc="定義預期輸出格式的 JSON 結構描述。"></x-field>
</x-field-group>

### 進階功能

<x-field-group>
    <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="啟用迭代的審查與修正流程以提高輸出品質。詳情請參閱「反思」一節。"></x-field>
    <x-field data-name="iterateOn" data-type="string" data-required="false" data-desc="要迭代的輸入欄位名稱 (必須是陣列)。團隊會個別處理陣列中的每個項目。"></x-field>
    <x-field data-name="concurrency" data-type="number" data-default="1" data-desc="使用 `iterateOn` 時，此設定可指定並行處理的最大項目數。"></x-field>
    <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-desc="若為 `true`，處理 `iterateOn` 陣列中一個項目的輸出會被合併回去，並可供下一個項目的處理使用。需要將 `concurrency` 設為 1。"></x-field>
    <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-desc="在 `sequential` 模式下，若為 `true`，則每個中間 Agent 的輸出都會包含在最終結果中，而不僅僅是最後一個。這對於偵錯很有用。"></x-field>
</x-field-group>

---

## 核心概念

### 處理模式

`mode` 屬性決定了團隊內 Agent (技能) 的執行流程。

#### 循序模式

在 `sequential` 模式下，Agent 會按照它們在 `skills` 陣列中定義的順序逐一執行。每個 Agent 的輸出會與原始輸入以及所有先前 Agent 的輸出合併，形成鏈中下一個 Agent 的輸入。

此模式非常適合用於建構每一步都基於上一步的工作流程，例如資料處理、分析和報告的流程。

**範例流程 (`sequential`)：**
1.  **Agent 1** 收到初始輸入 `{ "topic": "AI" }`。
2.  **Agent 1** 產生輸出 `{ "research": "..." }`。
3.  **Agent 2** 收到合併後的輸入 `{ "topic": "AI", "research": "..." }`。
4.  **Agent 2** 產生輸出 `{ "summary": "..." }`。
5.  最終輸出為 `{ "topic": "AI", "research": "...", "summary": "..." }`。

#### 並行模式

在 `parallel` 模式下，`skills` 陣列中的所有 Agent 會同時執行。每個 Agent 都會收到完全相同的初始輸入。然後，它們的輸出會被合併以形成最終結果。如果多個 Agent 產生具有相同鍵的輸出，系統會決定哪個 Agent「擁有」該鍵以避免衝突。

此模式對於可以同時進行多個獨立工作的任務非常高效，例如從不同來源收集資訊或對同一個資料集進行不同的分析。

**範例流程 (`parallel`)：**
1.  **Agent A** 和 **Agent B** 都收到初始輸入 `{ "company": "Initech" }`。
2.  **Agent A** 產生 `{ "financials": "..." }`。
3.  **Agent B** 產生 `{ "news": "..." }`。
4.  最終輸出是兩者的組合：`{ "financials": "...", "news": "..." }`。

### 迭代

`iterateOn` 功能可實現批次處理。透過指定一個包含陣列的輸入欄位，您可以指示 `TeamAgent` 對該陣列中的每個項目執行其完整的工作流程 (循序或並行)。

-   **`concurrency`**：您可以控制一次處理多少個項目。例如，`concurrency: 5` 將並行處理陣列中的五個項目。
-   **`iterateWithPreviousOutput`**：當設定為 `true` (且 `concurrency` 為 1) 時，處理項目 `N` 的輸出會被合併到項目 `N+1` 的資料中。這會產生一種累積效應，適用於每一步都依賴於上一步的任務，例如建構敘事或總結一系列事件。

**YAML 範例 (`iterateOn`)**
此設定會處理來自 `sections` 輸入欄位的陣列，並行數為 2。

```yaml
# sourceId: packages/core/test-agents/team.yaml
type: team
name: test-team-agent
description: Test team agent
skills:
  - sandbox.js
  - chat.yaml
mode: parallel
input_schema:
  type: object
  properties:
    sections:
      type: array
      description: Sections to iterate over
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
output_schema:
  type: object
  properties:
    sections:
      type: array
      description: Results from each section
      items:
        type: object
        properties:
          title:
            type: string
          description:
            type: string
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### 反思

反思提供了一種自我修正和品質控制的機制。啟用後，`TeamAgent` 的初始輸出會被傳遞給一個指定的 `reviewer` Agent。此審查者會根據一組標準評估輸出。

-   如果輸出被核准，流程即告結束。
-   如果輸出未被核准，審查者的回饋會被加到上下文中，而原始的 Agent 團隊會再次執行以產生修正後的輸出。

此循環會一直持續，直到輸出被核准或達到 `maxIterations` 的上限為止。

`reflection` 設定需要：
<x-field-group>
    <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="負責評估團隊輸出的 Agent。"></x-field>
    <x-field data-name="isApproved" data-type="string | (output: Message) => boolean" data-required="true" data-desc="用於判斷輸出是否被核准的條件。可以是審查者輸出中的欄位名稱 (例如 `is_complete`) 或是一個函式，核准時回傳 `true`。"></x-field>
    <x-field data-name="maxIterations" data-type="number" data-default="3" data-desc="停止前審查-修正循環的最大次數。"></x-field>
    <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-desc="若為 `true`，Agent 在達到 `maxIterations` 後即使輸出未被核准，仍會回傳最後一次產生的輸出。若為 `false`，則會拋出錯誤。"></x-field>
</x-field-group>

此功能對於需要高準確度、遵守特定格式或可由另一個 Agent 自動進行複雜驗證的任務非常強大。