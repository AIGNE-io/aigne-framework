本文件為開發者提供一份關於 AIGNE 框架核心概念的指南。本文件說明了基本的建構模塊、它們的互動方式以及整體架構，讓工程師能夠有效地建構並與該系統整合。

### AIGNE 框架的核心概念

AIGNE 框架圍繞一個核心元件設計：**Agent**。理解 Agent 及其相關概念是充分利用該平台全部功能的關鍵。本指南將引導您了解基本的建構模塊，從 Agent 的生命週期到其強大的組合功能，如 Skills 和 Memory。

### 什麼是 Agent？

Agent 是 AIGNE 生態系中的基本執行者。它是一個自主實體，旨在透過處理輸入、做出決策並產生結構化輸出來執行特定任務。每個 Agent 都封裝了自己的邏輯、設定和能力。

所有 Agent 的基礎是 `Agent` 類別，定義於 `packages/core/src/agents/agent.ts`。它提供了以下核心結構：

-   **輸入和輸出結構 (Input and Output Schemas)**：使用 Zod schemas (`inputSchema`, `outputSchema`) 來確保資料的完整性。
-   **核心處理邏輯**：抽象的 `process` 方法，必須由子類別實現以定義 Agent 的獨特行為。
-   **生命週期掛鉤 (Lifecycle Hooks)**：一種在 Agent 執行的各個階段（例如 `onStart`、`onEnd`）攔截並新增功能的機制。
-   **Skills 和 Memory**：用於組合複雜行為和維持狀態的功能。

```typescript
// packages/core/src/agents/agent.ts

export abstract class Agent<I extends Message = any, O extends Message = any> {
  // ...
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;
  // ...
}
```

### Agent 生命週期

每個 Agent 在被調用時都會遵循一個明確定義的生命週期。此生命週期確保了執行、驗證和可觀察性的一致性。`invoke` 方法是啟動此流程的進入點。

以下是說明 Agent 生命週期關鍵階段的圖表：

```d2
direction: down

invoke: {
  label: "invoke()"
  shape: oval
}

onStart: {
  label: "onStart 掛鉤"
  shape: rectangle
}

validateInput: {
  label: "驗證輸入\n(inputSchema)"
  shape: diamond
}

process: {
  label: "process() 方法\n(核心邏輯)"
  shape: rectangle
}

validateOutput: {
  label: "驗證輸出\n(outputSchema)"
  shape: diamond
}

onEnd: {
  label: "onEnd 掛鉤"
  shape: rectangle
}

returnResult: {
  label: "回傳結果"
  shape: oval
}

returnError: {
  label: "回傳錯誤"
  shape: oval
}

invoke -> onStart
onStart -> validateInput
validateInput -> process: "有效"
validateInput -> returnError: "無效"
process -> validateOutput
validateOutput -> onEnd: "有效"
validateOutput -> returnError: "無效"
onEnd -> returnResult
```

### Agent 的特化類型

AIGNE 框架提供了幾種專門的 Agent 類型，每種類型都為特定目的量身打造。這些類型定義在 `packages/core/src/loader/agent-yaml.ts` 中，通常由 YAML 設定檔中的 `type` 屬性指定。

-   **AI Agent (`type: "ai"`)**：最常見的類型，設計用於與大型語言模型 (LLMs) 互動。它使用 `PromptBuilder` 從指令、輸入、記憶體和可用的技能 (工具) 來建構詳細的提示，然後處理模型的回應。
-   **Team Agent (`type: "team"`)**：作為一組其他 Agent (技能) 的協調器或管理器。它可以循序、平行地處理輸入，或執行如「反思」(reflection) 等更複雜的工作流程，其中一個 Agent 會審查另一個 Agent 的工作。
-   **Function Agent (`type: "function"`)**：一個輕量級的包裝器，可將任何 JavaScript/TypeScript 函數轉換為 Agent。這非常適合將自訂的商業邏輯、計算或第三方 API 調用直接整合到 Agent 生態系中。
-   **Transform Agent (`type: "transform"`)**：一個實用工具 Agent，使用 JSONata 查詢來重組或轉換 JSON 資料，從一種格式變為另一種格式。它非常適合用於將一個 Agent 的輸出調整為符合另一個 Agent 的輸入要求。
-   **Image Agent (`type: "image"`)**：專門用於與圖像生成模型互動。它接收指令並生成圖像。
-   **MCP Agent (`type: "mcp"`)**：促進與外部系統或命令列工具的互動。

