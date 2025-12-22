# MCP GitHub

本文件為一份綜合指南，介紹一個範例，示範如何使用 AIGNE 框架和 GitHub MCP (Model Context Protocol) 伺服器與 GitHub 存放庫互動。您將學習如何設定和執行此範例，讓 AI agent 能夠執行各種 GitHub 操作，例如搜尋存放庫和管理檔案。

## 概覽

此範例展示了 `MCPAgent` 與 GitHub MCP 伺服器連接的整合。此 agent 為 AI 提供了一套工具（技能），以便與 GitHub API 互動。工作流程允許使用者以自然語言提出請求，然後 AI agent 將其轉換為對 GitHub agent 的特定函式呼叫，以執行諸如搜尋存放庫、讀取檔案內容或建立 issue 等操作。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AIAgent: {
    label: "AI Agent\n(@aigne/core)"
    shape: rectangle
  }

  MCPAgent: {
    label: "GitHub MCP Agent\n(技能)"
    shape: rectangle
  }

  AIAgent -> MCPAgent: "使用技能"
}

GitHub-MCP-Server: {
  label: "GitHub MCP 伺服器\n(@modelcontextprotocol/server-github)"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

AI-Model-Provider: {
  label: "AI 模型提供者\n(例如 OpenAI、AIGNE Hub)"
  shape: cylinder
}

AIGNE-Observe: {
  label: "AIGNE Observe\n(偵錯 UI)"
  shape: rectangle
}

User -> AIGNE-Framework.AIAgent: "1. 自然語言請求"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "2. 處理請求"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "3. 回傳函式呼叫"
AIGNE-Framework.AIAgent -> AIGNE-Framework.MCPAgent: "4. 執行函式呼叫"
AIGNE-Framework.MCPAgent -> GitHub-MCP-Server: "5. 傳送指令"
GitHub-MCP-Server -> GitHub-API: "6. 呼叫 GitHub API"
GitHub-API -> GitHub-MCP-Server: "7. 回傳 API 回應"
GitHub-MCP-Server -> AIGNE-Framework.MCPAgent: "8. 回傳結果"
AIGNE-Framework.MCPAgent -> AIGNE-Framework.AIAgent: "9. 回傳結果"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "10. 處理結果"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "11. 回傳自然語言回應"
AIGNE-Framework.AIAgent -> User: "12. 最終回應"
AIGNE-Framework -> AIGNE-Observe: "傳送執行追蹤"
```

## 先決條件

在繼續之前，請確保您的系統符合以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 一併安裝。
*   **GitHub Personal Access Token**：一個具有您打算互動的存放庫所需權限的權杖。您可以從您的 [GitHub 設定](https://github.com/settings/tokens) 建立一個。
*   **AI 模型提供者帳戶**：來自像 [OpenAI](https://platform.openai.com/api-keys) 這樣提供者的 API 金鑰，或與 AIGNE Hub 實例的連線。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需在本機安裝。

首先，將您的 GitHub 權杖設定為環境變數。

```bash 設定您的 GitHub 權杖 icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

接著，執行此範例。

```bash 執行範例 icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### 連線至 AI 模型

首次執行時，如果未設定 AI 模型，系統會提示您連線一個。


您有幾個選項可以繼續：

#### 1. 連線至官方 AIGNE Hub

這是建議的方法。選擇此選項將在瀏覽器中開啟官方 AIGNE Hub 頁面。請按照螢幕上的指示授權連線。新使用者會收到免費的點數以開始使用。


#### 2. 連線至自行託管的 AIGNE Hub

如果您有自己運作的 AIGNE Hub 實例，請選擇此選項。系統會提示您輸入自行託管 Hub 的 URL 以完成連線。


#### 3. 設定第三方模型提供者

您也可以直接連線至支援的第三方模型提供者，例如 OpenAI。為此，請將該提供者的 API 金鑰設定為環境變數。

例如，若要使用 OpenAI，請設定您的 `OPENAI_API_KEY`：

```bash 設定您的 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定環境變數後，再次執行 `npx` 指令。有關其他提供者支援的環境變數列表，請參閱專案原始碼中的 `.env.local.example` 檔案。

## 從原始碼安裝

對於希望檢查或修改程式碼的開發者，請按照以下步驟從本機複製的專案執行範例。

### 1. 複製存放庫

從 GitHub 複製主要的 AIGNE 框架存放庫。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴套件

導覽至範例的目錄，並使用 `pnpm` 安裝必要的依賴套件。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-github
pnpm install
```

### 3. 執行範例

執行啟動腳本以執行範例。

```bash 以單次執行模式執行 icon=lucide:terminal
pnpm start
```

此範例也支援互動式聊天模式，並可接受來自其他指令的管道輸入。

```bash 以互動式聊天模式執行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 使用管道輸入 icon=lucide:terminal
echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
```

### 命令列選項

您可以使用以下命令列參數來自訂執行方式：

| 參數 | 說明 | 預設值 |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat` | 以互動式聊天模式執行。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 提供者預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 提供者預設值 |
| `--presence-penalty <value>` | 設定 presence penalty 值。 | 提供者預設值 |
| `--frequency-penalty <value>` | 設定 frequency penalty 值。 | 提供者預設值 |
| `--log-level <level>` | 設定記錄層級（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input, -i <input>` | 直接以參數方式指定輸入。 | 無 |

## 程式碼範例

以下 TypeScript 程式碼展示了此範例的核心邏輯。它會初始化一個 AI 模型，為 GitHub 設定 `MCPAgent`，並叫用一個 `AIAgent` 來執行存放庫搜尋。

```typescript index.ts
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 載入環境變數
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;

// 初始化 OpenAI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 初始化 GitHub MCP agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// 建立帶有模型和 GitHub 技能的 AIGNE 實例
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// 建立一個帶有與 GitHub 互動指令的 AI agent
const agent = AIAgent.from({
  instructions: `\
## GitHub 互動助理
您是一個協助使用者與 GitHub 存放庫互動的助理。
您可以執行各種 GitHub 操作，例如：
1. 搜尋存放庫
2. 取得檔案內容
3. 建立或更新檔案
4. 建立 issue 和 pull request
5. 以及更多 GitHub 操作

請務必提供清晰、簡潔的回應，並附上來自 GitHub 的相關資訊。
`,
});

// 叫用 agent 搜尋存放庫
const result = await aigne.invoke(
  agent,
  "Search for repositories related to 'modelcontextprotocol'",
);

console.log(result);
// 預期輸出：
// I found several repositories related to 'modelcontextprotocol':
//
// 1. **modelcontextprotocol/servers** - MCP servers for various APIs and services
// 2. **modelcontextprotocol/modelcontextprotocol** - The main ModelContextProtocol repository
// ...

// 完成後關閉 AIGNE 實例
await aigne.shutdown();
```

## 可用操作

GitHub MCP 伺服器將廣泛的 GitHub 功能公開為 AI agent 可使用的技能，包括：

*   **存放庫操作**：搜尋、建立和取得關於存放庫的資訊。
*   **檔案操作**：取得檔案內容、建立或更新檔案，以及在單一 commit 中推送多個檔案。
*   **Issue 和 PR 操作**：建立 issue 和 pull request、新增留言以及合併 pull request。
*   **搜尋操作**：搜尋程式碼、issue 和使用者。
*   **Commit 操作**：列出 commit 並取得 commit 的詳細資訊。

## 使用 AIGNE Observe 進行偵錯

要檢查和分析您的 agent 的行為，您可以使用 `aigne observe` 指令。此工具會啟動一個本機網頁伺服器，提供一個使用者介面，用於檢視執行追蹤、呼叫詳細資訊和其他執行期資料。

要啟動觀察伺服器，請執行：

```bash 啟動 AIGNE observe 伺服器 icon=lucide:terminal
aigne observe
```


伺服器執行後，您可以在瀏覽器中存取網頁介面，檢視最近執行的列表，並深入查看每個追蹤的詳細資訊。


此工具對於偵錯、了解 agent 如何與工具和模型互動，以及最佳化效能非常有價值。