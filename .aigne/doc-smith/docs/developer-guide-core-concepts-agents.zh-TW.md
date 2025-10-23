# Agents

在 AIGNE 框架中，**`Agent`** 是工作的基本單位。它是一個抽象類別，為所有專門的 Agent 類型建立了一個標準契約。一個 Agent 可以被概念化為一個能夠執行特定任務、處理資訊以及與系統中其他 Agent 互動的獨立工作者。

每一個專門的 Agent，無論是設計用於與 AI 模型互動、轉換資料，還是協調一組其他 Agent，都從這個基礎的 `Agent` 類別繼承其核心結構和行為。這個架構原則確保了整個框架的一致性和可預測性。

有關專門 Agent 類型的更多資訊，請參閱 [Agent 類型](./developer-guide-agents.md) 一節。

## 核心概念

`Agent` 類別圍繞著幾個核心概念設計，這些概念定義了其身份、資料契約和操作行為。這些是在 Agent 實例化期間透過 `AgentOptions` 物件進行設定的。

### 關鍵屬性

以下屬性定義了 Agent 的設定：

| 屬性 | 類型 | 說明 |
| :--- | :--- | :--- |
| `name` | `string` | Agent 的唯一識別碼，用於日誌記錄和引用。如果未指定，則預設為建構函式的類別名稱。 |
| `description` | `string` | 對 Agent 的目的和功能的人類可讀摘要，有助於文件編寫和除錯。 |
| `inputSchema` | `ZodType` | 一個 Zod 結構，定義了 Agent 輸入資料的結構和驗證規則。這確保了資料的完整性。 |
| `outputSchema` | `ZodType` | 一個 Zod 結構，定義了 Agent 輸出資料的結構和驗證規則。 |
| `skills` | `Agent[]` | 此 Agent 可調用以執行委派子任務的其他 Agent 列表，從而實現組合行為。 |
| `memory` | `MemoryAgent` | 一個可選的記憶體單元，允許 Agent 在多次互動中持久化和回憶狀態。 |
| `hooks` | `AgentHooks[]` | 一組生命週期掛鉤（例如 `onStart`、`onEnd`），用於在執行期間觀察或修改 Agent 的行為。 |
| `guideRails` | `GuideRailAgent[]` | 一個專門的 Agent 列表，用於對 Agent 的輸入和輸出強制執行規則、策略或約束。 |

### process 方法

`process` 方法是每個 Agent 的核心元件。它在基礎的 `Agent` 類別中被定義為一個 `abstract` 方法，這強制任何具體的 Agent 類別都必須提供實作。此方法包含定義 Agent 功能的核心邏輯。

該方法接收經過驗證的輸入訊息和調用選項（包括執行 `Context`），並負責產生輸出。

```typescript Agent.ts icon=logos:typescript
export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ... constructor and other properties

  /**
   * Agent 的核心處理方法，必須在子類別中實作
   *
   * @param input 輸入訊息
   * @param options Agent 調用選項
   * @returns 處理結果
   */
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;

  // ... other methods
}
```

返回值 `AgentProcessResult` 可以是一個直接的物件、一個串流回應、一個非同步產生器，或是另一個用於任務轉發的 Agent 實例。

## Agent 生命週期

Agent 的執行遵循一個結構化的生命週期，該生命週期透過掛鉤提供了清晰的擴展點。

```d2
direction: down

Agent-Lifecycle: {
  label: "Agent 執行生命週期"
  style: {
    stroke-dash: 4
  }

  invoke: {
    label: "1. invoke(input)"
    shape: oval
  }

  on-start: {
    label: "2. onStart 掛鉤"
    shape: rectangle
  }

  input-validation: {
    label: "3. 輸入有效？"
    shape: diamond
  }

  process: {
    label: "4. process(input)"
    shape: rectangle
    style.fill: "#e6f7ff"
  }

  output-validation: {
    label: "5. 輸出有效？"
    shape: diamond
  }

  on-end: {
    label: "6. onEnd 掛鉤\n(處理成功或錯誤)"
    shape: rectangle
  }

  return-value: {
    label: "7. 返回輸出或拋出錯誤"
    shape: oval
  }
}

Agent-Lifecycle.invoke -> Agent-Lifecycle.on-start
Agent-Lifecycle.on-start -> Agent-Lifecycle.input-validation
Agent-Lifecycle.input-validation -> Agent-Lifecycle.process: "是"
Agent-Lifecycle.process -> Agent-Lifecycle.output-validation
Agent-Lifecycle.output-validation -> Agent-Lifecycle.on-end: "是"
Agent-Lifecycle.on-end -> Agent-Lifecycle.return-value
Agent-Lifecycle.input-validation -> Agent-Lifecycle.on-end: "否"
Agent-Lifecycle.output-validation -> Agent-Lifecycle.on-end: "否"
```

