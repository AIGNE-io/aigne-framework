本文件詳細介紹了 `AIGNE` 類別，這是建構複雜 AI 應用程式的核心協調器。

## AIGNE 類別

`AIGNE` 類別是此框架的核心，旨在管理和協調多個 Agent 以執行複雜的任務。它作為 Agent 互動、訊息傳遞和整體執行流程的中心樞紐。透過協調各種專門的 Agent，`AIGNE` 得以建構精密的多 Agent AI 系統。

### 架構概覽

下圖說明了 AIGNE 系統的高階架構，展示了 `AIGNE`、`Agent` 和 `Context` 等主要類別之間的關係。

```d2
direction: down

AIGNE: {
  label: "AIGNE 類別\n（協調器）"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Context: {
  label: "情境"
  shape: cylinder
}

Agents: {
  label: "Agent 池"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Agent-A: {
    label: "Agent A"
  }
  Agent-B: {
    label: "Agent B"
  }
  Agent-N: {
    label: "..."
  }
}

AIGNE -> Context: "管理"
AIGNE <-> Agents: "協調與路由訊息"
Agents -> Context: "存取"
```

### 核心概念

-   **Agent 管理**：`AIGNE` 負責新增、管理和協調系統內所有 Agent 的生命週期。
-   **建立情境**：它為不同的任務或對話建立隔離的執行情境（`AIGNEContext`），確保狀態和資源使用得到妥善管理。
-   **訊息傳遞**：它透過內建的訊息佇列促進 Agent 之間的通訊，允許直接調用和發布-訂閱模型。
-   **全域設定**：`AIGNE` 持有全域設定，例如預設的 `ChatModel`、`ImageModel`，以及一個可供系統中任何 Agent 存取的共享 `skills`（專門的 Agent）集合。

### 建立 AIGNE 實例

您可透過兩種主要方式建立 `AIGNE` 實例：以程式化方式使用建構函式，或從檔案系統載入設定。

#### 1. 使用建構函式

建構函式讓您能以程式化方式設定實例。

```typescript
import { AIGNE, Agent, ChatModel } from "@aigne/core";

// 定義一個模型和一些 Agent（技能）
const model = new ChatModel(/* ... */);
const skillAgent = new Agent({ /* ... */ });
const mainAgent = new Agent({ /* ... */ });

// 建立一個 AIGNE 實例
const aigne = new AIGNE({
  name: "MyAIGNEApp",
  description: "An example AIGNE application.",
  model: model,
  skills: [skillAgent],
  agents: [mainAgent],
});
```

**建構函式選項 (`AIGNEOptions`)**

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="AIGNE 實例的名稱。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="實例用途的描述。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="適用於所有 Agent 的全域預設 ChatModel。"></x-field>
  <x-field data-name="imageModel" data-type="ImageModel" data-required="false" data-desc="用於處理圖像相關任務的全域預設 ImageModel。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="可供所有其他 Agent 使用的共享 Agent（技能）列表。"></x-field>
  <x-field data-name="agents" data-type="Agent[]" data-required="false" data-desc="在建立實例時要新增的主要 Agent 列表。"></x-field>
  <x-field data-name="limits" data-type="ContextLimits" data-required="false" data-desc="執行情境的使用限制（例如，逾時、最大 token 數）。"></x-field>
  <x-field data-name="observer" data-type="AIGNEObserver" data-required="false" data-desc="用於監控和記錄實例活動的觀察者。"></x-field>
</x-field-group>

#### 2. 從設定載入

靜態 `AIGNE.load()` 方法提供了一種便利的方式，可從包含 `aigne.yaml` 檔案和其他 Agent 定義的目錄中初始化實例。這對於將設定與程式碼分離非常理想。

```typescript
import { AIGNE } from "@aigne/core";

// 從目錄路徑載入 AIGNE 實例
const aigne = await AIGNE.load("./path/to/config/dir");

// 您也可以覆寫已載入的選項
const aigneWithOverrides = await AIGNE.load("./path/to/config/dir", {
  name: "MyOverriddenAppName",
});
```

