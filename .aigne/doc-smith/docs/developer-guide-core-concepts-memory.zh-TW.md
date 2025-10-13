# 記憶體管理

記憶體模組提供了一個強大的框架，讓 Agent 能夠持久化和回憶資訊，從而建立一個有狀態且具備情境感知能力的系統。這使得 Agent 能夠維護互動歷史、從過去的事件中學習，並做出更明智的決策。

記憶體系統的核心是 `MemoryAgent`，它作為所有記憶相關操作的中央協調者。它將實際的寫入和讀取記憶任務委派給兩個專門的元件：`MemoryRecorder` 和 `MemoryRetriever`。這種關注點分離的設計實現了彈性且可擴展的記憶解決方案。

- **MemoryAgent**：記憶體操作的主要進入點。它負責協調記錄和擷取過程。
- **MemoryRecorder**：一個 Agent 技能，負責將記憶寫入或儲存到持久化後端（例如，資料庫、檔案系統或記憶體內儲存）。
- **MemoryRetriever**：一個 Agent 技能，負責從儲存後端查詢和擷取記憶。

本指南將逐一介紹每個元件，解釋它們的角色，並提供如何在您的 Agent 系統中實作和使用它們的實際範例。

## 架構概觀

下圖說明了核心記憶體元件之間的關係。應用程式邏輯與 `MemoryAgent` 互動，而 `MemoryAgent` 則使用 `MemoryRecorder` 和 `MemoryRetriever` 技能與持久化儲存後端互動。

```d2
direction: down

Agent-System: {
  label: "Agent 系統\n(應用程式)"
  shape: rectangle
}

Memory-Module: {
  label: "記憶體模組"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MemoryAgent: {
    label: "MemoryAgent\n(協調者)"
  }

  MemoryRecorder: {
    label: "MemoryRecorder\n(Agent 技能)"
  }

  MemoryRetriever: {
    label: "MemoryRetriever\n(Agent 技能)"
  }
}

Persistent-Backend: {
  label: "持久化後端\n(資料庫、檔案系統等)"
  shape: cylinder
}

Agent-System -> Memory-Module.MemoryAgent: "1. record() / retrieve()"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRecorder: "2a. 委派寫入"
Memory-Module.MemoryRecorder -> Persistent-Backend: "3a. 儲存記憶"

Memory-Module.MemoryAgent -> Memory-Module.MemoryRetriever: "2b. 委派讀取"
Memory-Module.MemoryRetriever -> Persistent-Backend: "3b. 查詢記憶"
Persistent-Backend -> Memory-Module.MemoryRetriever: "4b. 回傳記憶"
```

## 核心元件

### MemoryAgent

`MemoryAgent` 是一個專門的 Agent，作為管理、儲存和擷取記憶的主要介面。它不像其他 Agent 那樣被設計為直接呼叫來處理訊息；相反地，它提供核心的 `record()` 和 `retrieve()` 方法來與系統的記憶體互動。

您可以透過提供一個 `recorder` 和一個 `retriever` 來設定 `MemoryAgent`。這些可以是預先建置的實例或定義您特定儲存邏輯的自訂函式。

**主要功能：**

- **集中管理**：作為記憶體操作的單一聯絡點。
- **委派**：將儲存和擷取邏輯卸載給專用的 `MemoryRecorder` 和 `MemoryRetriever` Agent。
- **自動記錄**：可透過 `autoUpdate` 設定，自動記錄其觀察到的所有訊息，從而建立無縫的互動歷史記錄。

**範例：建立一個 MemoryAgent**

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { Agent, type AgentInvokeOptions, type Message } from "@core/agents";

// 定義記錄和擷取記憶的自訂邏輯
const myRecorder = new MemoryRecorder({
  process: async (input, options) => {
    // 將記憶儲存到資料庫的自訂邏輯
    console.log("Recording memories:", input.content);
    // ... 實作 ...
    return { memories: [] }; // 回傳已建立的記憶
  },
});

const myRetriever = new MemoryRetriever({
  process: async (input, options) => {
    // 從資料庫擷取記憶的自訂邏輯
    console.log("Retrieving memories with search:", input.search);
    // ... 實作 ...
    return { memories: [] }; // 回傳找到的記憶
  },
});

