# MCP GitHub

本文件為一個範例提供了全面的指南，展示如何與 GitHub 儲存庫互動。讀完本指南後，您將能夠執行一個 AI Agent，該 Agent 可以使用 AIGNE 框架和 GitHub 模型情境協定（MCP）伺服器來搜尋儲存庫、讀取檔案內容以及執行其他與 GitHub 相關的任務。

## 總覽

此範例展示了 AIGNE 框架與 GitHub MCP 伺服器的整合，使 AI Agent 能夠將 GitHub 的 API 作為一組工具來使用。該 Agent 可以在單一指令（one-shot）模式或互動式聊天模式下執行，從而實現靈活的互動。

涉及的核心元件包括：
- **AI Agent**：負責理解使用者請求和協調任務的主要 Agent。
- **GitHub MCP Agent**：一個專門的 Agent，用於連接到 GitHub MCP 伺服器，將其功能（如搜尋儲存庫、讀取檔案）公開為技能。

下圖說明了這些元件之間的關係以及資訊流：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
    "理解使用者請求\n並協調任務"
  }

  GitHub-MCP-Agent: {
    label: "GitHub MCP Agent"
    shape: rectangle
    "將 GitHub 伺服器的\n功能公開為技能"
  }
}

GitHub-MCP-Server: {
  label: "GitHub MCP 伺服器"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "1. 傳送請求（例如：搜尋儲存庫）"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.GitHub-MCP-Agent: "2. 使用 GitHub 技能"
AIGNE-Framework.GitHub-MCP-Agent -> GitHub-MCP-Server: "3. 連接並傳送指令"
GitHub-MCP-Server -> GitHub-API: "4. 進行 API 呼叫"
GitHub-API -> GitHub-MCP-Server: "5. 回傳資料"
GitHub-MCP-Server -> AIGNE-Framework.GitHub-MCP-Agent: "6. 轉發回應"
AIGNE-Framework.GitHub-MCP-Agent -> AIGNE-Framework.AI-Agent: "7. 回傳技能執行結果"
AIGNE-Framework.AI-Agent -> User: "8. 呈現最終答案"
```

要深入了解 MCP Agent 的運作方式，請參考 [MCP Agent](./developer-guide-agents-mcp-agent.md) 文件。

## 先決條件

在繼續之前，請確保滿足以下要求：

- **Node.js**：版本 20.0 或更高。您可以從 [nodejs.org](https://nodejs.org) 下載。
- **GitHub 個人存取權杖**：需要一個具有適當儲存庫權限的權杖。您可以從您的 [GitHub 設定](https://github.com/settings/tokens) 中產生一個。
- **AI 模型供應商 API 金鑰**：AI Agent 需要像 OpenAI 這樣的供應商提供的 API 金鑰才能運作。請從 [OpenAI 平台](https://platform.openai.com/api-keys) 取得您的金鑰。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需任何本地安裝。

首先，將您的 GitHub 權杖設定為環境變數。

```sh 設定 GitHub 權杖 icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

接著，執行此範例。

```sh 執行範例 icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### 連接到 AI 模型

首次執行此範例時，系統會提示您連接到一個 AI 模型。您有幾個選項：

1.  **AIGNE Hub（官方）**：選擇此選項以透過官方 AIGNE Hub 連接。瀏覽器將會開啟一個視窗讓您完成連接。新使用者會獲得免費的權杖額度。
2.  **AIGNE Hub（自行託管）**：如果您託管自己的 AIGNE Hub 執行個體，請選擇此選項並提供其 URL 進行連接。
3.  **第三方模型供應商**：若要使用像 OpenAI 這樣的直接供應商，請將對應的 API 金鑰設定為環境變數。

例如，若要使用 OpenAI，請匯出您的 API 金鑰並重新執行指令：

```sh 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
npx -y @aigne/example-mcp-github
```

有關設定其他供應商的更多詳細資訊，請參閱儲存庫中的範例環境檔案。

## 從原始碼安裝

若要進行開發或修改，您可以複製儲存庫並在本地執行此範例。

1.  **複製儲存庫**

    ```sh 複製儲存庫 icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **導覽至目錄並安裝依賴項**

    ```sh 安裝依賴項 icon=lucide:terminal
    cd aigne-framework/examples/mcp-github
    pnpm install
    ```

3.  **執行範例**

    您可以在其預設的單次執行模式、互動式聊天模式下執行 Agent，或直接透過管道輸入。

    ```sh 以單次執行模式執行 icon=lucide:terminal
    pnpm start
    ```

    ```sh 以互動式聊天模式執行 icon=lucide:terminal
    pnpm start -- --chat
    ```

    ```sh 使用管道輸入執行 icon=lucide:terminal
    echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
    ```

### 命令列選項

此應用程式支援多個命令列參數，以進行自訂執行。

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--chat` | 以互動式聊天模式執行 Agent。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 供應商預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 供應商預設值 |
| `--presence-penalty <value>`| 設定存在懲罰值。 | 供應商預設值 |
| `--frequency-penalty <value>`| 設定頻率懲罰值。 | 供應商預設值 |
| `--log-level <level>` | 設定日誌記錄等級（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入。 | 無 |

## 程式碼範例

以下 TypeScript 程式碼展示了設定和執行 GitHub Agent 的核心邏輯。它會初始化 AI 模型和 GitHub MCP Agent，使用 `AIGNE` 將它們結合起來，然後調用一個 `AIAgent` 來執行任務。

```typescript usages.ts icon=logos:typescript
import assert from "node:assert";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 確保環境變數已設定
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(GITHUB_TOKEN, "Please set the GITHUB_TOKEN environment variable");

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 初始化 GitHub MCP Agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// 3. 建立一個帶有模型和 GitHub 技能的 AIGNE 執行個體
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// 4. 建立一個帶有特定指示的 AI Agent
const agent = AIAgent.from({
  instructions: `\
## GitHub 互動助理
您是一個協助使用者與 GitHub 儲存庫互動的助理。
您可以執行各種 GitHub 操作，例如：
1. 搜尋儲存庫
2. 取得檔案內容
3. 建立或更新檔案
4. 建立 issue 和 pull request
5. 以及許多其他的 GitHub 操作

請始終提供清晰、簡潔的回應，並附上來自 GitHub 的相關資訊。
`,
  inputKey: "message",
});

// 5. 調用 Agent 執行任務
const result = await aigne.invoke(agent, {
  message: "Search for repositories related to 'modelcontextprotocol' and limit to 3 results",
});

console.log(result);
// 預期輸出：
// I found the following repositories related to 'modelcontextprotocol':
// 1. **modelcontextprotocol/modelcontextprotocol**: The main repository for the Model Context Protocol.
// 2. **modelcontextprotocol/servers**: A collection of MCP servers for various APIs and services.
// 3. **AIGNE-io/aigne-framework**: The framework for building agentic AI applications.

// 6. 關閉 AIGNE 執行個體
await aigne.shutdown();
```

此腳本展示了一個完整的工作流程：設定必要的元件、定義 Agent 的目的，以及執行一個特定的任務。

## 可用的 GitHub 操作

GitHub MCP 伺服器公開了廣泛的功能。可以指示 AI Agent 執行多個類別的操作：

- **儲存庫操作**：搜尋、建立和擷取儲存庫資訊。
- **檔案操作**：取得檔案內容、建立或更新檔案，以及在單一提交中推送多個檔案。
- **Issue 和 PR 操作**：建立 issue 和 pull request、新增評論以及合併 pull request。
- **搜尋操作**：在 GitHub 上搜尋程式碼、issue 和使用者。
- **提交操作**：列出提交並取得特定提交的詳細資訊。

## 總結

此範例提供了一個實際的示範，說明如何透過模型情境協定建構一個能夠與 GitHub 等外部服務互動的功能性 AI Agent。透過遵循所概述的步驟，您可以快速設定並實驗一個能自動化儲存庫相關任務的 Agent。

欲了解更多關於其他可用範例和進階工作流程的資訊，請探索以下部分：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    了解 MCPAgent 背後的核心概念以及它如何連接到外部工具。
  </x-card>
  <x-card data-title="所有範例" data-icon="lucide:binary" data-href="/examples">
    瀏覽完整的範例列表，以發現 AIGNE 框架的其他功能。
  </x-card>
</x-cards>