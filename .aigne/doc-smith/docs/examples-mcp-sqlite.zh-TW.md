# MCP SQLite

本指南全面介紹如何使用 AIGNE 框架和模型情境協定 (Model Context Protocol, MCP) 與 SQLite 資料庫互動。透過此範例，您將學習如何設定一個 Agent，使其能夠透過自然語言指令執行資料庫操作，例如建立資料表、插入資料和查詢記錄。

## 概述

MCP SQLite 範例展示了如何透過 MCP 伺服器將 AI Agent 連接到外部 SQLite 資料庫。這使得 Agent 能夠利用一組預先定義的技能進行資料庫管理，包括建立、讀取和寫入資料。Agent 會解讀使用者請求，將其轉換為適當的資料庫指令，並透過 SQLite MCP 伺服器執行。

基本工作流程如下：
1.  使用者提供一個自然語言指令（例如，「建立一個產品資料表」）。
2.  `AIAgent` 處理該指令。
3.  Agent 從連接到 SQLite 伺服器的 `MCPAgent` 中識別出適當的技能（例如，`create_table`）。
4.  `MCPAgent` 在資料庫上執行相應的 SQL 指令。
5.  結果返回給 Agent，然後 Agent 為使用者產生回應。

下圖說明了此工作流程：

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCP Agent \n(SQLite 技能)"
  shape: rectangle
}

SQLite-DB: {
  label: "SQLite 資料庫"
  shape: cylinder
}

User -> AIAgent: "1. 自然語言指令\n(例如，'建立一個資料表')"
AIAgent -> MCPAgent: "2. 選擇並呼叫技能\n(例如，create_table)"
MCPAgent -> SQLite-DB: "3. 執行 SQL 指令"
SQLite-DB -> MCPAgent: "4. 返回結果"
MCPAgent -> AIAgent: "5. 轉發結果"
AIAgent -> User: "6. 產生並傳送回應"

```

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 一起提供。
*   **uv**：一個 Python 虛擬環境和套件安裝程式。請參閱 [uv 安裝指南](https://github.com/astral-sh/uv) 以取得設定說明。
*   **AI 模型 API 金鑰**：來自支援的供應商（例如 OpenAI）的 API 金鑰。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需在本機安裝。這是查看 MCP SQLite 整合實際運作的最快方法。

### 執行範例

在您的終端機中執行以下指令。此範例支援用於單一指令的單次模式和互動式聊天模式。

1.  **單次模式 (預設)**
    此模式接受單一指令，執行後即退出。

    ```bash icon=lucude:terminal
    npx -y @aigne/example-mcp-sqlite --input "create a product table with columns name, description, and createdAt"
    ```

2.  **管道輸入**
    您也可以將輸入直接透過管道傳送給指令。

    ```bash icon=lucude:terminal
    echo "how many products are in the table?" | npx -y @aigne/example-mcp-sqlite
    ```

3.  **互動式聊天模式**
    若要進行對話式體驗，請使用 `--chat` 旗標。

    ```bash icon=lucude:terminal
    npx -y @aigne/example-mcp-sqlite --chat
    ```

### 連接到 AI 模型

為了執行指令，Agent 需要連接到一個大型語言模型。您有多種選擇。

*   **AIGNE Hub (建議)**：首次執行範例時，系統會提示您透過官方 AIGNE Hub 連接。這是最簡單的方法，並為新使用者提供免費的權杖以開始使用。
*   **自行託管的 AIGNE Hub**：如果您有自己的 AIGNE Hub 實例，可以透過提供其 URL 來連接。
*   **第三方模型供應商**：您可以透過將所需的 API 金鑰設定為環境變數，直接連接到像 OpenAI 這樣的模型供應商。

例如，要使用 OpenAI，請匯出您的 API 金鑰：

```bash title="設定 OpenAI API 金鑰" icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

有關設定不同模型供應商的更多範例，請參閱原始碼儲存庫中的 `.env.local.example` 檔案。

## 從原始碼安裝

若要進行開發或自訂，您可以複製儲存庫並在本機執行範例。

1.  **複製儲存庫**

    ```bash icon=lucude:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安裝依賴項**
    導覽至範例目錄並使用 `pnpm` 安裝必要的套件。

    ```bash icon=lucude:terminal
    cd aigne-framework/examples/mcp-sqlite
    pnpm install
    ```

3.  **執行範例**
    使用 `pnpm start` 指令執行指令碼。

    ```bash icon=lucude:terminal
    # 以單次模式執行
    pnpm start -- --input "create 10 products for test"

    # 以互動式聊天模式執行
    pnpm start -- --chat
    ```

## 命令列選項

該指令碼接受多個命令列參數來自訂其行為。

| 參數 | 說明 | 預設值 |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| `--chat` | 以互動式聊天模式執行。 | 已停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 供應商預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 供應商預設值 |
| `--presence-penalty <value>` | 設定存在懲罰值。 | 供應商預設值 |
| `--frequency-penalty <value>`| 設定頻率懲罰值。 | 供應商預設值 |
| `--log-level <level>` | 設定記錄等級 (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入。 | 無 |

## 程式碼實作

核心邏輯包括初始化 AI 模型、設定 `MCPAgent` 以連接到 SQLite 伺服器，然後建立一個使用該 Agent 及其技能的 `AIGNE` 實例。

以下範例展示了建立資料表、插入記錄和查詢資料庫的完整過程。

```typescript index.ts
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 確保您的環境變數中已設定 OpenAI API 金鑰
const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 建立一個 MCPAgent 來管理 SQLite 伺服器程序
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"), // 指定資料庫檔案路徑
  ],
});

// 3. 使用模型和 SQLite 技能實例化 AIGNE
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 4. 定義帶有特定指令的 AI Agent
const agent = AIAgent.from({
  instructions: "You are a database administrator",
});

// 5. 呼叫 Agent 以執行資料庫操作
console.log(
  "Creating table...",
  await aigne.invoke(
    agent,
    "create a product table with columns name, description, and createdAt",
  ),
);
// 預期輸出：
// {
//   $message: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(
  "Inserting test data...",
  await aigne.invoke(agent, "create 10 products for test"),
);
// 預期輸出：
// {
//   $message: "I have successfully created 10 test products in the database...",
// }

console.log(
  "Querying data...",
  await aigne.invoke(agent, "how many products?"),
);
// 預期輸出：
// {
//   $message: "There are 10 products in the database.",
// }

// 6. 關閉 AIGNE 實例以終止 MCP 伺服器
await aigne.shutdown();
```

此指令碼自動化了整個生命週期：它啟動 MCP 伺服器，設定一個 AI Agent 來使用它，根據自然語言執行一系列資料庫任務，並乾淨地關閉。

## 偵錯

要監控和分析 Agent 的行為，您可以使用 `aigne observe` 指令。此工具會啟動一個本機 Web 伺服器，提供 Agent 執行追蹤的詳細視圖，包括與模型和工具的互動。這對於偵錯和理解資訊流非常有價值。

```bash icon=lucude:terminal
aigne observe
```

執行此指令後，您可以在瀏覽器中開啟提供的 URL 來檢查最近的 Agent 呼叫。

## 總結

此範例說明了將 AIGNE 框架與模型情境協定相結合的強大功能，以建立能夠與資料庫等外部系統互動的 Agent。透過將資料庫操作抽象為技能，開發人員可以輕鬆地建構複雜的、由語言驅動的應用程式。

有關更進階的用例和其他範例，請參閱以下文件：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    深入了解如何透過模型情境協定連接到外部系統。
  </x-card>
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    探索用於與語言模型互動和使用工具的主要 Agent。
  </x-card>
</x-cards>