# MCP Blocklet

本文件提供一份技術指南，說明如何使用 AIGNE 框架和模型情境協定（MCP）與託管在 Blocklet 平臺上的應用程式進行互動。本文件為開發人員概述了必要的先決條件、快速入門程序、模型連線方法以及進階設定選項。

```d2
direction: down

Developer: {
  shape: c4-person
}

Execution-Environment: {
  label: "執行環境"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Blocklet-Example: {
    label: "@aigne/example-mcp-blocklet"
    shape: rectangle
  }

  AIGNE-Observe: {
    label: "aigne observe"
    shape: rectangle
  }
}

Blocklet-Application: {
  label: "目標 Blocklet 應用程式"
  shape: rectangle
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

AI-Model-Providers: {
  label: "AI 模型提供商"
  shape: rectangle

  AIGNE-Hub-Official: {
    label: "AIGNE Hub（官方）"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "自行託管的 AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "第三方提供商（例如 OpenAI）"
  }
}

Developer -> Execution-Environment.MCP-Blocklet-Example: "透過 `npx` 或 `pnpm start` 執行"
Developer -> Execution-Environment.AIGNE-Observe: "用於偵錯"
Execution-Environment.MCP-Blocklet-Example -> Blocklet-Application: "與之互動"
Execution-Environment.MCP-Blocklet-Example -> AI-Model-Providers: "連線至其中一個"
Execution-Environment.AIGNE-Observe -> Execution-Environment.MCP-Blocklet-Example: "監控執行資料"
```

## 先決條件

在繼續之前，請確保您的本機開發機器上已安裝並正確設定了以下相依套件：

*   **Node.js：** 20.0 或更新版本。
*   **npm：** Node Package Manager，隨 Node.js 一起分發。
*   **OpenAI API 金鑰：** 需要一個有效的 API 金鑰才能與 OpenAI 模型介接。金鑰可以從 [OpenAI API 金鑰頁面](https://platform.openai.com/api-keys)產生。

對於打算從原始碼執行範例的開發人員，還需要以下條件：

*   **Bun：** 一個用於執行單元測試和範例的 JavaScript 執行環境。
*   **pnpm：** 一個用於處理專案相依套件的套件管理器。

## 快速入門

本節概述了透過 `npx` 直接執行範例的程序，此方法不需要在本機安裝專案儲存庫。

首先，設定 `BLOCKLET_APP_URL` 環境變數，使其指向您的目標 Blocklet 應用程式。

```bash 設定 Blocklet 應用程式 URL icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

### 執行模式

該範例支援兩種主要的操作模式。

#### 單次模式

在預設的單次模式下，Agent 處理單個請求後即終止。

```bash 以單次模式執行 icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet
```

也可以透過標準管道提供輸入，這對於指令碼編寫很有用。

```bash 使用管道輸入執行 icon=lucide:terminal
echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
```

#### 互動式聊天模式

若要進行持續的對話式會話，請使用 `--chat` 旗標執行範例。

```bash 以互動模式執行 icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet --chat
```

### 連線到 AI 模型

Agent 需要連線到 AI 模型才能運作。支援以下連線方法。

#### 1. AIGNE Hub（官方）

首次執行時，系統會提示您連線到模型提供商。第一個選項是透過官方 AIGNE Hub 連線，建議新使用者使用。此方法提供託管服務和用於初次使用的免費 token 配額。

#### 2. 自行託管的 AIGNE Hub

或者，您可以連線到自行託管的 AIGNE Hub 實例。選擇第二個選項，並提供您部署的實例的 URL。自行託管的 Hub 可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安裝。

#### 3. 第三方模型提供商

支援透過環境變數直接與第三方模型提供商整合。例如，若要使用 OpenAI，請設定 `OPENAI_API_KEY` 變數。

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

請參考 `.env.local.example` 檔案，以取得支援的提供商及其所需環境變數的完整列表。設定變數後，重新執行 `npx` 指令。

## 從原始碼執行

為了開發或修改的目的，可以從儲存庫的本機副本執行此範例。

### 1. 複製儲存庫

使用 Git 複製 `aigne-framework` 儲存庫。

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝相依套件

導航到範例的目錄，並使用 `pnpm` 安裝相依套件。

```bash 安裝相依套件 icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令以預設的單次模式執行指令碼。

```bash 執行範例 icon=lucide:terminal
pnpm start
```

您也可以將 Blocklet 應用程式的 URL 作為命令列引數提供。

```bash 使用特定 URL 執行 icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## 命令列選項

範例的行為可以透過下面詳述的命令列參數進行修改。當透過 `pnpm start` 從原始碼執行時，指令碼的命令列引數必須以 `--` 開頭。

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--chat` | 以互動式聊天模式執行 Agent。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式：`'provider[:model]'`。範例：`'openai'` 或 `'openai:gpt-4o-mini'`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 提供商預設值 |
| `--top-p <value>` | 設定模型生成的 top-p 取樣值。 | 提供商預設值 |
| `--presence-penalty <value>` | 設定模型生成的 presence penalty 值。 | 提供商預設值 |
| `--frequency-penalty <value>` | 設定模型生成的 frequency penalty 值。 | 提供商預設值 |
| `--log-level <level>` | 設定日誌記錄的詳細程度。可接受的值：`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以引數形式提供輸入。 | `None` |

### 使用範例

```bash 以互動模式執行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 將日誌級別設定為 DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 使用管道輸入 icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## 偵錯

AIGNE 框架包含 `aigne observe`，這是一個命令列工具，可啟動本機 Web 伺服器來監控和分析 Agent 執行資料。此工具對於偵錯、效能分析和理解 Agent 行為至關重要。

在一個專用的終端機會話中啟動觀察伺服器。執行您的 Agent 後，Web 介面將顯示最近執行的列表，提供詳細的追蹤、呼叫資訊和執行時指標。

## 總結

本文件詳細說明了執行 MCP Blocklet 範例的程序，涵蓋了先決條件、使用 `npx` 進行快速入門執行、各種模型連線方法以及從原始碼執行。有關 MCP 整合的更多範例，請參考以下指南。

<x-cards data-columns="2">
  <x-card data-title="MCP 伺服器" data-icon="lucide:server" data-href="/examples/mcp-server">瞭解如何將 AIGNE 框架 Agent 作為模型情境協定（MCP）伺服器執行。</x-card>
  <x-card data-title="MCP DID Spaces" data-icon="lucide:space" data-href="/examples/mcp-did-spaces">查看如何建立一個整合了 MCP DID Spaces 的聊天機器人，以將 DID Spaces 功能暴露為技能。</x-card>
</x-cards>