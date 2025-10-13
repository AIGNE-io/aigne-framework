本文件為 `TeamAgent` 類別提供了一份詳細指南，這是一個用於協調多個 Agent 協同工作的強大元件。文件內容涵蓋其設定、處理模式，以及如「反射 (reflection)」和「迭代 (iteration)」等特殊功能。

### 總覽

`TeamAgent` 負責協調一組 Agent（稱為「技能 (skills)」）來完成複雜的任務。它根據指定的處理模式管理這些 Agent 的執行，讓它們能以循序（一個接一個）或並行（一次全部）的方式工作。這對於建立複雜的工作流程特別有用，例如一個 Agent 的輸出可作為另一個 Agent 的輸入，或當需要同時執行多個任務以整合其結果時。

### 設定 (`TeamAgentOptions`)

要建立一個 `TeamAgent`，您需要向其建構函式提供一個 `TeamAgentOptions` 物件。這些選項可讓您自訂團隊的行為。

| 參數 | 類型 | 描述 | 預設值 |
| --- | --- | --- | --- |
| `mode` | `ProcessMode` | 處理團隊中 Agent 的方法。可以是 `sequential` 或 `parallel`。 | `sequential` |
| `reflection` | `ReflectionMode` | 用於啟用團隊輸出的迭代式審查和精煉過程的設定。 | `undefined` |
| `iterateOn` | `string` | 包含陣列的輸入欄位鍵值。團隊將對該陣列中的每個項目進行迭代處理。 | `undefined` |
| `concurrency` | `number` | 使用 `iterateOn` 時的最大並行操作數。 | `1` |
| `iterateWithPreviousOutput` | `boolean` | 若為 `true`，一次迭代的輸出會被合併回下一次迭代的輸入中。需要將 `concurrency` 設為 `1`。 | `false` |
| `includeAllStepsOutput` | `boolean` | 在循序模式下若為 `true`，所有中繼步驟的輸出都將包含在最終結果中。 | `false` |

### 處理模式

`ProcessMode` 列舉決定了團隊中 Agent 的執行方式。

#### `sequential`
在此模式下，Agent 會被逐一處理。每個 Agent 的輸出會作為額外輸入傳遞給序列中的下一個 Agent。這是預設模式，非常適合用於建立線性的工作流程。

#### `parallel`
在此模式下，所有 Agent 會同時處理。每個 Agent 都會收到相同的初始輸入，其輸出會被合併。此模式適用於可獨立執行然後再結合成果的任務。

### 主要功能

#### 反射模式
反射模式提供了一種對團隊輸出進行迭代式自我修正與精煉的機制。啟用後，指定的 `reviewer` Agent 會評估團隊的結果。若輸出未獲核准，此過程將會重複，並使用前一次的輸出和 reviewer 的回饋作為下一次迭代的脈絡。此循環將持續進行，直到輸出被核准或達到 `maxIterations` 的上限為止。

**設定 (`ReflectionMode`)**

| 參數 | 類型 | 描述 |
| --- | --- | --- |
| `reviewer` | `Agent` | 負責審查團隊輸出並提供回饋的 Agent。 |
| `isApproved` | `((output: Message) => PromiseOrValue<boolean \| unknown>) \| string` | 一個函式或 reviewer 輸出中的欄位名稱，用於判斷結果是否被核准。真值 (truthy value) 表示核准。 |
| `maxIterations` | `number` | 停止前的最大審查迭代次數。預設為 `3`。 |
| `returnLastOnMaxIterations` | `boolean` | 若為 `true`，當達到 `maxIterations` 時，即使未被核准，Agent 也會回傳最後一次產生的輸出。若為 `false`，則會拋出錯誤。預設為 `false`。 |

**範例 (`team-agent-with-reflection.yaml`)**
```yaml
type: team
name: test-team-agent-with-reflection
description: Test team agent with reflection
skills:
  - chat.yaml
reflection:
  reviewer: team-agent-reviewer.yaml
  is_approved: approved
  max_iterations: 5
  return_last_on_max_iterations: true
```

#### 迭代 (`iterateOn`)

`iterateOn` 功能讓 `TeamAgent` 能對輸入訊息中的陣列進行批次處理。當您透過 `iterateOn` 指定一個輸入欄位鍵值時，Agent 會迭代處理該陣列中的每個元素，讓每個元素都單獨通過團隊的工作流程。

這對於需要將同一組操作應用於多個資料項目的情境非常有效，例如處理文件的各個章節、分析使用者評論列表或豐富化資料集。

**範例 (`team.yaml`)**
此範例展示了一個設定為對 `sections` 陣列進行迭代的團隊 Agent。

```yaml
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
        # ... item properties
iterate_on: sections
concurrency: 2
iterate-with-previous-output: false
include-all-steps-output: true
```

### 方法

#### `constructor(options: TeamAgentOptions<I, O>)`
建立一個新的 `TeamAgent` 執行個體。

-   **參數：**
    -   `options`：團隊 Agent 的設定選項。

#### `process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>`
根據設定的 `mode`，將輸入訊息路由至團隊中的 Agent 進行處理。

-   **參數：**
    -   `input`：要處理的訊息。
    -   `options`：調用選項。
-   **回傳值：** 組成最終回應的訊息區塊串流。

### 範例

以下是建立 `TeamAgent` 的範例。

**循序 TeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agent1 = new Agent({ /* ... */ });
const agent2 = new Agent({ /* ... */ });

const sequentialTeam = TeamAgent.from({
  skills: [agent1, agent2],
  mode: ProcessMode.sequential,
});
```

**並行 TeamAgent**
```typescript
import { TeamAgent, ProcessMode } from "./team-agent";
import { Agent } from "./agent";

const agentA = new Agent({ /* ... */ });
const agentB = new Agent({ /* ... */ });

const parallelTeam = TeamAgent.from({
  skills: [agentA, agentB],
  mode: ProcessMode.parallel,
});
```