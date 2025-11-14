# AFS System FS

本指南將示範如何建構一個能夠與您本機檔案系統互動的聊天機器人。透過遵循這些步驟，您將使用 AIGNE 檔案系統 (AFS) 和 `SystemFS` 模組建立一個 Agent，使其能夠在您的機器上列出、讀取、寫入和搜尋檔案。

## 概覽

此範例展示了如何透過 AIGNE 框架將本機檔案系統與 AI Agent 整合。`SystemFS` 模組作為一座橋樑，將指定的本機目錄掛載到 AIGNE 檔案系統 (AFS) 中。這使得 AI Agent 能夠使用一套標準化的工具執行檔案操作，從而能夠根據您本機檔案的內容回答問題並完成任務。

下圖說明了 `SystemFS` 模組如何將本機檔案系統連接到 AI Agent：

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AFS: {
    label: "AIGNE 檔案系統 (AFS)"
    shape: rectangle

    SystemFS-Module: {
      label: "SystemFS 模組"
      shape: rectangle
    }
  }
}

Local-File-System: {
  label: "本機檔案系統"
  shape: rectangle

  Local-Directory: {
    label: "本機目錄\n(/path/to/your/project)"
    shape: cylinder
  }
}

AI-Agent <-> AIGNE-Framework.AFS: "3. 執行檔案操作\n(列出、讀取、寫入、搜尋)"
AIGNE-Framework.AFS.SystemFS-Module <-> Local-File-System.Local-Directory: "2. 掛載目錄"

```

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js**：20.0 或更高版本。
*   **npm**：隨 Node.js 一起安裝。
*   **OpenAI API 金鑰**：用於連接語言模型。您可以從 [OpenAI API 金鑰頁面](https://platform.openai.com/api-keys) 取得。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需進行本機安裝。

### 執行範例

在您的終端機中執行以下命令，以掛載目錄並與聊天機器人互動。

掛載您目前的目錄並開始一個互動式聊天會話：

```bash Install aigne deps icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

掛載特定目錄，例如您的文件資料夾：

```bash Install aigne deps icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

提出一個一次性問題，而不進入互動模式：

```bash Install aigne deps icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### 連接至 AI 模型

首次執行範例時，由於尚未設定任何 API 金鑰，CLI 會提示您連接至 AI 模型。

![Initial connection prompt for AIGNE Hub](../../../examples/afs-system-fs/run-example.png)

您有三種選擇可以繼續：

