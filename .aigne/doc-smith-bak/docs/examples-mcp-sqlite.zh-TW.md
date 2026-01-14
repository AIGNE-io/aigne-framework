# MCP SQLite

本指南全面介紹如何使用由 AIGNE 框架驅動的 AI agent 與 SQLite 資料庫進行互動。透過遵循這些步驟，您將學會如何設定必要的元件、執行範例應用程式，並使用 agent 執行建立資料表和查詢資料等資料庫操作。

此範例的核心是使用 `MCPAgent` 連接到一個正在執行的 [SQLite MCP 伺服器](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)。該伺服器將資料庫功能公開為技能，`AIAgent` 可以根據使用者提示智慧地呼叫這些技能。

```d2
direction: down

User: {
  shape: c4-person
}

App: {
  label: "@aigne/example-mcp-sqlite"
  shape: rectangle

  AIGNE-Framework: {
    label: "AIGNE 框架 (@aigne/core)"
    shape: rectangle

    AIGNE-Instance: {
      label: "AIGNE 實例"
    }

    AIAgent: {
      label: "AIAgent"
    }

    MCPAgent: {
      label: "MCPAgent"
    }
  }

  AI-Model: {
    label: "AI 模型\n（例如 OpenAI）"
    shape: rectangle
  }
}

SQLite-MCP-Server: {
  label: "SQLite MCP 伺服器"
  shape: rectangle
}

SQLite-DB: {
  label: "SQLite 資料庫\n(usages.db)"
  shape: cylinder
}

User -> App: "1. 執行指令\n（例如『建立一個產品資料表』）"
App.AIGNE-Framework.AIAgent -> App.AI-Model: "2. 解釋提示"
App.AI-Model -> App.AIGNE-Framework.AIAgent: "3. 回傳所需的技能呼叫"
App.AIGNE-Framework.AIAgent -> App.AIGNE-Framework.MCPAgent: "4. 呼叫技能"
App.AIGNE-Framework.MCPAgent -> SQLite-MCP-Server: "5. 傳送指令"
SQLite-MCP-Server -> SQLite-DB: "6. 執行 SQL"
SQLite-DB -> SQLite-MCP-Server: "7. 回傳結果"
SQLite-MCP-Server -> App.AIGNE-Framework.MCPAgent: "8. 傳送回應"
App.AIGNE-Framework.MCPAgent -> App.AIGNE-Framework.AIAgent: "9. 轉發回應"
App.AIGNE-Framework.AIAgent -> App: "10. 處理最終輸出"
App -> User: "11. 顯示結果訊息"
```

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求。為成功執行此範例，必須遵守這些先決條件。

