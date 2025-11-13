# MCP DID Spaces

本指南將示範如何透過模型內容協定（Model Context Protocol，MCP）建構一個與 DID Spaces 整合的聊天機器人。依照這些步驟，您將建立一個能夠與去中心化儲存互動的 Agent，使用預定義的技能執行讀取、寫入和列出檔案等操作。

## 總覽

此範例展示了 AIGNE 框架如何透過模型內容協定（MCP）與 DID Spaces 服務整合。主要目標是為一個聊天機器人 Agent 配備一套技能，使其能夠在用戶的 DID Space 內執行檔案和資料操作。這提供了一個實際的示範，說明 Agent 如何安全地與外部的去中心化服務互動。

下圖說明了聊天機器人 Agent、MCP 伺服器和 DID Space 之間的互動：

```d2
direction: down

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  MCPAgent: {
    label: "聊天機器人 Agent\n(MCPAgent)"
  }
}

MCP-Server: {
  label: "MCP 伺服器"
  shape: rectangle
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

AIGNE-Framework.MCPAgent -> MCP-Server: "1. 連接並發現技能"
MCP-Server -> AIGNE-Framework.MCPAgent: "2. 提供技能（例如：list_objects、write_object）"
AIGNE-Framework.MCPAgent -> MCP-Server: "3. 執行技能（例如：寫入 'report.md'）"
MCP-Server -> DID-Spaces: "4. 執行檔案操作"
DID-Spaces -> MCP-Server: "5. 返回結果"
MCP-Server -> AIGNE-Framework.MCPAgent: "6. 將結果傳送給 Agent"
```

展示的主要功能包括：
- 連接到 DID Spaces MCP 伺服器。
- 動態載入可用的技能（例如：`list_objects`、`write_object`）。
- 執行基本的檔案操作，如檢查元資料、列出物件和寫入新檔案。
- 將結果的 Markdown 報告儲存起來。

## 先決條件

在開始之前，請確保您已安裝並設定好以下項目：

*   **Node.js**：版本 20.0 或更高。
*   **AI 模型提供商 API 金鑰**：需要一個來自 OpenAI 等提供商的 API 金鑰。
*   **DID Spaces MCP 伺服器憑證**：您將需要 DID Spaces 執行個體的 URL 和授權金鑰。

以下相依套件是選用的，僅當您打算從複製的原始碼執行範例時才需要：

*   **pnpm**：用於套件管理。
*   **Bun**：用於執行測試和範例。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需在本機安裝。

### 1. 設定環境變數

首先，您需要設定 DID Spaces 伺服器的憑證。打開您的終端機並匯出以下環境變數。

要取得您的 `DID_SPACES_AUTHORIZATION` 金鑰：
1.  導覽至您的 Blocklet。
2.  前往 **個人資料 -> 設定 -> 存取金鑰**。
3.  點擊 **建立** 並將 **認證類型** 設定為「Simple」。
4.  複製產生的金鑰。

```bash 設定環境變數 icon=lucide:terminal
# 以您的 DID Spaces URL 取代
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"

# 以您產生的存取金鑰取代
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. 連接到 AI 模型

此 Agent 需要連接到一個大型語言模型（LLM）才能運作。當您第一次執行範例時，系統會提示您連接到一個 AI 模型，並提供幾個選項。

#### 選項 A：透過 AIGNE Hub 連接（建議）

您可以選擇透過官方的 AIGNE Hub 進行連接。您的瀏覽器將打開一個頁面來引導您完成此過程。新用戶會獲得免費的 token 配額以供入門。或者，如果您有自行託管的 AIGNE Hub 執行個體，您可以選擇該選項並輸入其 URL。

#### 選項 B：透過第三方提供商連接

您可以透過環境變數直接設定來自第三方提供商（如 OpenAI）的 API 金鑰。

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="sk-..." # 在此處設定您的 OpenAI API 金鑰
```

