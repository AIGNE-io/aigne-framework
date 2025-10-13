本文件為 AIGNE 框架的基礎元件提供了一份開發者導向的指南。理解這些概念對於建構穩健且複雜的多 Agent 系統至關重要。我們將涵蓋 `Agent`、`AIGNE Context` 以及使它們能夠溝通、記憶和擴展其能力的機制。

### 核心元件圖

首先，讓我們視覺化 AIGNE 的核心元件是如何互動的。下圖說明了 Agent、AIGNE Context、主題（Topics）、記憶體（Memory）和技能（Skills）之間的關係。

```d2
direction: down

AIGNE-Context: {
  label: "AIGNE Context"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Agent: {
    label: "Agent"
    shape: rectangle
    style: {
      fill: "#e6f7ff"
      stroke: "#91d5ff"
    }
  }

  Topics: {
    label: "主題\n(通訊匯流排)"
    shape: rectangle
  }

  Memory: {
    label: "記憶體\n(狀態與歷史記錄)"
    shape: cylinder
  }

  Skills: {
    label: "技能\n(擴充能力)"
    shape: rectangle
  }
}

AIGNE-Context.Agent <-> AIGNE-Context.Topics: "通訊方式"
AIGNE-Context.Agent <-> AIGNE-Context.Memory: "讀取/寫入"
AIGNE-Context.Agent <-> AIGNE-Context.Skills: "使用"
```

---

## Agent 類別

`Agent` 是 AIGNE 框架中的基礎建構模組。它是一個能夠執行任務、處理資訊並與其他 Agent 溝通的自主實體。您建立的每個自訂 Agent 都將擴展此基底類別。

### 關鍵概念

*   **`name` 與 `description`**：每個 Agent 都有一個用於識別的 `name` 和一個可選的 `description` 來解釋其用途。這對於除錯以及讓其他 Agent 理解其能力至關重要。
*   **結構定義（`inputSchema`、`outputSchema`）**：Agent 使用 Zod 結構定義來定義其輸入和輸出結構。這確保了傳入和傳出 Agent 的所有資料都經過驗證，從而防止錯誤並確保可預測的互動。
*   **`process` 方法**：Agent 的核心邏輯位於其 `process` 方法中。這是一個您必須在子類別中實作的抽象方法。它接收輸入訊息和調用選項（包括 context），並回傳結果。結果可以是一個直接的物件、一個資料流，甚至是將任務轉交給的另一個 Agent。

### 核心職責

`Agent` 基底類別為以下功能提供了穩健的基礎：
*   處理結構化的輸入與輸出。
*   透過基於主題的訊息系統與其他 Agent 進行通訊。
*   維護過去互動的記憶。
*   利用 `Skills`（其他 Agent）來委派任務並擴展功能。
*   支援串流式和非串流式回應。

### 範例：建立自訂 Agent

以下是一個自訂 Agent 的基本範例，它接收一個名字並回傳一句問候語。

```typescript
import { Agent, AgentInvokeOptions, Message } from "@aigne/core";
import { z } from "zod";

// 定義輸入和輸出的訊息類型
interface GreetingInput extends Message {
  name: string;
}

interface GreetingOutput extends Message {
  greeting: string;
}

// 建立自訂 Agent
class GreeterAgent extends Agent<GreetingInput, GreetingOutput> {
  constructor() {
    super({
      name: "GreeterAgent",
      description: "一個能產生個人化問候語的 Agent。",
      inputSchema: z.object({
        name: z.string().describe("要問候的人的姓名。"),
      }),
      outputSchema: z.object({
        greeting: z.string().describe("產生的問候訊息。"),
      }),
    });
  }

  // 在 process 方法中實作核心邏輯
  async process(input: GreetingInput, options: AgentInvokeOptions) {
    const { name } = input;
    return {
      greeting: `Hello, ${name}! Welcome to the AIGNE framework.`,
    };
  }
}
```

## AIGNE Context

