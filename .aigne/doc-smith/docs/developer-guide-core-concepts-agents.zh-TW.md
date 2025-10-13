# Agent

`Agent` 類別是 AIGNE 框架的基石。它作為所有 Agent 的基底類別，為定義輸入/輸出結構、實作處理邏輯以及管理 Agent 系統內的互動提供了一個穩健的機制。

透過擴充 `Agent` 類別，您可以建立具有廣泛功能的自訂 Agent，從簡單的基於函式的工具程式到複雜的、由 AI 驅動的實體。Agent 的設計旨在使其模組化、可重複使用，並能透過訊息傳遞系統相互通訊。

```d2
direction: down

Input-Message: {
  label: "輸入訊息\n(來自 subscribeTopic)"
  shape: oval
}

Output-Message: {
  label: "輸出訊息\n(至 publishTopic)"
  shape: oval
}

Agent: {
  label: "Agent 實例"
  shape: rectangle
  style: {
    stroke-width: 3
  }

  invoke-method: {
    label: "invoke()"
    shape: rectangle
    style.fill: "#d0e0f0"
  }

  Pre-Processing: {
    label: "前處理"
    shape: rectangle
    style.stroke-dash: 2

    GuideRails-Pre: "GuideRails (前)"
    onStart-Hook: "onStart Hook"
    Input-Schema-Validation: {
      label: "輸入結構驗證\n(Zod)"
    }
  }

  process-method: {
    label: "process()\n(自訂核心邏輯)"
    shape: rectangle
    style.fill: "#e0f0d0"

    Skills: {
      label: "技能\n(其他 Agent)"
      shape: rectangle
    }
    Memory: {
      label: "記憶體"
      shape: cylinder
    }
  }

  Post-Processing: {
    label: "後處理"
    shape: rectangle
    style.stroke-dash: 2

    Output-Schema-Validation: {
      label: "輸出結構驗證\n(Zod)"
    }
    onSuccess-onError-Hooks: "onSuccess / onError Hooks"
    GuideRails-Post: "GuideRails (後)"
    onEnd-Hook: "onEnd Hook"
  }
}

FunctionAgent: {
  label: "FunctionAgent\n(簡化版 Agent)"
  shape: rectangle
}

Input-Message -> Agent.invoke-method: "1. 呼叫"

Agent.invoke-method -> Agent.Pre-Processing.GuideRails-Pre: "2. 預先驗證"
Agent.Pre-Processing.GuideRails-Pre -> Agent.Pre-Processing.onStart-Hook: "3. 觸發"
Agent.Pre-Processing.onStart-Hook -> Agent.Pre-Processing.Input-Schema-Validation: "4. 驗證輸入"
Agent.Pre-Processing.Input-Schema-Validation -> Agent.process-method: "5. 執行"

Agent.process-method -> Agent.process-method.Skills: "委派給"
Agent.process-method <-> Agent.process-method.Memory: "存取"

Agent.process-method -> Agent.Post-Processing.Output-Schema-Validation: "6. 驗證輸出"
Agent.Post-Processing.Output-Schema-Validation -> Agent.Post-Processing.onSuccess-onError-Hooks: "7. 觸發"
Agent.Post-Processing.onSuccess-onError-Hooks -> Agent.Post-Processing.GuideRails-Post: "8. 後續驗證"
Agent.Post-Processing.GuideRails-Post -> Agent.Post-Processing.onEnd-Hook: "9. 觸發"
Agent.Post-Processing.onEnd-Hook -> Output-Message: "10. 發布結果"

FunctionAgent -> Agent.process-method: "提供函式給"
```

## 核心概念

- **訊息驅動架構**：Agent 採用發布-訂閱模型運作。它們訂閱特定主題以接收輸入訊息，並將其輸出發布到其他主題，從而實現無縫的 Agent 間通訊。
- **輸入/輸出結構**：您可以使用 Zod 結構來定義 `inputSchema` 和 `outputSchema`，以確保所有流入和流出 Agent 的資料都經過驗證並符合預先定義的結構。
- **技能**：Agent 可以擁有 `skills`，也就是其他 Agent 或函式。這讓您可以建立複雜的 Agent，將任務委派給更專業的 Agent，從而促進模組化和階層式設計。
- **生命週期掛鉤 (Hooks)**：Agent 的生命週期可以透過 `hooks`（例如 `onStart`、`onEnd`、`onError`）進行攔截。Hooks 對於在 Agent 執行的各個階段進行日誌記錄、監控、追蹤和實作自訂邏輯非常有價值。
- **串流式回應**：Agent 可以以串流方式回傳回應，這對於像聊天機器人這樣的即時應用程式非常理想，因為結果可以在生成時逐步顯示。
- **GuideRails**：`guideRails` 是專門的 Agent，作為另一個 Agent 執行的驗證器或控制器。它們可以檢查輸入和預期輸出，以強制執行規則、策略或業務邏輯，甚至可以在必要時中止處理程序。
- **記憶體**：Agent 可以配備 `memory` 來持久化狀態並從過去的互動中回憶資訊，從而實現更具情境感知能力的行為。

## 主要屬性

`Agent` 類別是透過傳遞給其建構函式的 `AgentOptions` 物件進行設定。以下是一些最重要的屬性：