*   **Node.js：** 20.0 或更高版本。
*   **npm：** Node.js 套件管理器，隨 Node.js 一併安裝。
*   **uv：** 一個 Python 套件安裝程式。執行 SQLite MCP 伺服器所需。安裝說明可在 [`uv` 官方儲存庫](https://github.com/astral-sh/uv)找到。
*   **AI 模型 API 金鑰：** AI agent 需要來自支援的供應商的 API 金鑰才能運作。此範例預設使用 OpenAI，但也支援其他供應商。您可以從其平台取得 [OpenAI API 金鑰](https://platform.openai.com/api-keys)。

對於打算從原始碼執行範例的開發人員，還需要以下相依套件：

*   **Pnpm：** 一個快速、節省磁碟空間的套件管理器。
*   **Bun：** 一個快速的 JavaScript 多合一工具包，用於執行測試和範例。

## 快速入門

本節提供直接執行範例的說明，無需手動安裝，這是進行初步評估最有效率的方法。

應用程式可以一次性模式執行單一指令，也可以在互動式聊天模式下執行，或直接將輸入透過管道傳送給腳本。

在您的終端機中執行以下指令之一：

```bash title="以一次性模式執行（預設）" icon=lucide:terminal
npx -y @aigne/example-mcp-sqlite
```

```bash title="以互動式聊天模式執行" icon=lucide:terminal
npx -y @aigne/example-mcp-sqlite --interactive
```

```bash title="使用管道輸入" icon=lucide:terminal
echo "create a product table with columns name description and createdAt" | npx -y @aigne/example-mcp-sqlite
```

## 連接到 AI 模型

AI agent 需要連接到大型語言模型 (LLM) 以處理指令。如果您在未預先設定模型的情況下執行範例，系統將提示您選擇一種連接方法。

![未設定 AI 模型時的初始連接提示。](../../../examples/mcp-sqlite/run-example.png)

建立此連接主要有三種方法：

### 1. 連接到官方 AIGNE Hub

這是推薦給新使用者的方法。它提供了一個簡化的、基於瀏覽器的驗證流程。新使用者會收到免費的點數來測試平台。

1.  選擇第一個選項：`Connect to the Arcblock official AIGNE Hub`。
2.  您的預設網頁瀏覽器將開啟一個授權頁面。
3.  按照螢幕上的說明批准連接。

![將 AIGNE CLI 連接到 AIGNE Hub 的授權提示。](../../../examples/images/connect-to-aigne-hub.png)

### 2. 連接到自架的 AIGNE Hub

如果您的組織營運一個私有的 AIGNE Hub 實例，請選擇第二個選項並提供您的 Hub 的 URL 以完成連接。

![提示輸入自架 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

### 3. 透過第三方模型供應商連接

您可以透過將適當的 API 金鑰設定為環境變數，直接連接到支援的第三方模型供應商，例如 OpenAI。

例如，要連接到 OpenAI，請設定 `OPENAI_API_KEY` 變數：

```bash title="設定 OpenAI API 金鑰" icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

設定環境變數後，重新執行 `npx` 指令。有關支援的供應商及其所需環境變數的完整列表，請參閱儲存庫中的範例 `.env.local.example` 檔案。

## 從原始碼安裝

對於希望檢查或修改原始碼的開發人員，請按照以下步驟複製儲存庫並在本地執行範例。

### 1. 複製儲存庫

將官方 AIGNE 框架儲存庫複製到您的本地機器。

```bash title="複製儲存庫" icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝相依套件

導覽至範例目錄並使用 `pnpm` 安裝所需的相依套件。

```bash title="安裝相依套件" icon=lucide:terminal
cd aigne-framework/examples/mcp-sqlite
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令執行應用程式。

```bash title="以一次性模式執行（預設）" icon=lucide:terminal
pnpm start
```

若要在互動模式下執行或使用管道輸入，請在 `--` 分隔符後附加所需的旗標。

```bash title="以互動式聊天模式執行" icon=lucide:terminal
pnpm start -- --interactive
```

```bash title="使用管道輸入" icon=lucide:terminal
echo "create a product table with columns name description and createdAt" | pnpm start
```

### 命令列選項

應用程式支援多個命令列參數來自訂其行為。

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--interactive` | 啟用互動式聊天模式。 | 停用（一次性） |
| `--model <provider[:model]>` | 指定 AI 模型。格式：`'provider[:model]'`。 | `openai` |
| `--temperature <value>` | 設定模型的生成溫度。 | 供應商預設值 |
| `--top-p <value>` | 設定模型的 top-p 取樣值。 | 供應商預設值 |
| `--presence-penalty <value>`| 設定模型的存在懲罰。 | 供應商預設值 |
| `--frequency-penalty <value>`| 設定模型的頻率懲罰。 | 供應商預設值 |
| `--log-level <level>` | 設定記錄詳細程度（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入。 | `None` |

## 程式碼範例

以下 TypeScript 程式碼展示了設定和呼叫 AI agent 與 SQLite 資料庫互動的核心邏輯。

該腳本初始化一個 `OpenAIChatModel`，啟動一個連接到 SQLite 伺服器的 `MCPAgent`，並使用模型和 agent 的技能設定一個 `AIGNE` 實例。最後，它以具體指令呼叫一個 `AIAgent` 來執行資料庫任務。

```typescript title="index.ts" icon=logos:typescript-icon
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化聊天模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 將 SQLite MCP 伺服器作為受管理的子程序啟動
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"),
  ],
});

// 3. 使用模型和 MCP 技能設定 AIGNE 實例
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 4. 以具體指令定義 AI agent
const agent = AIAgent.from({
  instructions: "你是一名資料庫管理員",
});

// 5. 呼叫 agent 建立資料表
console.log(
  await aigne.invoke(
    agent,
    "create a product table with columns name description and createdAt",
  ),
);
// 預期輸出：
// {
//   $message: "產品資料表已成功建立，包含以下欄位：`name`、`description` 和 `createdAt`。",
// }

// 6. 呼叫 agent 插入資料
console.log(await aigne.invoke(agent, "create 10 products for test"));
// 預期輸出：
// {
//   $message: "我已成功在資料庫中建立 10 個測試產品...",
// }

// 7. 呼叫 agent 查詢資料
console.log(await aigne.invoke(agent, "how many products?"));
// 預期輸出：
// {
//   $message: "資料庫中有 10 個產品。",
// }

// 8. 關閉 AIGNE 實例和 MCP 伺服器
await aigne.shutdown();
```

## 偵錯

要監控和分析 agent 的執行流程，您可以使用 `aigne observe` 指令。此工具會啟動一個本地網頁伺服器，提供追蹤、工具呼叫和模型互動的詳細視圖，這對於偵錯和效能分析非常有價值。

1.  **啟動觀察伺服器：**

    ```bash title="啟動可觀察性伺服器" icon=lucide:terminal
    aigne observe
    ```

    ![終端機輸出顯示 aigne observe 指令已啟動伺服器。](../../../examples/images/aigne-observe-execute.png)

2.  **檢視追蹤：**

    在您的網頁瀏覽器中開啟提供的 URL（例如 `http://localhost:7893`）以存取可觀察性介面。「Traces」頁面列出了最近的 agent 執行。

    ![顯示 agent 執行追蹤列表的 AIGNE 可觀察性介面。](../../../examples/images/aigne-observe-list.png)

    從這裡，您可以選擇單個追蹤來檢查完整的操作序列，包括傳送給模型的提示、agent 呼叫的技能以及最終輸出。
