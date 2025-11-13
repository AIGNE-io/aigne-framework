# 範例

本節提供了一系列實用、可立即執行的範例，展示 AIGNE 框架的核心功能和工作流程模式。透過探索這些示範，您將對如何實現智慧聊天機器人、整合外部服務、管理 Agent 記憶體以及編排複雜的多 Agent 工作流程有具體的了解。

這些範例設計為獨立且只需最少的設定即可執行，涵蓋了從基本對話到進階整合的廣泛應用。每個範例都可作為建構您自己的 Agent AI 應用程式的參考實作。

## 快速入門

如果您已安裝 Node.js 和 npm，則無需本機安裝即可直接執行任何範例。以下步驟示範如何使用 `npx` 執行基本的聊天機器人範例。

首先，設定必要的環境變數。對於大多數範例，需要一個 OpenAI API 金鑰。

```bash 設定您的 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

接下來，執行範例。您可以以一次性模式執行以獲得單一回應，也可以以互動式聊天模式執行。

```bash 以一次性模式執行 icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

若要進行連續對話，請加入 `--chat` 旗標。

```bash 以互動式聊天模式執行 icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

## 範例集

此範例集涵蓋了基本概念、模型內容協定（MCP）整合以及進階工作流程模式。

### 核心概念

<x-cards data-columns="2">
  <x-card data-title="基本聊天機器人" data-href="/examples/chat-bot" data-icon="lucide:bot">
  示範如何建立並執行一個簡單的基於 Agent 的聊天機器人。
  </x-card>
  <x-card data-title="具備記憶體的聊天機器人" data-href="/examples/memory" data-icon="lucide:database">
  說明如何為 Agent 新增狀態記憶體以實現持續性對話。
  </x-card>
</x-cards>

### MCP 與整合

<x-cards data-columns="2">
  <x-card data-title="MCP 伺服器" data-href="/examples/mcp-server" data-icon="lucide:server">
  展示如何將 AIGNE 框架的 Agent 作為模型內容協定（MCP）伺服器執行。
  </x-card>
  <x-card data-title="Blocklet 整合" data-href="/examples/mcp-blocklet" data-icon="lucide:box">
  解釋如何與 Blocklet 整合並將其功能公開為 MCP 技能。
  </x-card>
  <x-card data-title="GitHub 整合" data-href="/examples/mcp-github" data-icon="lucide:github">
  一個使用 GitHub MCP 伺服器與 GitHub 儲存庫互動的範例。
  </x-card>
  <x-card data-title="網頁內容擷取" data-href="/examples/mcp-puppeteer" data-icon="lucide:mouse-pointer-click">
  學習如何透過 AIGNE 框架利用 Puppeteer 進行自動化網頁抓取。
  </x-card>
  <x-card data-title="智慧資料庫互動" data-href="/examples/mcp-sqlite" data-icon="lucide:database-zap">
  透過模型內容協定連接到 SQLite，探索資料庫操作。
  </x-card>
</x-cards>

### 進階工作流程

<x-cards data-columns="2">
  <x-card data-title="程式碼執行" data-href="/examples/workflow-code-execution" data-icon="lucide:code-2">
  展示如何在 AI 驅動的工作流程中安全地執行動態產生的程式碼。
  </x-card>
  <x-card data-title="並行處理" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">
  透過平行執行同時處理多個任務來優化效能。
  </x-card>
  <x-card data-title="循序管線" data-href="/examples/workflow-sequential" data-icon="lucide:git-commit-horizontal">
  建構具有保證執行順序的逐步處理管線。
  </x-card>
  <x-card data-title="群組聊天" data-href="/examples/workflow-group-chat" data-icon="lucide:messages-square">
  展示如何在群組聊天環境中與多個 Agent 分享訊息並互動。
  </x-card>
  <x-card data-title="任務交接" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  在專業 Agent 之間建立無縫過渡，以解決複雜問題。
  </x-card>
  <x-card data-title="智慧編排" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  協調多個 Agent 在複雜的處理管線中協同工作。
  </x-card>
  <x-card data-title="反思" data-href="/examples/workflow-reflection" data-icon="lucide:rotate-cw">
  透過輸出評估和精煉能力實現自我改進。
  </x-card>
  <x-card data-title="路由器" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  實作智慧路由邏輯，根據內容將請求導向至適當的處理程式。
  </x-card>
</x-cards>

## 進階設定

### 使用不同的大型語言模型

可以透過設定 `MODEL` 環境變數以及對應的 API 金鑰，將範例設定為使用各種大型語言模型。有關支援的供應商完整列表，請參閱[模型總覽](./models-overview.md)。

#### OpenAI

```bash OpenAI 設定 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

#### Anthropic

```bash Anthropic 設定 icon=lucide:terminal
export MODEL=anthropic:claude-3-opus-20240229
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

#### Google Gemini

```bash Gemini 設定 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

#### AWS Bedrock

```bash Bedrock 設定 icon=lucide:terminal
export MODEL=bedrock:us-east-1.anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_KEY"
export AWS_REGION="us-east-1"
```

#### Ollama (本機)

```bash Ollama 設定 icon=lucide:terminal
export MODEL=llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434/v1"
export OLLAMA_API_KEY=ollama
```

### 輸出偵錯日誌

若要深入了解 Agent 的內部操作，例如模型呼叫和回應，您可以透過設定 `DEBUG` 環境變數來啟用偵錯日誌記錄。

```bash 啟用偵錯日誌 icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

此命令將產生詳細輸出，這對於故障排除和理解 Agent 的執行流程很有用。

## 總結

這些範例為使用 AIGNE 框架進行建構提供了一個實用的起點。我們建議從[基本聊天機器人](./examples-chat-bot.md)開始，以了解基礎知識，然後根據需要探索更複雜的工作流程。若要獲得更深入的理論理解，請參閱[核心概念](./developer-guide-core-concepts.md)文件。