| 屬性 | 類型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Agent 的唯一名稱，用於識別和日誌記錄。預設為類別名稱。 |
| `description` | `string` | Agent 用途和功能的人類可讀描述。 |
| `subscribeTopic` | `string \| string[]` | Agent 監聽傳入訊息的主題。 |
| `publishTopic` | `string \| string[] \| function` | Agent 發送其輸出訊息的主題。 |
| `inputSchema` | `ZodType` | 用於驗證輸入訊息結構的 Zod 結構。 |
| `outputSchema` | `ZodType` | 用於驗證輸出訊息結構的 Zod 結構。 |
| `skills` | `(Agent \| FunctionAgentFn)[]` | 此 Agent 可調用以執行子任務的其他 Agent 或函式清單。 |
| `memory` | `MemoryAgent \| MemoryAgent[]` | 一個或多個用於儲存和擷取資訊的 Memory Agent。 |
| `hooks` | `AgentHooks[]` | 用於將自訂邏輯附加到 Agent 生命週期事件的掛鉤物件陣列。 |
| `guideRails` | `GuideRailAgent[]` | 用於驗證、轉換或控制訊息流的 GuideRail Agent 清單。 |
| `retryOnError` | `boolean \| object` | 失敗時自動重試的設定。 |

## 主要方法

### `invoke(input, options)`

這是執行 Agent 的主要方法。它接收一個 `input` 訊息和一個 `options` 物件。`invoke` 方法處理整個生命週期，包括執行掛鉤、驗證結構、執行 `process` 方法以及處理錯誤。

- **一般調用**：預設情況下，`invoke` 會回傳一個 Promise，該 Promise 會解析為最終的輸出物件。
- **串流調用**：如果您將 `options.streaming` 設定為 `true`，`invoke` 會回傳一個 `ReadableStream`，該串流會在回應區塊可用時發出它們。

**範例：一般調用**
```typescript
const result = await agent.invoke({ query: "What is AIGNE?" });
console.log(result);
```

**範例：串流調用**
```typescript
const stream = await agent.invoke(
  { query: "Tell me a story." },
  { streaming: true }
);

for await (const chunk of stream) {
  // 當每個區塊到達時進行處理
  if (chunk.delta.text) {
    process.stdout.write(chunk.delta.text.content);
  }
}
```

### `process(input, options)`

這是一個**抽象方法**，您必須在您的自訂 Agent 子類別中實作。它包含 Agent 的核心邏輯。它接收經過驗證的輸入，並負責回傳輸出。`process` 方法可以回傳一個直接的物件、一個 `ReadableStream`、一個 `AsyncGenerator`，甚至另一個 `Agent` 實例來轉移控制權。

**範例：實作 `process`**
```typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

class EchoAgent extends Agent {
  constructor() {
    super({
      name: "EchoAgent",
      description: "一個會回應輸入訊息的 Agent。",
      inputSchema: z.object({ message: z.string() }),
      outputSchema: z.object({ response: z.string() }),
    });
  }

  async process(input: { message: string }, options: AgentInvokeOptions) {
    // Agent 的核心邏輯
    return { response: `You said: ${input.message}` };
  }
}
```

### `shutdown()`

此方法會清理 Agent 使用的資源，例如主題訂閱和記憶體連線。當不再需要某個 Agent 時，呼叫此方法以防止記憶體洩漏非常重要。

## Agent 生命週期與掛鉤

Agent 的執行生命週期是一個定義明確的過程，可以使用掛鉤進行監控和修改。

1.  **`onStart`**：在 Agent 的 `process` 方法被呼叫前觸發。您可以使用此掛鉤來修改輸入或執行設定任務。
2.  **`onSkillStart` / `onSkillEnd`**：在技能（另一個 Agent）被調用前後觸發。
3.  **`onSuccess`**：在 `process` 方法成功完成且輸出已被處理後觸發。
4.  **`onError`**：如果在處理過程中發生錯誤則觸發。您可以在此處實作自訂的錯誤處理或重試邏輯。
5.  **`onEnd`**：在調用結束時觸發，無論成功或失敗。這對於清理、日誌記錄和指標收集非常理想。

**範例：使用掛鉤**
```typescript
const loggingHook = {
  onStart: async ({ agent, input }) => {
    console.log(`Agent ${agent.name} started with input:`, input);
  },
  onEnd: async ({ agent, error }) => {
    if (error) {
      console.error(`Agent ${agent.name} failed:`, error);
    } else {
      console.log(`Agent ${agent.name} finished successfully.`);
    }
  },
};

const agent = new MyAgent({
  hooks: [loggingHook],
});
```

## `FunctionAgent`

對於較簡單的使用案例，AIGNE 提供了 `FunctionAgent` 類別。它讓您可以從單一函式建立一個 Agent，從而無需建立一個擴充 `Agent` 的新類別。這非常適合用於建立簡單、無狀態的工具型 Agent。

**範例：建立 `FunctionAgent`**
```typescript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const multiplierAgent = new FunctionAgent({
  name: "Multiplier",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  outputSchema: z.object({ result: z.number() }),
  process: async (input) => {
    return { result: input.a * input.b };
  },
});

const result = await multiplierAgent.invoke({ a: 5, b: 10 });
console.log(result); // { result: 50 }
```