// 建立 MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder: myRecorder,
  retriever: myRetriever,
  autoUpdate: true, // 自動記錄來自訂閱主題的訊息
  subscribeTopic: "user-input",
});
```

### MemoryRecorder

`MemoryRecorder` 是一個負責儲存記憶的抽象 Agent 類別。若要使用它，您必須提供 `process` 方法的具體實作，其中包含如何以及在何處持久化記憶資料的邏輯。這種設計讓您可以連接到任何儲存後端，從簡單的記憶體內陣列到複雜的向量資料庫。

**輸入 (`MemoryRecorderInput`)**

`process` 函式接收一個輸入物件，其中包含一個 `content` 陣列。陣列中的每個項目都代表一則要儲存的資訊，可以是 `input` 訊息、`output` 訊息以及 `source` Agent 的 ID。

```typescript
interface MemoryRecorderInput extends Message {
  content: {
    input?: Message;
    output?: Message;
    source?: string;
  }[];
}
```

**輸出 (`MemoryRecorderOutput`)**

此函式應回傳一個 promise，其解析值為一個物件，內含一個成功建立的 `memories` 陣列。

```typescript
interface MemoryRecorderOutput extends Message {
  memories: Memory[];
}
```

**範例：實作一個簡單的記憶體內記錄器**

以下是如何建立一個將記憶儲存在本機陣列中的簡單記錄器。

```typescript
import {
  MemoryRecorder,
  type MemoryRecorderInput,
  type MemoryRecorderOutput,
  type Memory,
  newMemoryId,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// 使用一個簡單的記憶體內陣列作為我們的資料庫
const memoryDB: Memory[] = [];

const inMemoryRecorder = new MemoryRecorder({
  process: async (
    input: MemoryRecorderInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRecorderOutput>> => {
    const newMemories: Memory[] = input.content.map((item) => ({
      id: newMemoryId(),
      content: item,
      createdAt: new Date().toISOString(),
    }));

    // 將新記憶新增至我們的「資料庫」
    memoryDB.push(...newMemories);
    console.log("Current memory count:", memoryDB.length);

    return { memories: newMemories };
  },
});
```

### MemoryRetriever

`MemoryRetriever` 是記錄器的對應元件。它是一個負責從儲存空間擷取記憶的抽象 Agent 類別。與記錄器一樣，它需要一個 `process` 方法的自訂實作來定義擷取邏輯。

**輸入 (`MemoryRetrieverInput`)**

`process` 函式接收一個輸入物件，其中可包含一個 `search` 查詢和一個 `limit` 來控制結果數量。實作方式決定了如何執行搜尋（例如，關鍵字比對、向量相似度）。

```typescript
interface MemoryRetrieverInput extends Message {
  limit?: number;
  search?: string | Message;
}
```

**輸出 (`MemoryRetrieverOutput`)**

此函式應回傳一個 promise，其解析值為一個物件，內含一個符合查詢條件的 `memories` 陣列。

```typescript
interface MemoryRetrieverOutput extends Message {
  memories: Memory[];
}
```

**範例：實作一個簡單的記憶體內擷取器**

此擷取器與上方的 `inMemoryRecorder` 範例搭配使用，在本地陣列中搜尋相符的內容。

```typescript
import {
  MemoryRetriever,
  type MemoryRetrieverInput,
  type MemoryRetrieverOutput,
  type Memory,
} from "@core/memory";
import { type AgentInvokeOptions, type AgentProcessResult } from "@core/agents";

// 假設 memoryDB 與記錄器使用的陣列相同
declare const memoryDB: Memory[];

const inMemoryRetriever = new MemoryRetriever({
  process: async (
    input: MemoryRetrieverInput,
    options: AgentInvokeOptions
  ): Promise<AgentProcessResult<MemoryRetrieverOutput>> => {
    let results: Memory[] = [...memoryDB];

    // 根據搜尋查詢篩選結果
    if (input.search && typeof input.search === "string") {
      const searchTerm = input.search.toLowerCase();
      results = results.filter((mem) =>
        JSON.stringify(mem.content).toLowerCase().includes(searchTerm)
      );
    }

    // 套用限制
    if (input.limit) {
      results = results.slice(-input.limit); // 取得最新的項目
    }

    return { memories: results };
  },
});
```

## 整合所有元件

現在，讓我們結合這些元件來建立一個功能齊全的記憶體系統。我們將使用自訂的記憶體內記錄器和擷取器來實例化 `MemoryAgent`，然後用它來記錄和擷取資訊。

```typescript
import { MemoryAgent, MemoryRecorder, MemoryRetriever } from "@core/memory";
import { AIGNE, type Context } from "@core/aigne";

// --- 假設 inMemoryRecorder 和 inMemoryRetriever 的定義如上 ---

// 1. 初始化 MemoryAgent
const memoryAgent = new MemoryAgent({
  recorder: inMemoryRecorder,
  retriever: inMemoryRetriever,
});

// 2. 建立一個執行 Agent 的情境
const context = new AIGNE().createContext();

// 3. 記錄一筆新記憶
async function runMemoryExample(context: Context) {
  console.log("Recording a new memory...");
  await memoryAgent.record(
    {
      content: [
        {
          input: { text: "What is the capital of France?" },
          output: { text: "The capital of France is Paris." },
          source: "GeographyAgent",
        },
      ],
    },
    context
  );

  // 4. 擷取記憶
  console.log("\nRetrieving memories about 'France'...");
  const retrieved = await memoryAgent.retrieve({ search: "France" }, context);

  console.log("Found memories:", retrieved.memories);
}

runMemoryExample(context);

/**
 * 預期輸出：
 *
 * Recording a new memory...
 * Current memory count: 1
 *
 * Retrieving memories about 'France'...
 * Found memories: [
 *   {
 *     id: '...',
 *     content: {
 *       input: { text: 'What is the capital of France?' },
 *       output: { text: 'The capital of France is Paris.' },
 *       source: 'GeographyAgent'
 *     },
 *     createdAt: '...'
 *   }
 * ]
 */
```

這個完整的範例展示了端到端的流程：定義自訂儲存邏輯，將其整合到 `MemoryAgent` 中，並使用該 Agent 來管理系統的記憶體。