### 主要方法

#### invoke()

`invoke()` 方法是與 Agent 互動的主要方式。它有多個多載以支援不同的互動模式。

**1. 簡單調用**

這是最常見的使用情境，您向一個 Agent 發送輸入訊息並接收完整的 回應。

**範例**
```typescript
import { AIGNE } from '@aigne/core';
import { GreeterAgent } from './agents/greeter.agent.js';

const aigne = new AIGNE();
const greeter = new GreeterAgent();
aigne.addAgent(greeter);

const { message } = await aigne.invoke(greeter, {
  name: 'John',
});

// 預期輸出："Hello, John"
console.log(message);
```

**2. 串流調用**

對於長時間運行的任務或互動式體驗（如聊天機器人），您可以在回應生成時以串流方式接收。

**範例**
```typescript
import { AIGNE } from '@aigne/core';
import { StreamAgent } from './agents/stream.agent.js';

const aigne = new AIGNE();
const streamAgent = new StreamAgent();
aigne.addAgent(streamAgent);

const stream = await aigne.invoke(
  streamAgent,
  {
    name: 'World',
  },
  { streaming: true }
);

let fullMessage = '';
for await (const chunk of stream) {
  if (chunk.delta.text?.message) {
    fullMessage += chunk.delta.text.message;
    // 即時處理區塊
    process.stdout.write(chunk.delta.text.message);
  }
}
// 預期輸出："Hello, World"（逐字元串流）
```

**3. 建立 UserAgent**

如果您需要與一個 Agent 重複互動，可以建立一個 `UserAgent`。這為對話提供了一致的介面。

**範例**
```typescript
import { AIGNE } from '@aigne/core';
import { CalculatorAgent } from './agents/calculator.agent.js';

const aigne = new AIGNE();
const calculator = new CalculatorAgent();
aigne.addAgent(calculator);

// 為計算機建立一個 UserAgent
const user = aigne.invoke(calculator);

// 多次調用它
const result1 = await user.invoke({ operation: 'add', a: 5, b: 3 });
console.log(result1.result); // 8

const result2 = await user.invoke({ operation: 'subtract', a: 10, b: 4 });
console.log(result2.result); // 6
```

#### addAgent()

在 `AIGNE` 實例建立後，動態地將一個或多個 Agent 新增至該實例。一旦新增，Agent 就會附加到實例上並可以參與系統運作。

```typescript
const aigne = new AIGNE();
const agent1 = new MyAgent1();
const agent2 = new MyAgent2();

aigne.addAgent(agent1, agent2);
```

#### publish() / subscribe()

`AIGNE` 提供了一個訊息佇列，用於 Agent 之間使用發布-訂閱模型的解耦、事件驅動通訊。

**範例**
```typescript
import { AIGNE } from '@aigne/core';

const aigne = new AIGNE();

// 訂閱者：監聽某個主題的訊息
aigne.subscribe('user.updated', ({ message }) => {
  console.log(`Received user update: ${message.userName}`);
});

// 另一個使用 async/await 處理單一訊息的訂閱者
async function waitForUpdate() {
  const { message } = await aigne.subscribe('user.updated');
  console.log(`Async handler received: ${message.userName}`);
}
waitForUpdate();

// 發布者：向某個主題廣播一則訊息
aigne.publish('user.updated', {
  userName: 'JaneDoe',
  status: 'active',
});
```

#### shutdown()

平穩地關閉 `AIGNE` 實例，確保所有 Agent 和技能都能正確清理其資源。這對於防止資源洩漏至關重要。

**範例**
```typescript
const aigne = new AIGNE();
// ... 新增 Agent 並操作

// 完成後關閉
await aigne.shutdown();
```

`AIGNE` 類別也支援 `Symbol.asyncDispose` 方法，讓您可以使用 `using` 陳述式進行自動清理。

```typescript
import { AIGNE } from '@aigne/core';

async function myApp() {
  await using aigne = new AIGNE();
  // ... 在此區塊結束時，aigne 將會自動關閉
}
```