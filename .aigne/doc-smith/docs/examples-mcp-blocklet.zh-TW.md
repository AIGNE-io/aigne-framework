# MCP Blocklet

本文件說明如何利用 AIGNE 框架和模型情境協定（Model Context Protocol, MCP）與託管在 Blocklet 平台上的應用程式進行互動。此範例支援一次性執行、互動式聊天模式，以及模型和 I/O 管線的自訂設定。

## 先決條件

在繼續之前，請確保您的系統上已安裝並設定了以下元件：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 安裝一同提供。
*   **OpenAI API 金鑰**：與 OpenAI 模型互動時需要。您可以從 [OpenAI API 金鑰頁面](https://platform.openai.com/api-keys) 取得。

以下依賴項是可選的，僅在您打算從原始碼執行範例時才需要：

*   **Bun**：一個 JavaScript 執行環境，此處用於執行測試和範例。
*   **pnpm**：一個套件管理器。

## 快速入門

本節提供直接執行範例而無需本地安裝的說明。

### 執行範例

首先，將您的目標 Blocklet 應用程式的 URL 設定為環境變數。

```bash 設定您的 Blocklet 應用程式 URL icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

您可以在多種模式下執行此範例：

*   **一次性模式（預設）**：傳送單一請求並接收回應。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-blocklet
    ```

*   **互動式聊天模式**：啟動一個連續的聊天會話。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-blocklet --chat
    ```

*   **管線輸入**：使用管道輸入作為提示。

    ```bash icon=lucide:terminal
    echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
    ```

### 連接到 AI 模型

執行此範例需要連接到一個 AI 模型。在首次執行時，如果沒有設定連接，系統將提示您選擇一種連接方法。

![首次連接提示 AI 模型設定](../../../examples/mcp-blocklet/run-example.png)

有幾種方法可以建立連接：

#### 1. 透過官方 AIGNE Hub 連接

這是建議的方法。選擇此選項將在您的網頁瀏覽器中開啟官方 AIGNE Hub 的驗證頁面。請按照螢幕上的指示完成連接。新使用者將自動獲得 400,000 個 token 供使用。

![授權 AIGNE CLI 連接到 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 透過自行託管的 AIGNE Hub 連接

如果您自行營運 AIGNE Hub 實例，請選擇第二個選項。系統會提示您輸入自行託管的 Hub 的 URL 以完成連接。

![輸入您自行託管的 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

若要部署自行託管的 AIGNE Hub，您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes) 安裝。

#### 3. 透過第三方模型供應商連接

您可以透過設定適當的 API 金鑰作為環境變數，直接連接到第三方模型供應商，例如 OpenAI。

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

有關各種供應商（例如 DeepSeek、Google Gemini）支援的環境變數的完整列表，請參閱範例原始碼中的 `.env.local.example` 檔案。設定好環境變數後，再次執行範例指令。

### 偵錯

AIGNE 框架包含一個本地可觀察性伺服器，用於監控和分析 Agent 執行資料。此工具對於偵錯、效能調整和理解 Agent 行為至關重要。

要啟動伺服器，請執行以下指令：

```bash 啟動觀察伺服器 icon=lucide:terminal
aigne observe
```

![顯示 aigne observe 指令正在執行的終端機輸出](../../../examples/images/aigne-observe-execute.png)

伺服器執行後，您可以透過 `http://localhost:7893` 存取網頁介面，查看最近的 Agent 追蹤列表並檢查詳細的呼叫資訊。

![顯示追蹤列表的 Aigne 可觀察性網頁介面](../../../examples/images/aigne-observe-list.png)

## 從原始碼安裝

出於開發目的，您可以從存放庫的本地副本執行此範例。

### 1. 複製存放庫

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例目錄並使用 `pnpm` 安裝所需的套件。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. 執行範例

執行啟動腳本以執行應用程式。

```bash 在一次性模式下執行 icon=lucide:terminal
pnpm start
```

您也可以直接將 Blocklet 應用程式的 URL 作為參數提供。

```bash icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## 執行選項

此應用程式支援多個用於自訂的命令列參數。

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--chat` | 啟用互動式聊天模式。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式為 `provider[:model]`。範例：`openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 供應商預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 供應商預設值 |
| `--presence-penalty <value>`| 設定存在懲罰值。 | 供應商預設值 |
| `--frequency-penalty <value>`| 設定頻率懲罰值。 | 供應商預設值 |
| `--log-level <level>` | 設定日誌記錄等級。選項：`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接透過命令列提供輸入。 | 無 |

當使用 `pnpm` 從原始碼執行時，您必須使用 `--` 來將參數傳遞給腳本。

**範例：**

```bash 在互動式聊天模式下執行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 將日誌記錄等級設定為 DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 使用管線輸入 icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## 總結

本指南詳細介紹了執行 MCP Blocklet 範例的流程，包括快速入門執行、模型設定、偵錯和本地安裝。有關更進階的用例和相關概念，請參閱以下文件。

<x-cards data-columns="2">
  <x-card data-title="MCP 伺服器" data-icon="lucide:server" data-href="/examples/mcp-server">
    了解如何將 AIGNE 框架 Agent 作為模型情境協定（MCP）伺服器執行。
  </x-card>
  <x-card data-title="MCP Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/mcp-agent">
    了解如何透過 MCP 連接並與外部系統互動。
  </x-card>
</x-cards>