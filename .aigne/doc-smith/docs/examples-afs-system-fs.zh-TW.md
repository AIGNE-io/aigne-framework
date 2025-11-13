I have located the necessary files for the "AFS System FS" example documentation. The primary source will be `/sources/examples/afs-system-fs/README.md`, which will provide the structure, code snippets, and conceptual explanations. The core logic example will be drawn from `/sources/examples/afs-system-fs/index.ts`. I've noted the available image, `/sources/examples/afs-system-fs/run-example.png`, and will address the user's feedback regarding invalid image paths by verifying correct locations or substituting with valid images. My next step is to analyze the `README.md` to begin drafting the document.# AFS System FS

您是否曾經想過要建立一個可以直接且安全地與您本機檔案互動的聊天機器人？本指南將示範如何做到這一點。您將學習如何使用 AIGNE 檔案系統（AFS）和 `SystemFS` 模組，來授予 AI Agent 在沙箱環境中存取您電腦上檔案的權限，包括讀取、寫入和搜尋，從而實現能夠處理本機資料、功能強大且具備情境感知能力的應用程式。

## 概覽

此範例的核心是 `SystemFS` 模組，它扮演著 AIGNE 框架與您電腦檔案系統之間的橋樑。它允許您「掛載」一個本機目錄，使其內容可以透過一套標準工具（如 `afs_list`、`afs_read`、`afs_write` 和 `afs_search`）供 AI Agent 存取。然後，Agent 可以使用這些工具，根據自然語言指令執行檔案操作。這使得諸如總結文件、整理檔案或回答有關程式碼庫的問題等使用案例成為可能。

下圖說明了使用者、AI Agent、AFS 工具和本機檔案系統之間的關係：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
  }

  AFS-Tools: {
    label: "AFS 工具"
    shape: rectangle
    grid-columns: 2
    afs_list: { label: "afs_list" }
    afs_read: { label: "afs_read" }
    afs_write: { label: "afs_write" }
    afs_search: { label: "afs_search" }
  }

  SystemFS-Module: {
    label: "SystemFS 模組"
    shape: rectangle
  }
}