`Context` (`AIGNEContext`) 是 Agent 運作的執行環境。它在 Agent 被調用時傳遞給 Agent，並且對其執行至關重要。Context 不是一個被動的物件；它是通往整個 AIGNE 生態系統的閘道。

### 主要職責

*   **跨 Agent 通訊**：Context 提供了 `publish` 和 `subscribe` 方法，允許 Agent 透過具名主題進行通訊，而無需直接耦合。
*   **狀態與記憶體管理**：它管理整體狀態並提供對記憶體系統的存取。
*   **事件管理**：Context 包含一個事件發射器，用於廣播關鍵的生命週期事件（例如 `agentStarted`、`agentSucceed`、`agentFailed`）。這對於監控、日誌記錄和除錯系統至關重要。
*   **資源與限制強制執行**：它追蹤資源使用情況，例如 Agent 的調用次數，並可強制執行限制以防止失控的程序。

## 透過主題進行通訊

在 AIGNE 中，Agent 使用發布-訂閱（pub/sub）訊息模型進行通訊，由 `Context` 進行協調。這將 Agent 彼此解耦，從而實現靈活且可擴展的架構。

*   **`subscribeTopic`**：Agent 可以聲明它想要監聽的一個或多個主題。當有訊息發布到已訂閱的主題時，Context 將自動觸發 Agent 的 `onMessage` 處理程式，進而調用該 Agent。
*   **`publishTopic`**：處理完畢後，Agent 可以將其輸出發布到一個或多個主題。這允許其他感興趣的 Agent 對結果做出反應。`publishTopic` 可以是一個靜態字串，也可以是一個根據輸出訊息動態決定主題的函式。

這個系統使您能夠建構複雜的工作流程，其中 Agent 對其他 Agent 產生的事件和資料做出反應，形成一個協作式的多 Agent 系統。

## 記憶體

要讓一個 Agent 真正具有智慧，它需要記住過去的互動。AIGNE 提供了一個可以附加到任何 Agent 上的 `MemoryAgent`。

設定後，Agent 將自動：
1.  **記錄互動**：在成功處理一則訊息後，Agent 會將輸入和輸出對記錄到其關聯的記憶體中。
2.  **檢索記憶**：在處理之前，Agent 可以查詢其記憶體以檢索相關的過去互動，為其當前任務提供有價值的上下文。

這使得 Agent 能夠從經驗中學習，維護對話歷史，並執行需要了解先前事件的任務。

## 技能

為了促進模組化和重用，Agent 的能力可以透過 **`Skills`** 進行擴展。一個技能（Skill）就是另一個 `Agent`。透過將技能添加到 Agent 中，您賦予了它將特定任務委派給該技能的能力。

例如，一個複雜的「TripPlanner」Agent 可能會使用多個技能：
*   一個 `FlightSearchAgent` 用於尋找航班。
*   一個 `HotelBookingAgent` 用於預訂住宿。
*   一個 `WeatherAgent` 用於查詢天氣預報。

`TripPlanner` Agent 不需要知道這些任務的實作細節。它只需將它們作為技能調用，協調它們的結果以實現其主要目標。這遵循了「組合優於繼承」的原則，是建構複雜、可維護的 Agent 系統的關鍵。

## Agent 生命週期與掛鉤 (Hooks)

每個 Agent 的調用都會經過一個定義好的生命週期，您可以使用 **`Hooks`** 來介入此生命週期。Hooks 允許您在關鍵階段執行自訂邏輯，而無需修改 Agent 的核心實作。

關鍵的生命週期事件包括：
*   **`onStart`**：在 Agent 的 `process` 方法被呼叫之前。
*   **`onEnd`**：在 Agent 完成後，無論成功或失敗。
*   **`onSuccess`**：在 Agent 成功完成後。
*   **`onError`**：在處理過程中發生錯誤時。
*   **`onSkillStart` / `onSkillEnd`**：在技能被調用之前和之後。

Hooks 對於日誌記錄、監控、指標收集以及實作如身份驗證或快取等橫切關注點（cross-cutting concerns）非常強大。