1.  **調用**：透過使用輸入負載呼叫其 `invoke()` 方法來啟動 Agent 的執行。
2.  **`onStart` 掛鉤**：觸發 `onStart` 掛鉤，為預處理邏輯（如日誌記錄或輸入轉換）提供機會。
3.  **輸入驗證**：輸入資料會根據 Agent 的 `inputSchema` 自動進行驗證。如果驗證失敗，則中止該過程。
4.  **`process()` 執行**：執行在 Agent 的 `process()` 方法中定義的核心邏輯。
5.  **輸出驗證**：來自 `process()` 方法的結果會根據 Agent 的 `outputSchema` 進行驗證。
6.  **`onEnd` 掛鉤**：使用最終輸出或發生的任何錯誤來觸發 `onEnd` 掛鉤。這是後處理、記錄結果或實作自訂失敗處理的指定點。
7.  **返回值**：最終經過驗證的輸出會返回給原始呼叫者。

這個系統化的生命週期確保資料得到一致的驗證，並為自訂邏輯提供了清晰、非侵入性的擴展點。

## 實作範例

要建立一個功能性的 Agent，請擴展基礎的 `Agent` 類別並實作 `process` 方法。以下範例定義了一個 Agent，它接受兩個數字並返回它們的總和。

```typescript title="adder-agent.ts" icon=logos:typescript
import { Agent, type AgentInvokeOptions, type Message } from "@aigne/core";
import { z } from "zod";

// 1. 使用 Zod 定義輸入和輸出結構以進行驗證。
const inputSchema = z.object({
  a: z.number(),
  b: z.number(),
});

const outputSchema = z.object({
  sum: z.number(),
});

// 2. 從 Zod 結構中推斷出 TypeScript 類型。
type AddAgentInput = z.infer<typeof inputSchema>;
type AddAgentOutput = z.infer<typeof outputSchema>;

// 3. 透過擴展 Agent 建立自訂的 Agent 類別。
export class AddAgent extends Agent<AddAgentInput, AddAgentOutput> {
  constructor() {
    super({
      name: "AddAgent",
      description: "An agent that adds two numbers.",
      inputSchema,
      outputSchema,
    });
  }

  // 4. 在 process 方法中實作核心邏輯。
  async process(input: AddAgentInput, options: AgentInvokeOptions): Promise<AddAgentOutput> {
    const { a, b } = input;
    const sum = a + b;
    return { sum };
  }
}
```

此範例說明了標準的實作模式：
1.  為輸入和輸出資料結構定義 Zod 結構。
2.  使用對應的輸入和輸出類型擴展 `Agent` 類別。
3.  將結構和其他元資料提供給 `super()` 建構函式。
4.  在 `process` 方法中實作 Agent 的特定邏輯。

## 總結

`Agent` 類別是 AIGNE 框架中的基礎抽象。它為所有操作單元提供了一致且穩健的契約，確保它們是可識別的、遵守清晰的資料結構，並遵循可預測的執行生命週期。透過抽象化這個通用機制，該框架允許開發者專注於在 `process` 方法中實作其任務所需的獨特邏輯。

有關 Agent 如何由中央引擎執行和管理的詳細資訊，請參閱 [AIGNE](./developer-guide-core-concepts-aigne-engine.md) 文件。要探索各種可用的專門 Agent 實作，請參閱 [Agent 類型](./developer-guide-agents.md) 一節。