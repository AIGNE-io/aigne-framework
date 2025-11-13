# MCP Server

本指南提供了將 AIGNE 框架 Agents 作為模型上下文協議（Model Context Protocol，MCP）伺服器執行的全面演練。透過遵循這些步驟，您將能夠將自訂的 Agents 作為工具暴露給任何與 MCP 相容的用戶端（例如 Claude Code），從而有效地擴展您的 AI 助理的能力。

## 總覽

[模型上下文協議（MCP）](https://modelcontextprotocol.io) 是一個開放標準，旨在使 AI 助理能夠安全地連接到各種資料來源和工具。透過實作一個 MCP 伺服器，您可以讓任何支援該協議的用戶端使用您的 AIGNE Agents。這使您能夠用您 Agents 中定義的專業技能和功能來增強 AI 助理。

本範例展示了如何使用 [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) 來提供來自 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 的 Agents，並將它們連接到像 Claude Code 這樣的用戶端。

下圖說明了將 AIGNE 框架 Agents 作為 MCP 伺服器執行，並將其連接到像 Claude Code 這樣與 MCP 相容的用戶端的工作流程：

```d2
direction: down

Client: {
  label: "MCP 用戶端\n（例如 Claude Code）"
  shape: rectangle
}

Developer: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

MCP-Server-Container: {
  label: "MCP 伺服器 (localhost)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Server: {
    label: "@aigne/example-mcp-server"
  }

  AIGNE-Agents: {
    label: "AIGNE 框架 Agents"
    shape: rectangle
    grid-columns: 3

    Current-Time-Agent: {
      label: "Current Time Agent"
    }
    Poet-Agent: {
      label: "Poet Agent"
    }
    System-Info-Agent: {
      label: "System Info Agent"
    }
  }
}

Model-Providers: {
  label: "AI 模型提供者"
  shape: rectangle

  Official-AIGNE-Hub: {
    label: "官方 AIGNE Hub"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "自架 AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "第三方提供者\n（例如 OpenAI）"
  }
}

Observability-Server: {
  label: "AIGNE 可觀測性伺服器"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. npx ... serve-mcp"
Developer -> Client: "2. claude mcp add ..."
Client -> MCP-Server-Container.MCP-Server: "3. 叫用 Agent 技能"
MCP-Server-Container.MCP-Server -> MCP-Server-Container.AIGNE-Agents: "4. 執行 Agent 邏輯"
MCP-Server-Container.AIGNE-Agents -> Model-Providers: "5. 連接到 AI 模型"
Model-Providers -> MCP-Server-Container.AIGNE-Agents: "6. 回傳模型輸出"
MCP-Server-Container.AIGNE-Agents -> MCP-Server-Container.MCP-Server: "7. 傳送結果"
MCP-Server-Container.MCP-Server -> Client: "8. 回傳技能輸出"
Developer -> AIGNE-CLI: "（選用）npx aigne observe"
AIGNE-CLI -> Observability-Server: "啟動伺服器"
MCP-Server-Container.MCP-Server -> Observability-Server: "傳送執行追蹤"
```

## 先決條件

在開始之前，請確保您的開發環境符合以下要求：

*   **Node.js**：20.0 或更高版本。
*   **npm**：隨您的 Node.js 安裝一同提供。
*   **OpenAI API 金鑰**：與 OpenAI 模型互動的 Agents 需要此金鑰。您可以從 [OpenAI API keys 頁面](https://platform.openai.com/api-keys) 取得。

## 快速入門

您可以使用 `npx` 直接啟動 MCP 伺服器，無需任何本地安裝。

### 1. 執行 MCP 伺服器

在您的終端機中執行以下命令，以在 `3456` 連接埠上啟動伺服器：

```bash serve-mcp.sh icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

成功啟動後，您將看到以下輸出，表示伺服器正在執行並準備好接受連線。

```bash Output
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. 連接到 AI 模型

MCP 伺服器提供的 Agents 需要一個底層的 AI 模型才能運作。當您第一次執行伺服器時，系統會提示您連接到一個模型提供者。您有幾個選項：

#### 選項 A：透過官方 AIGNE Hub 連接

這是推薦給新使用者的選項。
1.  在終端機提示中選擇第一個選項。
2.  您的網頁瀏覽器將打開官方 AIGNE Hub 網站。
3.  按照螢幕上的指示登入或註冊。新使用者會自動獲得 400,000 個 tokens 的起始額度。

#### 選項 B：透過自架的 AIGNE Hub 連接

如果您有自架的 AIGNE Hub 實例：
1.  選擇第二個選項。
2.  輸入您自架 AIGNE Hub 的 URL。
3.  按照提示完成連接。
    - 若要設定您自己的 AIGNE Hub，您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安裝。

#### 選項 C：透過第三方模型提供者連接

您可以透過為 API 金鑰設定環境變數，直接連接到像 OpenAI 這樣的第三方提供者。

```bash configure-api-key.sh icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

設定環境變數後，重新啟動 MCP 伺服器命令。有關設定其他提供者（如 DeepSeek 或 Google Gemini）的資訊，請參閱範例專案中的 `.env.local.example` 檔案。

## 可用的 Agents

本範例將幾個預先建置的 Agents 作為 MCP 工具暴露出來，每個都有不同的功能：

*   **Current Time Agent** (`agents/current-time.js`)：提供目前的日期和時間。
*   **Poet Agent** (`agents/poet.yaml`)：生成詩歌和其他創意文字格式。
*   **System Info Agent** (`agents/system-info.js`)：擷取並顯示主機系統的資訊。

## 連接到 MCP 用戶端

一旦您的 MCP 伺服器開始執行，您就可以將它連接到任何相容的用戶端。以下範例使用 [Claude Code](https://claude.ai/code)。

### 將 MCP 伺服器新增至 Claude Code

執行以下命令，將您的本地 MCP 伺服器作為名為 `test` 的工具來源新增到 Claude Code 中：

```bash add-mcp-server.sh icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

### 從 Claude Code 叫用 Agents

您現在可以直接從 Claude Code 介面叫用 Agents 的技能。

**範例 1：叫用 System Info Agent**
若要取得系統資訊，您可以提出一個觸發 `system-info` 技能的問題。

![從 Claude Code 呼叫 System Info Agent](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

**範例 2：叫用 Poet Agent**
若要生成一首詩，請提出一個呼叫 `poet` 技能的請求。

![從 Claude Code 呼叫 Poet Agent](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## 偵錯與觀測

AIGNE 框架包含一個強大的可觀測性工具，讓您能夠即時監控和偵錯 Agent 的執行情況。

### 啟動可觀測性伺服器

若要啟動本地監控儀表板，請在新的終端機視窗中執行以下命令：

```bash aigne-observe.sh icon=lucide:terminal
npx aigne observe --port 7890
```

### 查看執行追蹤

打開您的網頁瀏覽器並導覽至 `http://localhost:7890`。該儀表板提供了一個使用者友善的介面，可用於檢查追蹤、查看每個 Agent 呼叫的詳細資訊，並了解執行流程。這是用於偵錯、效能調校以及深入了解 Agent 行為的重要工具。

![在 AIGNE 可觀測性儀表板中查看 Poet Agent 的追蹤。](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

## 總結

您現在已成功啟動一個 MCP 伺服器，將 AIGNE Agents 作為工具暴露出來，並將它們連接到一個 MCP 用戶端。這種強大的模式讓您能夠創建自訂、可重複使用的技能，並將它們無縫整合到 AI 助理的工作流程中。

如需更進階的範例和 Agent 類型，您可以探索 [範例](./examples.md) 部分的其他文件。若要了解更多關於創建您自己的 Agents 的資訊，請參閱[開發者指南](./developer-guide-core-concepts-agents.md)。