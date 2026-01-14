# AFS Local FS

本指南將示範如何建置一個能與您本機檔案系統互動的聊天機器人。透過利用 AIGNE 檔案系統 (AFS) 和 `SystemFS` 模組，您可以賦予 AI agent 搜尋、讀取和管理您電腦上檔案的能力，使其成為一個強大的本機資料專家。

## 總覽

AIGNE 檔案系統 (AFS) 提供了一個虛擬檔案系統層，讓 AI agent 能以標準化方式存取各種儲存系統。本範例著重於 `SystemFS` 模組，它將 AFS 橋接到您的本機檔案系統。

當使用者提出問題時，agent 會智慧地執行以下操作：
1.  **搜尋：** 它使用 `afs_search` 工具，根據使用者的查詢在指定目錄中尋找相關檔案。
2.  **讀取：** 它從搜尋結果中識別出最有可能的檔案，並使用 `afs_read` 工具存取其內容。
3.  **整合：** 它處理檔案內容，以形成一個全面且準確的答案。

這讓 agent 可以在沒有手動指導的情況下，回答關於您的文件、程式碼或任何其他基於文字的檔案的問題。

## 先決條件

在開始之前，請確保您已安裝並設定好以下項目：
- [Node.js](https://nodejs.org) (版本 20.0 或更高)
- 一個 [OpenAI API 金鑰](https://platform.openai.com/api-keys)

## 快速入門

您可以使用 `npx` 直接執行此範例，無需在本機安裝。

1.  **設定您的 OpenAI API 金鑰：**
    ```bash icon=lucide:terminal
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **執行聊天機器人：**
    您可以掛載任何本機目錄。在此範例中，我們將複製 AIGNE 框架，並使用其文件作為知識庫。

    ```bash icon=lucide:terminal
    # 複製儲存庫以使用其文件
    git clone https://github.com/AIGNE-io/aigne-framework
    
    # 以互動模式啟動聊天機器人，並指向文件目錄
    npx -y @aigne/example-afs-local-fs --path ./aigne-framework --interactive
    ```

    或者，您也可以問一個單一、具體的問題：
    ```bash icon=lucide:terminal
    npx -y @aigne/example-afs-local-fs --path ./aigne-framework --input "What is AIGNE?"
    ```

### 互動範例

以下是當被問及「什麼是 AIGNE？」時，agent 處理過程的範例：

```
👤 您：「什麼是 AIGNE？」

🤖 Agent 思考：我需要在提供的檔案中尋找關於 AIGNE 的資訊。我將從搜尋開始。
   → 呼叫：afs_search(query: "AIGNE")

📁 找到 15 個相符的檔案：
   • docs/getting-started/what-is-aigne.md ⭐ (最相關)
   • README.md
   • docs/core-concepts/overview.md
   ...

🤖 Agent 思考：第一個結果似乎最相關。我將閱讀它來回答使用者的問題。
   → 呼叫：afs_read("docs/getting-started/what-is-aigne.md")

📄 檔案已載入 (2.4 KB)

🤖 AI：「AIGNE 是一個用於建置由 LLM 驅動的應用程式和 AI agent 的框架與執行時期引擎。它提供：

       • 一個統一的 Agentic File System (AFS) 介面
       • 支援多個 LLM 供應商 (OpenAI、Anthropic 等)
       • 用於建置自主 agent 的工具
       • 透過 MCP 與外部服務整合

       您希望我帶您快速瀏覽入門教學，還是想看一些具體的範例？」
```
agent 成功找到了正確的檔案，讀取其內容，並提供了一個總結性的、有幫助的回應。

## 連接到 AI 模型

此 agent 需要連接到大型語言模型 (LLM) 才能運作。如果您在未提供 API 金鑰的情況下執行此範例，系統將提示您選擇一種連接方式。

![未找到 API 金鑰時的初始設定提示。](../../../examples/afs-local-fs/run-example.png)

您有三個選項：

1.  **連接到 AIGNE Hub (建議)：** 這是最簡單的入門方式。您的瀏覽器將打開一個授權頁面。新使用者會收到免費的點數以使用該服務。

    ![授權 AIGNE CLI 連接到 AIGNE Hub。](../../../examples/images/connect-to-aigne-hub.png)

2.  **連接到自行託管的 AIGNE Hub：** 如果您正在執行自己的 AIGNE Hub 實例，請選擇此選項並輸入其 URL。

    ![輸入自行託管的 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **使用第三方模型供應商：** 您可以透過設定相應的環境變數，直接連接到像 OpenAI 這樣的供應商。

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```
    有關支援的供應商及其所需環境變數的列表，請參閱原始碼中的範例 `.env.local.example` 檔案。

## 運作方式

實作過程可分為三個主要步驟，如下圖所示：

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![AFS Local FS](assets/diagram/examples-afs-local-fs-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

### 1. 建立一個 LocalFS 模組

首先，實例化 `LocalFS` 模組，指定您希望 agent 存取的目錄的本機路徑，以及一個可選的描述。

```typescript create-local-fs.ts
import { LocalFS } from "@aigne/afs-local-fs";

const localFS = new LocalFS({
  localPath: './aigne-framework',
  description: 'AIGNE framework documentation'
});
```

### 2. 在 AFS 中掛載模組

接下來，建立一個 `AFS` 實例並 `mount` (掛載) `localFS` 模組。這使得任何能夠存取此 AFS 實例的 agent 都可以使用該本機目錄。

```typescript mount-module.ts
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(localFS);  // 掛載於預設路徑 /modules/local-fs
```

### 3. 建立並設定 AI Agent

最後，建立一個 `AIAgent` 並為其提供 `afs` 實例。該 agent 會自動獲得用於檔案系統互動的 AFS 工具存取權限。

```typescript create-agent.ts
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "Help users find and read files from the local file system.",
  inputKey: "message",
  afs,  // agent 繼承了 afs_list、afs_read、afs_write 和 afs_search
});
```

### 可用的 AFS 工具

透過將 agent 連接到 AFS，它可以使用以下沙箱化的工具來操作掛載的目錄：
-   `afs_list`：列出檔案和子目錄。
-   `afs_read`：讀取特定檔案的內容和中繼資料。
-   `afs_write`：建立新檔案或覆寫現有檔案。
-   `afs_search`：在目錄中的所有檔案進行全文搜尋。

## 安裝與本機執行

如果您偏好從原始碼執行此範例，請遵循以下步驟。

1.  **複製儲存庫：**
    ```bash icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安裝依賴項：**
    導覽至範例目錄並使用 `pnpm` 安裝必要的套件。
    ```bash icon=lucide:terminal
    cd aigne-framework/examples/afs-local-fs
    pnpm install
    ```

3.  **執行範例：**
    使用 `pnpm start` 指令來執行聊天機器人。
    ```bash icon=lucide:terminal
    # 掛載目前目錄
    pnpm start --path .

    # 掛載特定目錄並附上自訂描述
    pnpm start --path ~/Documents --description "My Documents"

    # 以互動式聊天模式執行
    pnpm start --path . --interactive
    ```

## 使用案例

本範例為幾個實際應用提供了基礎。

### 文件聊天
掛載您專案的文件資料夾，以建立一個能回答使用者關於您專案問題的聊天機器人。
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: './docs', description: 'Project documentation' }));
```

### 程式碼庫分析
讓 AI agent 存取您的原始碼，以協助分析、重構或解釋複雜的邏輯。
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: './src', description: 'Source code' }));
```

### 檔案整理
建置一個能幫助您在目錄中（例如您的「下載」資料夾）排序和管理檔案的 agent。
```typescript
const afs = new AFS()
  .mount(new LocalFS({ localPath: '~/Downloads', description: 'Downloads folder' }));
```

### 多目錄存取
掛載多個目錄以提供 agent 更廣泛的上下文，使其能夠同時在您的原始碼、文件和測試中進行搜尋。
```typescript
const afs = new AFS()
  .mount("/docs", new LocalFS({ localPath: './docs' }))
  .mount("/src", new LocalFS({ localPath: './src' }))
  .mount("/tests", new LocalFS({ localPath: './tests' }));
```

## 總結

您已經學會如何使用 AIGNE 框架來建立一個能與本機檔案系統互動的聊天機器人。這項強大的功能開啟了廣泛的應用可能性，從智慧文件搜尋到自動化程式碼分析。

如需進一步閱讀，請探索以下相關範例和套件：

<x-cards data-columns="2">
  <x-card data-title="記憶體範例" data-href="/examples/memory" data-icon="lucide:brain-circuit">
    了解如何為您的聊天機器人增加對話記憶。
  </x-card>
  <x-card data-title="MCP 伺服器範例" data-href="/examples/mcp-server" data-icon="lucide:server">
    探索如何使用 MCP 將您的 agent 與外部服務整合。
  </x-card>
</x-cards>