有關設定不同模型提供商（例如：DeepSeek、Google Gemini）的更多範例，請參閱原始碼中的 `.env.local.example` 檔案。

### 3. 執行範例

一旦您的環境設定完成，請執行以下命令以啟動聊天機器人：

```bash 執行範例 icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

該腳本將執行以下步驟：
1.  測試與 MCP DID Spaces 伺服器的連接。
2.  執行三個操作：檢查元資料、列出物件和寫入一個檔案。
3.  在主控台中顯示結果。
4.  將一份完整的 Markdown 報告儲存到您的本機檔案系統，並顯示檔案路徑。

## 運作方式

此範例利用一個 `MCPAgent` 來連接到 DID Spaces 伺服器。模型內容協定（MCP）作為一個標準化介面，允許 Agent 發現並利用伺服器提供的技能。

-   **動態技能載入**：`MCPAgent` 會查詢 MCP 伺服器並動態載入所有可用的技能。這意味著您不需要在程式碼中預先定義 Agent 的能力。
-   **安全認證**：與 DID Spaces 的連接是使用提供的授權憑證進行保護的。
-   **即時互動**：Agent 與 DID Spaces 進行即時互動以執行操作。

可用的技能通常包括：

| 技能 | 說明 |
| :--- | :--- |
| `head_space` | 取得關於 DID Space 的元資料。 |
| `read_object` | 從 DID Space 中的一個物件讀取內容。 |
| `write_object` | 將內容寫入 DID Space 中的一個物件。 |
| `list_objects` | 列出 DID Space 中某個目錄內的物件。 |
| `delete_object` | 從 DID Space 中刪除一個物件。 |

## 設定

在生產環境中，您通常會託管自己的 DID Spaces MCP 伺服器。`MCPAgent` 可以被設定為指向您的自訂端點並使用您特定的認證 token。

以下程式碼片段展示了如何使用自訂參數初始化 `MCPAgent`：

```typescript MCPAgent 初始化
import { MCPAgent } from '@aigne/mcp-agent';

const mcpAgent = await MCPAgent.from({
  url: 'YOUR_MCP_SERVER_URL',
  transport: 'streamableHttp',
  opts: {
    requestInit: {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    },
  },
});
```

## 從原始碼執行

如果您偏好從本機複製的儲存庫執行範例，請按照以下步驟操作。

### 1. 複製儲存庫

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝相依套件

導覽至範例目錄並使用 `pnpm` 安裝必要的套件。

```bash 安裝相依套件 icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 命令啟動應用程式。

```bash 執行範例 icon=lucide:terminal
pnpm start
```

## 測試與偵錯

### 執行測試

要驗證整合是否正常運作，您可以執行測試套件。測試將連接到 MCP 伺服器，列出可用的技能，並執行基本的 DID Spaces 操作。

```bash 執行測試套件 icon=lucide:terminal
pnpm test:llm
```

### 觀察 Agent 行為

`aigne observe` 命令會啟動一個本機 Web 伺服器，用於監控和分析 Agent 的執行資料。這個工具對於偵錯、效能調校以及理解您的 Agent 如何與模型和工具互動至關重要。它提供了一個使用者友善的介面來檢查追蹤記錄並查看詳細的呼叫資訊。

```bash 啟動觀察伺服器 icon=lucide:terminal
aigne observe
```

## 總結

本範例提供了一個實用指南，說明如何使用模型內容協定將 AIGNE Agent 與 DID Spaces 等外部服務整合。您已經學會了如何設定、執行和測試一個能夠執行去中心化儲存操作的 Agent。

有關相關概念的更多資訊，請參閱以下文件：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-href="/developer-guide/agents/mcp-agent" data-icon="lucide:box">了解更多關於 MCPAgent 及其如何與外部服務互動的資訊。</x-card>
  <x-card data-title="DID Spaces 記憶體" data-href="/examples/memory-did-spaces" data-icon="lucide:database">查看一個使用 DID Spaces 作為 Agent 持久性記憶體的範例。</x-card>
</x-cards>