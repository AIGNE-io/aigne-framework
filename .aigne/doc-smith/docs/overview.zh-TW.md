本文件詳細介紹 `AIGNE` 類別，此類別是 AIGNE 框架中的核心協調器。您將學習如何建立、設定和使用 `AIGNE` 執行個體來管理 Agent、處理訊息傳遞，以及建構複雜的人工智慧驅動應用程式。

### 簡介

`AIGNE` 類別是此框架的核心元件，旨在協調多個 Agent 及其互動。它作為主要的執行引擎，管理 Agent 的生命週期，透過訊息佇列促進通訊，並為呼叫 Agent 工作流程提供統一的入口點。

`AIGNE` 類別的主要職責包括：
-   **Agent 管理**：載入、新增和管理構成應用程式的 Agent。
-   **執行情境**：為每個工作流程建立隔離的情境，以管理狀態並強制執行限制。
-   **呼叫**：提供一個靈活的 `invoke` 方法與 Agent 互動，支援標準回應和串流回應。
-   **訊息傳遞**：提供一個發布-訂閱系統，用於 Agent 之間的解耦通訊。
-   **資源管理**：確保 Agent 及相關資源的正常關閉。

### 架構概覽

`AIGNE` 類別位於框架的核心，協調各個元件以執行複雜的任務。下圖說明了它在架構中的核心角色。

```d2
direction: down

User-Application: {
  label: "使用者應用程式"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AIGNE: {
    label: "AIGNE 類別\n(核心協調器)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Managed-Components: {
    grid-columns: 2

    Agents: {
      label: "受管理的 Agent"
      shape: rectangle
      Agent-A: "Agent A"
      Agent-B: "Agent B"
      Agent-C: "..."
    }

    Message-Queue: {
      label: "訊息佇列\n(發布/訂閱)"
      shape: queue
    }
  }
}

User-Application -> AIGNE-Framework.AIGNE: "invoke()"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Agents: "Agent 管理"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Managed-Components.Message-Queue: "訊息傳遞"
AIGNE-Framework.AIGNE -> AIGNE-Framework.AIGNE: "建立執行情境"
AIGNE-Framework.Managed-Components.Agents.Agent-A <-> AIGNE-Framework.Managed-Components.Message-Queue: "通訊"

```

### 建立執行個體

您可以透過兩種主要方式建立 `AIGNE` 執行個體：直接使用其建構函式，或從檔案系統載入設定。

#### 1. 使用建構函式

最直接的方法是使用 `AIGNEOptions` 物件來實例化該類別。這讓您能以程式化的方式定義引擎的所有方面，例如全域模型、Agent 和技能。

**參數 (`AIGNEOptions`)**

| 參數 | 類型 | 說明 |
| :--- | :--- | :--- |
| `name` | `string` | AIGNE 執行個體的名稱。 |
| `description` | `string` | 執行個體用途的說明。 |
| `model` | `ChatModel` | 供所有未指定模型的 Agent 使用的全域模型。 |
| `imageModel` | `ImageModel` | 用於處理圖片相關任務的選用全域圖片模型。 |
| `skills` | `Agent[]` | 此執行個體可用的技能 Agent 列表。 |
| `agents` | `Agent[]` | 由該執行個體管理的主要 Agent 列表。 |
| `limits` | `ContextLimits` | 執行情境的使用限制，例如超時或最大 token 數。 |
| `observer` | `AIGNEObserver` | 用於監控和記錄的觀察者。 |

**範例**

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 建立一個模型執行個體
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 定義一個 Agent
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. 建立一個 AIGNE 執行個體
const aigne = new AIGNE({
  model: model,
  agents: [assistantAgent],
  name: "MyFirstAIGNE",
});
```

#### 2. 從設定檔載入

對於更複雜的應用程式，您可以在 YAML 檔案中定義您的 AIGNE 設定，並使用靜態 `AIGNE.load()` 方法載入它。這種方法將設定與程式碼分離，使您的應用程式更具模組化。

```typescript
import { AIGNE } from '@aigne/core';

// 假設您在 './my-aigne-app' 目錄中有一個 `aigne.yaml` 檔案
async function loadAigne() {
  const aigne = await AIGNE.load('./my-aigne-app');
  console.log(`AIGNE instance "${aigne.name}" loaded successfully.`);
  return aigne;
}
```

### 核心方法

`AIGNE` 類別提供了一套強大的方法來管理 Agent 並與之互動。

#### `invoke()`

`invoke` 方法是與 Agent 互動的主要方式。它支援多種模式，包括建立持續的使用者會話、發送單一訊息以及串流回應。

**1. 建立一個 User Agent**

在沒有訊息的情況下呼叫一個 Agent，會建立一個 `UserAgent`，它會維護一個一致的互動情境。

```typescript
// 建立一個 UserAgent 以便與 'assistantAgent' 進行持續互動
const userAgent = aigne.invoke(assistantAgent);

// 現在您可以透過 userAgent 發送多則訊息
const response1 = await userAgent.invoke("Hello, what's your name?");
const response2 = await userAgent.invoke("Can you help me with a task?");
```

**2. 發送單一訊息（請求-回應）**

對於簡單的一次性互動，您可以直接傳遞 Agent 和訊息。

```typescript
const response = await aigne.invoke(
  assistantAgent,
  "Write a short poem about AI.",
);
console.log(response);
```

**3. 串流回應**

若要以區塊串流的形式接收回應，請將 `streaming` 選項設為 `true`。這對於像聊天機器人這樣的即時應用程式非常理想。

```typescript
const stream = await aigne.invoke(
  assistantAgent,
  "Tell me a long story.",
  { streaming: true }
);

for await (const chunk of stream) {
  // 在故事的每個片段到達時進行處理
  process.stdout.write(chunk.delta.text?.content || "");
}
```

#### `addAgent()`

您可以在 `AIGNE` 執行個體建立後動態地向其新增 Agent。該 Agent 將被附加到執行個體的生命週期和通訊系統中。

```typescript
const newAgent = AIAgent.from({ name: "NewAgent", instructions: "..." });
aigne.addAgent(newAgent);
```

#### `publish()` & `subscribe()`

此框架包含一個用於 Agent 之間解耦通訊的訊息佇列。Agent 可以將訊息發布到主題，而其他 Agent 可以訂閱這些主題以接收訊息。

**發布訊息**

```typescript
// 將訊息發布到 'news_updates' 主題
aigne.publish("news_updates", {
  headline: "AIGNE Framework v2.0 Released",
  content: "New features include...",
});
```

**訂閱主題**

您可以訂閱一個主題以接收單一訊息，或設定一個持續的監聽器。

```typescript
// 1. 等待主題上的下一則訊息
const nextMessage = await aigne.subscribe('user_actions');
console.log('Received action:', nextMessage);

// 2. 為主題上的所有訊息設定一個監聽器
const unsubscribe = aigne.subscribe('system_events', (payload) => {
  console.log(`System Event: ${payload.message.type}`);
});

// 之後若要停止監聽：
unsubscribe();
```

#### `shutdown()`

為確保乾淨地退出，`shutdown` 方法會優雅地終止所有 Agent 和技能，並清理它們持有的任何資源。

```typescript
await aigne.shutdown();
console.log("AIGNE instance has been shut down.");
```

這也可以使用現代 JavaScript/TypeScript 中的 `Symbol.asyncDispose` 功能來自動管理。

```typescript
async function run() {
  await using aigne = new AIGNE({ ... });
  // ... 使用 aigne 執行個體 ...
} // aigne.shutdown() 會在此處自動呼叫
```