Local-File-System: {
  label: "本機檔案系統\n（沙箱環境）"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "自然語言指令"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS-Tools: "選擇適當的工具"
AIGNE-Framework.AFS-Tools -> AIGNE-Framework.SystemFS-Module: "調用工具操作"
AIGNE-Framework.SystemFS-Module -> Local-File-System: "執行檔案 I/O"
Local-File-System -> AIGNE-Framework.SystemFS-Module: "返回檔案內容/狀態"
AIGNE-Framework.SystemFS-Module -> AIGNE-Framework.AI-Agent: "返回工具結果"
AIGNE-Framework.AI-Agent -> User: "根據情境的回應"

```

## 先決條件

在開始之前，請確保您的系統符合以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨您的 Node.js 安裝一同提供。
*   **OpenAI API 金鑰**：需要有效的 API 金鑰，AI Agent 才能連線至 OpenAI 的模型。您可以從 [OpenAI 平台](https://platform.openai.com/api-keys)取得金鑰。

如果您打算從原始碼執行此範例，也建議具備以下條件：

*   **pnpm**：用於高效的套件管理。
*   **Bun**：用於執行範例和單元測試。

## 快速入門

您可以直接在終端機中使用 `npx` 執行此範例，無需複製整個儲存庫。這是最快看到它實際運作的方式。

### 執行範例

開啟您的終端機並選擇以下其中一個指令。

若要掛載您目前的目錄並啟動互動式聊天工作階段：

```bash 以聊天模式執行 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

若要以自訂名稱和描述掛載特定目錄：

```bash 掛載特定目錄 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

若要只問一個問題而不啟動互動式聊天：

```bash 問一個問題 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### 連線至 AI 模型

首次執行範例時，系統會提示您連線至 AI 模型。

![連線至 AI 模型](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

您有三個主要選項：

1.  **透過官方 AIGNE Hub 連線**：這是建議的選項。您的瀏覽器將開啟官方 AIGNE Hub，您可以在那裡登入。新使用者會獲得免費的 token 配額以開始使用。
2.  **透過自行託管的 AIGNE Hub 連線**：如果您執行自己的 AIGNE Hub 實例，請選擇此選項並輸入其 URL。
3.  **透過第三方模型供應商連線**：您可以透過設定帶有您 API 金鑰的環境變數，直接連線至像 OpenAI 這樣的供應商。

若要連線至 OpenAI，請在您的終端機中設定 `OPENAI_API_KEY` 環境變數：

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定金鑰後，再次執行 `npx` 指令。如需支援的供應商及其所需環境變數的完整列表，請參閱範例的 `.env.local.example` 檔案。

## 從原始碼安裝

如果您偏好檢視原始碼或進行修改，請按照以下步驟在本機執行範例。

### 1. 複製儲存庫

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴套件

導覽至範例的目錄並使用 `pnpm` 安裝必要的套件。

```bash 安裝依賴套件 icon=lucide:terminal
cd aigne-framework/examples/afs-system-fs
pnpm install
```

### 3. 執行範例

使用所需的旗標執行 `pnpm start` 指令。

若要掛載您目前的目錄執行：

```bash 使用目前目錄執行 icon=lucide:terminal
pnpm start --path .
```

若要在互動式聊天模式下執行：

```bash 以聊天模式執行 icon=lucide:terminal
pnpm start --path . --chat
```

## 運作方式

此範例會初始化一個 `AIAgent`，並使用 `SystemFS` 模組授予它存取本機檔案系統的權限。

### 掛載本機目錄

`SystemFS` 類別用於將本機 `path` 掛載到 AFS 內的虛擬 `mount` 點。此設定會傳遞給一個新的 `AFS` 實例，然後該實例會附加到 `AIAgent` 上。Agent 會被指示使用掛載的檔案系統來回答使用者的查詢。

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  name: "afs-system-fs-chatbot",
  instructions:
    "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions. The current folder points to the /fs mount point by default.",
  inputKey: "message",
  afs: new AFS().use(
    new SystemFS({
      mount: '/fs',
      path: './',
      description: 'Mounted file system'
    }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### Agent 互動流程

當使用者提出問題時，AI Agent 會自主決定使用哪些 AFS 工具來尋找答案。

1.  **使用者輸入**：使用者提出問題，例如「這個專案的目的是什麼？」
2.  **工具呼叫（列表）**：Agent 判斷需要了解檔案結構，於是呼叫 `afs_list` 工具來查看根目錄中的檔案。
3.  **工具呼叫（讀取）**：在識別出相關檔案（例如 `README.md`）後，Agent 呼叫 `afs_read` 工具來存取其內容。
4.  **根據情境的回應**：檔案的內容被加入到 Agent 的情境中。然後，Agent 使用這些新資訊來建構對使用者原始問題的詳細回答。

整個過程是自主的。Agent 會串連工具呼叫、收集情境，並在沒有手動指導的情況下形成回應。

## 使用範例

一旦聊天機器人開始執行，您可以發出各種指令與掛載的檔案互動。

### 基本檔案操作

```bash 列出所有檔案 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

```bash 讀取特定檔案 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

```bash 搜尋內容 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### 互動式聊天

若要獲得更具對話性的體驗，請啟動互動模式。

```bash 啟動互動式聊天 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

進入聊天後，嘗試提出以下問題：

*   「這個目錄裡有哪些檔案？」
*   「顯示 README 檔案的內容給我看。」
*   「找出所有的 TypeScript 檔案。」
*   「建立一個名為 `notes.txt` 的新檔案，內容為『完成專案文件』。」
*   「遞迴列出所有檔案，深度限制為 2。」

## 偵錯

AIGNE CLI 包含一個 `observe` 指令，可幫助您分析和偵錯 Agent 的行為。它會啟動一個本機網頁伺服器，提供一個介面來檢查執行追蹤，包括工具呼叫、模型輸入和最終輸出。

首先，在您的終端機中啟動觀察伺服器：

```bash 啟動觀察伺服器 icon=lucide:terminal
aigne observe
```

![啟動 AIGNE 觀察伺服器](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

執行 Agent 任務後，您可以開啟網頁介面，查看最近執行的列表，並深入了解每一步的詳細資訊。

![檢視最近執行的清單](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)

## 總結

此範例提供了一個實用指南，將 AI Agent 的能力擴展至您的本機檔案系統。使用 `SystemFS`，您可以建立與使用者本機資料和環境深度整合的複雜應用程式。

更多範例和進階功能，請參閱以下文件：

<x-cards data-columns="2">
  <x-card data-title="記憶體" data-icon="lucide:brain-circuit" data-href="/examples/memory">
  了解如何使用 FSMemory 外掛程式建立具有持續性記憶體的聊天機器人。
  </x-card>
  <x-card data-title="MCP 伺服器" data-icon="lucide:server" data-href="/examples/mcp-server">
  探索如何將 AIGNE Agent 作為模型情境協定（MCP）伺服器執行。
  </x-card>
</x-cards>