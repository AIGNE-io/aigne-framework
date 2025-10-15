# Function Agent

`FunctionAgent` 提供了一種直接的方法來封裝現有的 TypeScript 或 JavaScript 函式，從而將它們提升為 AIGNE 框架內的一級 Agent。這使得自訂的商業邏輯、外部 API 互動或任何任意程式碼能夠無縫整合到 Agent 工作流程中，無需大量樣板程式碼。

透過包裝一個函式，`FunctionAgent` 使其能夠完全參與 Agent 生態系統。它可以像任何其他 Agent 一樣被呼叫，可以作為一個技能整合到 `AIAgent` 或 `TeamAgent` 中，並與 AIGNE 的上下文和生命週期掛鉤互動。這使其成為連接傳統程式化邏輯與 AI 驅動流程的重要元件。

此圖表說明了 `FunctionAgent` 的建立和呼叫流程，從提供來源函式到接收最終輸出。

```d2
direction: down

Zod-Library: {
  label: "Zod 函式庫"
  shape: rectangle
  style.fill: "#f0f0f0"
}

External-API: {
  label: "外部 API\n（例如：REST、GraphQL）"
  shape: cylinder
}

Developers-Code: {
  label: "開發人員的程式碼"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Custom-Logic: {
    label: "自訂邏輯\n（JS/TS 函式）"
    shape: rectangle
  }

  Agent-Config: {
    label: "Agent 設定物件"
    shape: rectangle
  }
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  FunctionAgent: {
    label: "FunctionAgent"
    shape: rectangle

    from-method: {
      label: "from()"
      shape: oval
    }

    invoke-method: {
      label: "invoke()"
      shape: oval
    }
  }
}

Developers-Code.Custom-Logic -> AIGNE-Framework.FunctionAgent.from-method: "1a. 提供函式"
Developers-Code.Agent-Config -> AIGNE-Framework.FunctionAgent.from-method: "1b. 提供設定"
Zod-Library -> Developers-Code.Agent-Config: {
  label: "定義結構"
  style.stroke-dash: 2
}
AIGNE-Framework.FunctionAgent.from-method -> AIGNE-Framework.FunctionAgent: "2. 建立實例"

Developers-Code -> AIGNE-Framework.FunctionAgent.invoke-method: "3. 使用輸入呼叫"
AIGNE-Framework.FunctionAgent.invoke-method -> Developers-Code.Custom-Logic: "4. 執行 'process' 邏輯"
Developers-Code.Custom-Logic -> External-API: "5.（可選）擷取資料"
External-API -> Developers-Code.Custom-Logic: "6. 回傳資料"
Developers-Code.Custom-Logic -> AIGNE-Framework.FunctionAgent.invoke-method: "7. 回傳結果"
AIGNE-Framework.FunctionAgent.invoke-method -> Developers-Code: "8. 回傳最終輸出"
```

## 關鍵概念

`FunctionAgent` 是 `Agent` 類別的一個特殊實作，它將其核心處理邏輯委派給一個由使用者提供的函式。這個 Agent 的主要建構函式是靜態方法 `FunctionAgent.from()`，它簡化了其實例化過程。

`FunctionAgent` 可以透過兩種方式建立：

1.  **直接從函式建立：** 將一個同步或非同步函式傳遞給 `FunctionAgent.from()`。Agent 將從函式定義中推斷屬性，例如其名稱。
2.  **從設定物件建立：** 為了更明確的控制，提供一個選項物件，該物件指定 `process` 函式以及其他標準的 Agent 設定，如 `name`、`description`、`inputSchema` 和 `outputSchema`。

這種設計為快速、臨時的整合以及開發穩健、定義明確的 Agent 元件提供了靈活性。

## 建立一個 Function Agent

建立 `FunctionAgent` 的標準方法是透過 `FunctionAgent.from()` 工廠方法，該方法接受一個函式或一個設定物件。

### 從一個簡單的函式

任何標準函式都可以直接被包裝。AIGNE 框架將使用該函式的名稱作為 Agent 的名稱。這種方法最適合簡單、獨立的操作。

```javascript 包裝一個簡單的函式 icon=logos:javascript
import { FunctionAgent } from "@aigne/core";

// 定義一個簡單的同步函式
function add({ a, b }) {
  return { result: a + b };
}

// 將函式包裝成一個 Agent
const addAgent = FunctionAgent.from(add);

console.log(addAgent.name); // 輸出：'add'
```

該函式接收 Agent 的輸入物件作為其第一個參數，並應回傳一個構成 Agent 輸出的物件。

### 使用完整設定

對於更複雜的整合，應提供一個完整的設定物件。這允許定義用於驗證的輸入/輸出結構、包含描述以及指定自訂名稱。建議使用此方法來建立穩健且可重複使用的 Agent。

