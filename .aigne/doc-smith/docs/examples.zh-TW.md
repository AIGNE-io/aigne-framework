# 範例

準備好看看 AIGNE 框架的實際應用了嗎？本節提供了一系列全面的實用範例，展示各種功能和工作流程模式。跳過複雜的設定，直接透過一鍵式指令執行功能齊全的 Agent。

## 總覽

AIGNE 框架範例為從智慧聊天機器人到複雜的多 Agent 工作流程等一系列應用程式提供了實作示範。每個範例都是一個獨立、可執行的示範，旨在說明框架的特定功能。您可以探索諸如模型內容協議（MCP）整合、記憶體持久化、並行和順序任務處理以及動態程式碼執行等主題。

有關特定功能或工作流程的詳細資訊，請參考相應的範例文件：

<x-cards data-columns="3">
  <x-card data-title="聊天機器人" data-icon="lucide:bot" data-href="/examples/chat-bot">示範如何建立並執行一個基於 Agent 的聊天機器人。</x-card>
  <x-card data-title="AFS System FS" data-icon="lucide:folder-git-2" data-href="/examples/afs-system-fs">展示如何建構一個能與本機檔案系統互動的聊天機器人。</x-card>
  <x-card data-title="記憶體" data-icon="lucide:database" data-href="/examples/memory">說明如何建立一個具有持久性記憶體的聊天機器人。</x-card>
  <x-card data-title="MCP 伺服器" data-icon="lucide:server" data-href="/examples/mcp-server">展示如何將 AIGNE Agent 作為 MCP 伺服器執行。</x-card>
  <x-card data-title="MCP 整合" data-icon="lucide:plug" data-href="/examples/mcp-blocklet">探索與 Blocklet、GitHub、Puppeteer 和 SQLite 的整合。</x-card>
  <x-card data-title="程式碼執行" data-icon="lucide:terminal" data-href="/examples/workflow-code-execution">學習如何在工作流程中安全地執行動態產生的程式碼。</x-card>
  <x-card data-title="並行處理" data-icon="lucide:git-compare-arrows" data-href="/examples/workflow-concurrency">透過平行處理多個任務來最佳化效能。</x-card>
  <x-card data-title="群組聊天" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">建構多個 Agent 可以互動和分享訊息的環境。</x-card>
  <x-card data-title="順序執行" data-icon="lucide:arrow-right" data-href="/examples/workflow-sequential">建構具有保證執行順序的逐步處理流程。</x-card>
</x-cards>

## 快速入門

您無需複製程式碼倉庫或進行本機安裝，即可直接在終端機中使用 `npx` 執行任何範例。

### 先決條件

請確保您的系統上已安裝 Node.js 和 npm。

### 執行範例

要執行範例，您需要設定必要的環境變數，例如大型語言模型供應商的 API 金鑰。

1.  **設定您的 API 金鑰：**

    ```bash 設定您的 OpenAI API 金鑰 icon=lucide:key-round
    export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    ```

2.  **執行聊天機器人範例：**

    以下指令以單次模式執行基本的聊天機器人範例，它會使用預設提示並退出。

    ```bash 以單次模式執行 icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

    要與 Agent 進行互動式對話，請新增 `--chat` 旗標。

    ```bash 以互動模式執行 icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

## 設定語言模型

透過設定 `MODEL` 環境變數以及相應的 API 金鑰，可以將範例設定為使用各種大型語言模型。`MODEL` 變數的格式為 `provider:model-name`。

### OpenAI

```bash OpenAI 設定 icon=lucide:terminal
export MODEL=openai:gpt-4o
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### Anthropic

```bash Anthropic 設定 icon=lucide:terminal
export MODEL=anthropic:claude-3-5-sonnet-20240620
export ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
```

### Google Gemini

```bash Google Gemini 設定 icon=lucide:terminal
export MODEL=gemini:gemini-1.5-flash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### AWS Bedrock

```bash AWS Bedrock 設定 icon=lucide:terminal
export MODEL=bedrock:anthropic.claude-3-sonnet-20240229-v1:0
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"
```

### DeepSeek

```bash DeepSeek 設定 icon=lucide:terminal
export MODEL=deepseek:deepseek-chat
export DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY
```

### Doubao

```bash Doubao 設定 icon=lucide:terminal
export MODEL=doubao:Doubao-pro-128k
export DOUBAO_API_KEY=YOUR_DOUBAO_API_KEY
```

### xAI (Grok)

```bash xAI 設定 icon=lucide:terminal
export MODEL=xai:grok-1.5-flash
export XAI_API_KEY=YOUR_XAI_API_KEY
```

### Ollama (本機模型)

```bash Ollama 設定 icon=lucide:terminal
export MODEL=ollama:llama3
export OLLAMA_DEFAULT_BASE_URL="http://localhost:11434"
```

### LMStudio (本機模型)

```bash LMStudio 設定 icon=lucide:terminal
export MODEL=lmstudio:local-model/llama-3.1-8b-instruct-gguf
export LM_STUDIO_DEFAULT_BASE_URL="http://localhost:1234/v1"
```

有關支援模型的完整列表及其設定詳細資訊，請參考[模型](./models-overview.md)部分。

## 偵錯

要深入了解 Agent 的執行流程，包括模型的呼叫和回應，您可以透過設定 `DEBUG` 環境變數來啟用偵錯日誌。

```bash 啟用偵錯日誌 icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

此指令將在您的終端機中列印詳細的日誌，這有助於了解 Agent 的內部運作並對其行為進行疑難排解。