### 組合：建構複雜系統

AIGNE 的真正威力在於將簡單、專門的 Agent 組合為複雜、精密的系統。這是透過三個主要機制實現的：Skills、Hooks 和 Memory。

#### Skills

一個 Agent 可以配備一份 **Skills** 列表，這些 Skills 是它可以調用的其他 Agent。這允許了模組化和階層式的設計。例如，一個「旅行規劃師」`TeamAgent` 可能會使用一個「機票預訂」`AIAgent`、一個「飯店搜尋」`FunctionAgent` 和一個「貨幣轉換」`TransformAgent` 作為其 Skills。父 Agent 可以將任務委派給適當的 Skill，協調它們的組合輸出以達成複雜的目標。

```typescript
// packages/core/src/agents/agent.ts
export interface AgentOptions<I extends Message = Message, O extends Message = Message>
  extends Partial<Pick<Agent, "guideRails">> {
  // ...
  skills?: (Agent | FunctionAgentFn)[];
  // ...
}
```

#### Hooks

**Hooks** 提供了一個強大的機制，用於觀察和擴展 Agent 行為，而無需修改其核心邏輯。它們允許您將自訂功能附加到 Agent 生命週期的不同階段 (`onStart`、`onEnd`、`onError`、`onSkillStart` 等)。這對於以下方面很有用：

-   記錄和追蹤 Agent 執行。
-   實現自訂的錯誤處理和重試邏輯。
-   即時修改輸入或輸出。
-   監控效能和成本。

#### Memory

Agent 可以配置 **Memory**，以在多次調用之間維持狀態和上下文。`MemoryAgent` 可以記錄 Agent 互動的輸入和輸出。在後續的調用中，Agent 可以檢索此歷史記錄，使其能夠「記住」過去的對話或結果。這對於建構對話式 AI、多步驟工作流程以及從經驗中學習的 Agent 至關重要。

### 使用 YAML 進行設定

雖然 Agent 可以在 TypeScript 中以程式化方式定義和設定，但最常見的方法是在 `.yaml` 檔案中定義它們。`packages/core/src/loader/agent-yaml.ts` 中的 `loadAgentFromYamlFile` 函數會解析這些檔案並建構相應的 Agent 物件。這種設定與邏輯分離的方式，使得 Agent 更易於管理、分享和修改，而無需變更程式碼。

以下是在 YAML 中定義的一個簡單 `AIAgent` 範例：

```yaml
type: ai
name: Greeter
description: 一個簡單的 Agent，用於問候使用者。

instructions: "你是一個友善的助理。根據使用者的名字向他們打招呼，並祝他們有美好的一天。"

inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "要問候的人的姓名。"
  required:
    - name

outputSchema:
  type: object
  properties:
    greeting:
      type: string
      description: "個人化的問候訊息。"
  required:
    - greeting
```

### 使用 `PromptBuilder` 進行提示工程

對於 `AIAgent`，`PromptBuilder` 類別 (`packages/core/src/prompt/prompt-builder.ts`) 是一個關鍵元件。它負責動態建構最終發送給語言模型的提示。它會智慧地組合各種上下文片段：

-   **系統指令**：在 Agent 設定中定義的基礎指令。
-   **使用者輸入**：為當前調用提供的特定輸入。
-   **記憶**：從 `MemoryAgent` 中檢索的過去互動。
-   **工具/技能**：模型可選擇使用的可用技能的定義。

這種精密的組合方式，允許與底層 AI 模型進行高度情境化且強大的互動。

### 結論

AIGNE 框架提供了一個以 **Agent** 為核心的穩健而靈活的架構。透過理解 Agent 生命週期、針對特定任務特化 Agent，並使用 Skills、Hooks 和 Memory 來組合它們，開發者可以建構強大而複雜的自主系統。使用 YAML 進行設定進一步增強了模組化和管理的便利性。