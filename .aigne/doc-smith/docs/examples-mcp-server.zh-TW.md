本指南說明如何將 AIGNE 框架 Agent 作為模型上下文協議 (Model Context Protocol, MCP) 伺服器執行。讀完本文件後，您將能夠啟動伺服器，將其連接到 AI 模型，並使用像 Claude Code 這樣與 MCP 相容的用戶端與您的 Agent 互動。

模型上下文協議 (MCP) 是一個開放標準，旨在讓 AI 助理能夠安全地連接到各種資料來源和工具。透過將 AIGNE Agent 作為 MCP 伺服器公開，您可以使用自訂 Agent 的專業技能和能力來增強與 MCP 相容的用戶端。

下圖說明了 AIGNE MCP 伺服器如何將您的 Agent 連接到 AI 模型和與 MCP 相容的用戶端。

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![本指南說明如何將 AIGNE 框架 Agent 作為模型上下文協議...](assets/diagram/examples-mcp-server-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js：** 20.0 或更高版本。
*   **AI 模型存取權限：** 支援的大型語言模型提供商（例如 OpenAI）的 API 金鑰。

## 快速入門

您可以使用 `npx` 直接執行範例，無需在本機安裝。

### 1. 執行 MCP 伺服器

在您的終端機中執行以下指令，以下載並啟動 MCP 伺服器範例：

```sh serve-mcp icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

成功執行後，伺服器將會啟動，您會看到以下輸出，確認 MCP 伺服器已啟動並正在監聽連線。

```sh Expected Output icon=lucide:terminal
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. 連接到 AI 模型

MCP 伺服器需要連接到一個大型語言模型才能運作。如果您是第一次執行伺服器，命令列提示將引導您完成連接過程。

![用於連接到 AI 模型的終端機提示。](../../../examples/mcp-server/run-example.png)

您有三個主要選項可以連接到 AI 模型：

#### 選項 1：AIGNE Hub（建議）

連接到官方的 AIGNE Hub 以快速開始。新使用者會收到免費點數，這使其成為最直接的評估選項。在提示中選擇第一個選項，您的網頁瀏覽器將會開啟以引導您完成授權過程。

![AIGNE Hub 授權頁面。](../../../examples/images/connect-to-aigne-hub.png)

#### 選項 2：自行託管的 AIGNE Hub

如果您的組織使用自行託管的 AIGNE Hub 執行個體，請選擇第二個選項，並在出現提示時輸入您的 Hub 執行個體的 URL。

![提示輸入自行託管的 AIGNE Hub URL 的終端機。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 選項 3：第三方模型提供商

您可以透過設定適當的環境變數，直接連接到第三方模型提供商。例如，要使用 OpenAI，請在執行伺服器指令之前匯出您的 API 金鑰。

```sh Configure OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定環境變數後，重新啟動 `serve-mcp` 指令。

## 可用的 Agent

此範例將幾個預先配置的 Agent 作為 MCP 工具公開，每個 Agent 都有不同的功能：

*   **Current Time Agent：** 提供目前時間。定義於 `agents/current-time.js`。
*   **Poet Agent：** 生成詩歌和其他創意文本格式。定義於 `agents/poet.yaml`。
*   **System Info Agent：** 檢索有關主機系統的資訊。定義於 `agents/system-info.js`。

## 連接到 MCP 用戶端

一旦 MCP 伺服器開始執行，您就可以從任何與 MCP 相容的用戶端連接到它。以下範例使用 Claude Code。

首先，確保您已安裝 [Claude Code](https://claude.ai/code)。然後，使用以下指令將 AIGNE MCP 伺服器新增為工具來源：

```sh Add MCP Server to Claude icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

新增伺服器後，您可以直接從 Claude Code 介面叫用 Agent 的技能。

## 觀察 Agent 執行情況

AIGNE 框架包含一個可觀測性工具，可讓您即時監控和偵錯 Agent 的行為。此工具對於分析追蹤、檢查輸入和輸出以及了解 Agent 效能至關重要。

### 1. 啟動觀察器

若要啟動本機可觀測性 Web 伺服器，請在新的終端機視窗中執行以下指令：

```sh Start Observability Server icon=lucide:terminal
npx aigne observe --port 7890
```

伺服器將啟動並提供一個 URL 以存取儀表板。

![顯示可觀測性伺服器正在執行的終端機輸出。](../../../examples/images/aigne-observe-execute.png)

### 2. 查看追蹤

在您的網頁瀏覽器中開啟 `http://localhost:7890` 以存取 AIGNE 可觀測性儀表板。「Traces」視圖提供了最近 Agent 執行的列表，包括延遲、權杖使用量和狀態等詳細資訊。

![顯示追蹤列表的 Aigne 可觀測性介面。](../../../examples/images/aigne-observe-list.png)