```javascript 使用完整設定的 Function Agent icon=logos:javascript
import { FunctionAgent } from "@aigne/core";
import { z } from "zod";

const fetchUserAgent = FunctionAgent.from({
  name: "FetchUser",
  description: "Fetches user data from a placeholder API.",
  inputSchema: z.object({
    userId: z.number().describe("The ID of the user to fetch."),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
  process: async ({ userId }) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data.");
    }
    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  },
});
```

在此範例中，定義了 `zod` 結構以確保輸入的 `userId` 是數字，並且輸出符合指定的結構。

## 呼叫 Function Agent

已建立的 `FunctionAgent` 使用標準的 `.invoke()` 方法進行呼叫，與所有其他 Agent 類型一致。

```javascript 呼叫 Agent icon=logos:javascript
async function main() {
  // 使用前一個範例中的簡單 'add' Agent
  const result = await addAgent.invoke({ a: 10, b: 5 });
  console.log(result); // { result: 15 }

  // 使用設定好的 'FetchUser' Agent
  const user = await fetchUserAgent.invoke({ userId: 1 });
  console.log(user); 
  // { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' }
}

main();
```

`invoke` 方法管理執行生命週期，包括根據結構（如果提供）進行輸入驗證、執行底層函式，以及根據輸出結構驗證結果。

## 進階用法

### 串流回應

`FunctionAgent` 透過使用非同步產生器支援串流回應。`process` 函式可以定義為一個 `async function*`，它 `yield` `AgentResponseChunk` 物件，從而實現增量資料傳輸。

```javascript 使用非同步產生器進行串流 icon=logos:javascript
import { FunctionAgent, jsonDelta, textDelta } from "@aigne/core";
import { z } from "zod";

const streamNumbersAgent = FunctionAgent.from({
  name: "StreamNumbers",
  inputSchema: z.object({
    count: z.number().int().positive(),
  }),
  outputSchema: z.object({
    finalCount: z.number(),
    message: z.string(),
  }),
  process: async function* ({ count }) {
    for (let i = 1; i <= count; i++) {
      yield textDelta({ message: `Processing number ${i}... ` });
      await new Promise((resolve) => setTimeout(resolve, 200)); // 模擬工作
    }
    yield jsonDelta({ finalCount: count });
    yield textDelta({ message: "Done." });
  },
});

async function runStream() {
  const stream = await streamNumbersAgent.invoke({ count: 5 }, { streaming: true });
  for await (const chunk of stream) {
    console.log(chunk);
  }
}

runStream();
```

此功能對於需要即時回饋 Agent 進度的長時間執行任務特別有用。

## 設定

`FunctionAgent` 透過傳遞給 `FunctionAgent.from` 或其建構函式的設定物件進行初始化。以下是其設定特有的參數。

<x-field-group>
  <x-field data-name="process" data-type="FunctionAgentFn" data-required="true">
    <x-field-desc markdown>實作 Agent 邏輯的函式。它接收輸入訊息和呼叫選項，並回傳處理結果。這可以是一個同步函式、一個回傳 Promise 的非同步函式，或用於串流的非同步產生器。</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agent 的唯一名稱，用於識別和日誌記錄。如果未提供，則預設為 `process` 函式的名稱。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>對 Agent 功能的人類可讀描述。這對於文件記錄以及讓其他 Agent 了解其功能很有用。</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="ZodObject" data-required="false">
    <x-field-desc markdown>用於驗證輸入訊息結構和型別的 Zod 結構。如果驗證失敗，Agent 將在 `process` 函式被呼叫前拋出錯誤。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="ZodObject" data-required="false">
    <x-field-desc markdown>用於驗證 `process` 函式回傳的輸出訊息結構和型別的 Zod 結構。如果驗證失敗，將拋出錯誤。</x-field-desc>
  </x-field>
</x-field-group>

基礎 `AgentOptions` 的所有其他屬性也可用。有關完整列表，請參閱 [Agent 文件](./developer-guide-core-concepts-agents.md)。

## 總結

`FunctionAgent` 是一個多功能的工具，用於將傳統程式碼整合到 AIGNE 框架中，它作為一座橋樑，讓任何 JavaScript 或 TypeScript 函式都能像標準 Agent 一樣運作。

-   **簡易性：** 使用 `FunctionAgent.from()` 輕鬆包裝現有函式。
-   **整合性：** 將傳統的商業邏輯、計算或外部 API 呼叫無縫整合到 Agent 工作流程中。
-   **驗證：** 透過使用 Zod 定義輸入和輸出結構來強制執行資料合約並提高可靠性。
-   **靈活性：** 支援同步函式、非同步 promise 和使用非同步產生器進行串流。

透過利用 `FunctionAgent`，開發人員可以將傳統程式碼的確定性和可靠性與 AI Agent 的動態能力相結合，以建構更強大、更穩健的應用程式。若要協調多個 Agent（包括 Function Agent），請參閱有關 [Team Agent](./developer-guide-agents-team-agent.md) 的文件。