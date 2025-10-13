# Agent 掛鉤

Agent 掛鉤提供了一種強大的機制，讓您能介入 Agent 的執行生命週期。它們允許您在關鍵節點——例如 Agent 啟動前、成功後或發生錯誤時——插入自訂邏輯，而無需修改 Agent 的核心實作。這使得掛鉤成為實現日誌記錄、監控、追蹤、修改輸入/輸出以及實作自訂錯誤處理策略的理想選擇。

## 核心概念

### 生命週期事件

您可以將自訂邏輯附加到 Agent 的各種生命週期事件上。每個掛鉤在執行過程中的特定時間點被觸發，並接收相關的上下文，例如輸入、輸出或錯誤。

以下是可用的生命週期掛鉤：

| 掛鉤 | 觸發時機 | 目的 |
| :------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onStart` | 在 Agent 的 `process` 方法被呼叫前。 | 對輸入進行預處理或驗證、記錄執行的開始，或設定所需資源。它可以在 Agent 接收輸入前對其進行修改。 |
| `onSuccess` | 在 Agent 的 `process` 方法成功完成後。 | 對輸出進行後處理或驗證、記錄成功結果，或執行清理工作。它可以修改最終的輸出。 |
| `onError` | 在 Agent 執行期間拋出錯誤時。 | 記錄錯誤、發送通知，或實作自訂的重試邏輯。它可以向 Agent 發出重試操作的訊號。 |
| `onEnd` | 在 `onSuccess` 或 `onError` 被呼叫後。 | 無論結果如何，都執行清理操作，例如關閉連線或釋放資源。它也可以修改最終輸出或觸發重試。 |
| `onSkillStart` | 在目前 Agent 呼叫一個技能（一個子 Agent）之前。 | 攔截並記錄技能的呼叫，或修改傳遞給技能的輸入。 |
| `onSkillEnd` | 在一個技能完成其執行（無論成功與否）後。 | 記錄技能的結果或錯誤、執行特定於該技能的清理工作，或處理特定於技能的錯誤。 |
| `onHandoff` | 當一個 Agent 將控制權轉移給另一個 Agent 時。 | 在多 Agent 系統中追蹤控制流，並監控任務如何在 Agent 之間委派。 |

### 掛鉤優先級

可以為掛鉤指定一個 `priority`，以在為同一事件註冊了多個掛鉤時控制它們的執行順序。這對於確保某些掛鉤（如身份驗證或驗證）在其他掛鉤之前執行非常有用。

可用的優先級別為：
- `high`
- `medium`
- `low` (預設)

掛鉤會按照從 `high` 到 `low` 的優先級順序執行。這是由 `sortHooks` 工具程式處理的，確保了可預測的執行序列。

```typescript
// 來源：packages/core/src/utils/agent-utils.ts
const priorities: NonNullable<AgentHooks["priority"]>[] = ["high", "medium", "low"];

export function sortHooks(hooks: AgentHooks[]): AgentHooks[] {
  return hooks
    .slice(0)
    .sort(({ priority: a = "low" }, { priority: b = "low" }) =>
      a === b ? 0 : priorities.indexOf(a) - priorities.indexOf(b),
    );
}
```

## 實作掛鉤

掛鉤可以透過兩種方式實作：作為簡單的回呼函式，或作為獨立、可重用的 `Agent` 實例。

### 1. 函式掛鉤

對於直接的邏輯，您可以直接在 `AgentOptions` 物件中將掛鉤定義為一個函式。這是使用掛鉤最常見和最直接的方式。

**範例：一個簡單的日誌記錄掛鉤**

此範例展示了一個基本的掛鉤，用於記錄 Agent 執行的開始和結束。

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // 假設 agent.ts 的路徑

// 定義一個日誌記錄掛鉤物件
const loggingHook = {
  priority: "high",
  onStart: ({ agent, input }) => {
    console.log(`[INFO] Agent '${agent.name}' started with input:`, JSON.stringify(input));
  },
  onEnd: ({ agent, output, error }) => {
    if (error) {
      console.error(`[ERROR] Agent '${agent.name}' failed with error:`, error.message);
    } else {
      console.log(`[INFO] Agent '${agent.name}' succeeded with output:`, JSON.stringify(output));
    }
  }
};

// 建立一個新的 Agent 並附加掛鉤
const myAgent = new Agent({
  name: "DataProcessor",
  hooks: [loggingHook],
  // ... 其他 Agent 選項
});
```

