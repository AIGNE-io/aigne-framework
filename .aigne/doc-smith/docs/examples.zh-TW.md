# 範例

探索一系列實用的範例，展示 AIGNE 框架的各種功能和工作流程模式。本節提供可動手執行的演示，幫助您理解智慧對話、MCP 協議整合、記憶體機制以及複雜的 Agentic 工作流程。

## 快速入門

您可以使用 `npx` 直接執行任何範例，無需在本機安裝。這是體驗 AIGNE 框架最快的方法。

### 先決條件

- 已安裝 Node.js (版本 20.0 或更高) 和 npm。
- 您所選的大型語言模型 (LLM) 供應商的 API 金鑰 (例如 OpenAI)。

### 執行範例

在您的終端機中執行以下指令來執行一個基本的聊天機器人。

1.  **設定您的 API 金鑰：**
    將 `YOUR_OPENAI_API_KEY` 替換為您實際的 OpenAI API 金鑰。

    ```sh icon=lucide:terminal
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **以單次模式執行：**
    Agent 將處理一個預設提示後退出。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

3.  **以互動模式執行：**
    使用 `--chat` 旗標來啟動一個互動式會話，您可以在其中與 Agent 進行對話。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

### 使用不同的 LLM

您可以透過設定 `MODEL` 環境變數以及相應的 API 金鑰來指定不同的模型。以下是幾個熱門供應商的設定。

| 供應商 | 環境變數 |
| :--- | :--- |
| **OpenAI** | `export MODEL=openai:gpt-4o`<br/>`export OPENAI_API_KEY=...` |
| **Anthropic** | `export MODEL=anthropic:claude-3-opus-20240229`<br/>`export ANTHROPIC_API_KEY=...` |
| **Google Gemini** | `export MODEL=gemini:gemini-1.5-flash`<br/>`export GEMINI_API_KEY=...` |
| **DeepSeek** | `export MODEL=deepseek/deepseek-chat`<br/>`export DEEPSEEK_API_KEY=...` |
| **AWS Bedrock** | `export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0`<br/>`export AWS_ACCESS_KEY_ID=...`<br/>`export AWS_SECRET_ACCESS_KEY=...`<br/>`export AWS_REGION=...` |
| **Ollama** | `export MODEL=llama3`<br/>`export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"` |

## 範例庫

本節提供了一系列精選範例，每個範例都展示了 AIGNE 框架中的特定功能或工作流程模式。點擊任何卡片即可導覽至該範例的詳細指南。

### 核心功能

<x-cards data-columns="2">
  <x-card data-title="聊天機器人" data-icon="lucide:bot" data-href="/examples/chat-bot">
    建立一個支援單次和互動模式的基本對話 Agent。
  </x-card>
  <x-card data-title="AFS 本機檔案系統" data-icon="lucide:folder-git-2" data-href="/examples/afs-local-fs">
    建立一個可以在本機檔案系統上讀取、寫入和列出檔案的聊天機器人。
  </x-card>
  <x-card data-title="記憶體" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    使用 FSMemory 外掛程式實作一個具有持久性記憶體的 Agent。
  </x-card>
  <x-card data-title="Nano Banana" data-icon="lucide:image" data-href="/examples/nano-banana">
    展示如何建立一個具有圖像生成功能的聊天機器人。
  </x-card>
</x-cards>

### 工作流程模式

<x-cards data-columns="3">
  <x-card data-title="循序" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    以特定的、有序的順序執行一系列 Agent，就像一條裝配線。
  </x-card>
  <x-card data-title="並行" data-icon="lucide:git-fork" data-href="/examples/workflow-concurrency">
    同時執行多個 Agent 以平行執行任務並提高效率。
  </x-card>
  <x-card data-title="路由器" data-icon="lucide:route" data-href="/examples/workflow-router">
    建立一個管理員 Agent，智慧地將任務導向至適當的專業 Agent。
  </x-card>
  <x-card data-title="交接" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    實現無縫過渡，讓一個 Agent 將其輸出傳遞給另一個 Agent 進行進一步處理。
  </x-card>
  <x-card data-title="反思" data-icon="lucide:refresh-ccw" data-href="/examples/workflow-reflection">
    建立能夠審查和改進自身輸出以進行自我修正和提升的 Agent。
  </x-card>
  <x-card data-title="協同運作" data-icon="lucide:users" data-href="/examples/workflow-orchestration">
    協調多個 Agent 來解決需要協作的複雜問題。
  </x-card>
  <x-card data-title="群組聊天" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">
    模擬一個多 Agent 討論，其中 Agent 可以互動並在彼此的訊息基礎上進行建構。
  </x-card>
  <x-card data-title="程式碼執行" data-icon="lucide:code-2" data-href="/examples/workflow-code-execution">
    在 AI 驅動的工作流程中安全地執行動態生成的程式碼。
  </x-card>
</x-cards>

### MCP 與整合

<x-cards data-columns="3">
  <x-card data-title="MCP 伺服器" data-icon="lucide:server" data-href="/examples/mcp-server">
    將 AIGNE Agent 作為模型情境協議 (MCP) 伺服器執行，以公開其技能。
  </x-card>
  <x-card data-title="MCP Blocklet" data-icon="lucide:box" data-href="/examples/mcp-blocklet">
    與 Blocklet 整合，並將其功能公開為 MCP 技能。
  </x-card>
  <x-card data-title="MCP GitHub" data-icon="lucide:github" data-href="/examples/mcp-github">
    使用連接到 GitHub MCP 伺服器的 Agent 與 GitHub 儲存庫互動。
  </x-card>
  <x-card data-title="MCP Puppeteer" data-icon="lucide:mouse-pointer-2" data-href="/examples/mcp-puppeteer">
    利用 Puppeteer 進行自動化的網頁抓取和瀏覽器互動。
  </x-card>
  <x-card data-title="MCP SQLite" data-icon="lucide:database" data-href="/examples/mcp-sqlite">
    連接到 SQLite 資料庫以執行智慧型資料庫操作。
  </x-card>
  <x-card data-title="DID Spaces 記憶體" data-icon="lucide:key-round" data-href="/examples/memory-did-spaces">
    使用去中心化身份和儲存技術 DID Spaces 來持久化 Agent 記憶體。
  </x-card>
</x-cards>

## 偵錯

要深入了解 Agent 的執行情況，您可以啟用偵錯日誌或使用 AIGNE 觀察伺服器。

### 查看偵錯日誌

將 `DEBUG` 環境變數設定為 `*` 以輸出詳細日誌，其中包含模型呼叫和回應。

```sh icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### 使用觀察伺服器

`aigne observe` 指令會啟動一個本機 Web 伺服器，提供一個使用者友善的介面來檢查執行追蹤、查看詳細的呼叫資訊，並了解您的 Agent 的行為。這是用於偵錯和效能調整的強大工具。

1.  **安裝 AIGNE CLI：**

    ```sh icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **啟動觀察伺服器：**

    ```sh icon=lucide:terminal
    aigne observe
    ```

    ![一個顯示 aigne observe 指令啟動伺服器的終端機。](../../../examples/images/aigne-observe-execute.png)

3.  **查看追蹤：**
    執行 Agent 後，在瀏覽器中開啟 `http://localhost:7893`，即可查看最近執行的列表並檢查每次執行的詳細資訊。

    ![顯示追蹤列表的 AIGNE 可觀察性介面。](../../../examples/images/aigne-observe-list.png)