1.  **連接至官方 AIGNE Hub**
    這是推薦給新使用者的選項。您的瀏覽器將打開 AIGNE Hub，您可以在那裡授權連接。新使用者會獲得免費的 token 額度，以便立即開始使用。

    ![Authorization dialog for AIGNE CLI in AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

2.  **透過自行託管的 AIGNE Hub 連接**
    如果您有自行託管的 AIGNE Hub 實例，請選擇此選項並輸入其 URL 以完成連接。您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署您自己的 AIGNE Hub。

    ![Prompt to enter the URL for a self-hosted AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **透過第三方模型供應商連接**
    您可以直接設定來自 OpenAI 等供應商的 API 金鑰。在您的終端機中設定相應的環境變數，然後再次執行範例。

    ```bash Set OpenAI API Key icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    若要使用其他供應商（如 DeepSeek 或 Google Gemini）進行設定，請參考專案原始碼中的 `.env.local.example` 檔案。

### 使用 AIGNE Observe 進行偵錯

要監控和分析 Agent 的行為，請使用 `aigne observe` 命令。此命令會啟動一個本機網頁伺服器，提供執行追蹤、工具呼叫和模型互動的詳細視圖，這對於偵錯和效能調整非常有價值。

首先，啟動觀察伺服器：

```bash Start Observe Server icon=lucide:terminal
aigne observe
```

終端機將確認伺服器正在執行並提供一個本機 URL。

![Terminal output showing the AIGNE Observe server has started](../../../examples/images/aigne-observe-execute.png)

執行您的 Agent 後，您可以在網頁介面中查看最近執行的列表。

![AIGNE Observability web interface showing a list of traces](../../../examples/images/aigne-observe-list.png)

## 本機安裝

出於開發目的，您可以複製儲存庫並在本機執行範例。

1.  **複製儲存庫**

    ```bash Clone Repository icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安裝依賴套件**
    導覽至範例目錄並使用 pnpm 安裝必要的套件。

    ```bash Install Dependencies icon=lucide:terminal
    cd aigne-framework/examples/afs-system-fs
    pnpm install
    ```

3.  **執行範例**
    使用 `pnpm start` 命令並附上所需的標記。

    使用您目前的目錄執行：
    ```bash Run with Current Directory icon=lucide:terminal
    pnpm start --path .
    ```

    以互動式聊天模式執行：
    ```bash Run in Chat Mode icon=lucide:terminal
    pnpm start --path . --chat
    ```

## 運作方式

此範例使用 `SystemFS` 模組，透過 AIGNE 檔案系統 (AFS) 將本機目錄公開給 AI Agent。這個沙箱環境允許 Agent 使用標準化的介面與您的檔案互動，確保安全性和可控性。

### 核心邏輯

1.  **掛載目錄**：`SystemFS` 類別被實例化，並帶有一個本機 `path` 和 AFS 中的一個虛擬 `mount` 點。
2.  **Agent 初始化**：`AIAgent` 使用 AFS 實例進行設定，使其能夠存取檔案系統工具，如 `afs_list`、`afs_read`、`afs_write` 和 `afs_search`。
3.  **工具呼叫**：當使用者提出問題時（例如，「這個專案的目的是什麼？」），Agent 會決定使用哪個 AFS 工具。它可能首先呼叫 `afs_list` 來查看目錄內容，然後呼叫 `afs_read` 來檢查相關檔案，如 `README.md`。
4.  **建立情境**：從檔案系統中檢索到的內容被添加到 Agent 的情境中。
5.  **產生回應**：Agent 使用豐富後的情境來為使用者的原始問題制定一個全面的答案。

以下程式碼片段展示了如何將本機目錄掛載到 AFS 中，並提供給 `AIAgent`。

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

AIAgent.from({
  // ... 其他設定
  afs: new AFS().use(
    new SystemFS({ mount: '/source', path: '/PATH/TO/YOUR/PROJECT', description: 'Codebase of the project' }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### SystemFS 的主要功能

*   **檔案操作**：標準的列出、讀取、寫入和搜尋功能。
*   **遞迴遍歷**：以深度控制來導覽巢狀目錄。
*   **快速內容搜尋**：利用 `ripgrep` 進行高效能的文字搜尋。
*   **元資料存取**：提供檔案詳細資訊，如大小、類型和時間戳。
*   **路徑安全**：將檔案存取限制在僅掛載的目錄中。

## 使用範例

一旦聊天機器人開始執行，您就可以發出自然語言命令來與您的檔案互動。

### 基本命令

嘗試使用這些命令來執行簡單的檔案操作。

列出掛載目錄中的所有檔案：
```bash List Files icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

讀取特定檔案的內容：
```bash Read a File icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

在所有檔案中搜尋內容：
```bash Search Content icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### 互動式聊天提示

開始一個互動式會話以獲得更具對話性的體驗：

```bash Start Interactive Mode icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

進入聊天模式後，試著詢問以下問題：

*   「這個目錄中有哪些檔案？」
*   「顯示 README 檔案的內容。」
*   「尋找所有 TypeScript 檔案。」
*   「在程式碼庫中搜尋函式。」
*   「建立一個名為 `notes.txt` 的新檔案，並寫入一些內容。」
*   「以 2 的深度限制遞迴列出所有檔案。」

## 總結

此範例實際展示了如何擴展 AI Agent 的能力，使其能夠進行本機檔案系統的互動。透過使用 `SystemFS` 模組，您可以建立功能強大的聊天機器人，根據自然語言命令自動化任務、檢索資訊和組織檔案。

若需更進階的範例和工作流程，您可以探索其他文件部分。

<x-cards data-columns="2">
  <x-card data-title="Memory" data-href="/examples/memory" data-icon="lucide:brain-circuit">
  了解如何為您的聊天機器人賦予持久的記憶。
  </x-card>
  <x-card data-title="Workflow Orchestration" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">
  探索如何在複雜的工作流程中協調多個 Agent。
  </x-card>
</x-cards>