### 2. Agent 掛鉤

對於更複雜或可重用的邏輯，您可以將掛鉤實作為其自身的 `Agent`。這允許您封裝掛鉤邏輯、管理其狀態，並在多個 Agent 之間重用它。掛鉤 Agent 的輸入將是事件的負載（例如 `{ agent, input, error }`）。

**範例：一個基於 Agent 的錯誤處理器**

在這裡，`ErrorHandlingAgent` 是一個被設計用來作為 `onError` 掛鉤的 Agent。它可以包含向監控服務發送警報的邏輯。

```typescript
import { FunctionAgent, Agent, Message } from "./agent"; // 假設 agent.ts 的路徑

// 一個透過發送警報來處理錯誤的 Agent
const errorHandlingAgent = new FunctionAgent({
  name: "ErrorAlerter",
  process: async ({ agent, error }) => {
    console.log(`Alert! Agent ${agent.name} encountered an error: ${error.message}`);
    // 在實際情境中，您可能會在這裡呼叫一個外部監控 API。
  }
});

// 一個可能會失敗的 Agent
class RiskyAgent extends Agent<{ command: string }, { result: string }> {
  async process(input) {
    if (input.command === "fail") {
      throw new Error("This operation was designed to fail.");
    }
    return { result: "Success!" };
  }
}

// 將錯誤處理 Agent 作為掛鉤附加
const riskyAgent = new RiskyAgent({
  name: "RiskyOperation",
  hooks: [
    {
      onError: errorHandlingAgent,
    }
  ],
});
```

## 修改執行流程

掛鉤不僅用於觀察；它們還可以主動修改 Agent 的執行流程。

- **修改輸入**：一個 `onStart` 掛鉤可以回傳一個帶有新 `input` 屬性的物件，這將取代傳遞給 Agent 的 `process` 方法的原始輸入。
- **修改輸出**：一個 `onSuccess` 或 `onEnd` 掛鉤可以回傳一個帶有新 `output` 屬性的物件，這將取代 Agent 的原始結果。
- **觸發重試**：一個 `onError` 或 `onEnd` 掛鉤可以回傳 `{ retry: true }` 來指示 Agent 重新執行其 `process` 方法。這對於處理暫時性錯誤很有用。

**範例：輸入轉換與重試邏輯**

```typescript
import { Agent, AgentOptions, Message } from "./agent"; // 假設 agent.ts 的路徑

const transformationAndRetryHook = {
  onStart: ({ input }) => {
    // 在處理前將輸入標準化
    const transformedInput = { ...input, data: input.data.toLowerCase() };
    return { input: transformedInput };
  },
  onError: ({ error }) => {
    // 遇到網路錯誤時重試
    if (error.message.includes("network")) {
      console.log("Network error detected. Retrying...");
      return { retry: true };
    }
  }
};

const myAgent = new Agent({
  name: "NetworkAgent",
  hooks: [transformationAndRetryHook],
  // ... 其他 Agent 選項
});
```

## 宣告式設定 (YAML)

掛鉤也可以在 YAML 設定檔中以宣告方式定義，這在使用 AIGNE CLI 時特別有用。您可以內嵌定義掛鉤或從其他檔案中引用它們。

**來自 `test-agent-with-hooks.yaml` 的範例**

此範例展示了一個團隊 Agent，它使用了多種掛鉤，包括一個內嵌的 AI Agent 和在外部檔案（`test-hooks.yaml`）中定義的掛鉤。

```yaml
# 來源：packages/core/test-agents/test-agent-with-hooks.yaml
type: team
name: test_agent_with_default_input
hooks:
  priority: high
  on_start:
    type: ai
    name: test_hooks_inline # 一個作為掛鉤的內嵌 Agent
  on_success: test-hooks.yaml # 引用外部掛鉤定義
  on_error: test-hooks.yaml
  on_end: test-hooks.yaml
  on_skill_start: test-hooks.yaml
  on_skill_end: test-hooks.yaml
  on_handoff: test-hooks.yaml
skills:
  - url: ./test-agent-with-default-input-skill.yaml
    hooks:
      # 掛鉤也可以附加到特定的技能上
      on_start: test-hooks.yaml
  - type: ai
    name: test_agent_with_default_input_skill2.yaml
    hooks:
      on_start: test-hooks.yaml
```

這種宣告式方法允許關注點的清晰分離，其中 Agent 的邏輯與日誌記錄、安全性和錯誤處理等橫切關注點解耦。