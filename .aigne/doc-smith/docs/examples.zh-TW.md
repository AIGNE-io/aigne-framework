# 範例

準備好看看 AIGNE 框架的實際應用了嗎？本節提供了一系列全面的實用範例，展示了各種功能和工作流程模式。您可以跳過複雜的設定，直接透過一鍵式指令來執行功能齊全的 Agent。

## 總覽

AIGNE 框架範例為從智慧聊天機器人到複雜的多 Agent 工作流程等一系列應用提供了實作示範。每個範例都是一個獨立、可執行的演示，旨在說明框架的特定功能。您可以探索模型情境協議（MCP）整合、記憶體持久化、並行和順序任務處理以及動態程式碼執行等主題。

有關特定功能或工作流程的詳細資訊，請參閱相應的範例文件：

<x-cards data-columns="3">
  <x-card data-title="聊天機器人" data-icon="lucide:bot" data-href="/examples/chat-bot">示範如何建立並執行一個基於 Agent 的聊天機器人。</x-card>
  <x-card data-title="AFS 系統檔案系統" data-icon="lucide:folder-git-2" data-href="/examples/afs-system-fs">展示如何建構一個可以與本機檔案系統互動的聊天機器人。</x-card>
  <x-card data-title="記憶體" data-icon="lucide:database" data-href="/examples/memory">說明如何建立一個具有持久性記憶體的聊天機器人。</x-card>
  <x-card data-title="MCP 伺服器" data-icon="lucide:server" data-href="/examples/mcp-server">展示如何將 AIGNE Agent 作為 MCP 伺服器執行。</x-card>
  <x-card data-title="MCP 整合" data-icon="lucide:plug" data-href="/examples/mcp-blocklet">探索與 Blocklet、GitHub、Puppeteer 和 SQLite 的整合。</x-card>
  <x-card data-title="程式碼執行" data-icon="lucide:terminal" data-href="/examples/workflow-code-execution">學習如何在工作流程中安全地執行動態產生的程式碼。</x-card>
  <x-card data-title="並行" data-icon="lucide:git-compare-arrows" data-href="/examples/workflow-concurrency">透過平行處理多個任務來最佳化效能。</x-card>
  <x-card data-title="群組聊天" data-icon="lucide:messages-square" data-href="/examples/workflow-group-chat">建構多個 Agent 可以互動和分享訊息的環境。</x-card>
  <x-card data-title="順序" data-icon="lucide:arrow-right" data-href="/examples/workflow-sequential">建構具有保證執行順序的逐步處理管線。</x-card>
</x-cards>

## 快速入門（無需安裝）

您可以使用 `npx` 直接從終端機執行任何範例，無需複製儲存庫或進行本機安裝。

### 先決條件

請確保您的系統上已安裝 Node.js（版本 20.0 或更高）和 npm。

### 執行範例

以下指令以單次模式執行基本的聊天機器人範例，它會接收一個預設提示，提供回應，然後退出。

```bash 以單次模式執行 icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

若要與 Agent 進行互動式對話，請加上 `--chat` 旗標。

```bash 以互動模式執行 icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

您也可以將輸入直接透過管道傳送給 Agent。

```bash 使用管道輸入 icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

## 連接到 AI 模型

執行範例需要連接到 AI 模型。如果您在沒有任何先前設定的情況下執行指令，系統將提示您進行連接。

![未設定模型時的初始連接提示](../../../examples/chat-bot/run-example.png)

您有三種選項可以建立連接：

### 1. 連接到官方 AIGNE Hub

這是推薦給新使用者的選項。AIGNE Hub 提供了無縫的連接體驗，並為新使用者提供免費的權杖，讓他們可以立即開始使用。

-   在提示中選擇第一個選項。
-   您的瀏覽器將打開官方的 AIGNE Hub 頁面。
-   按照螢幕上的說明授權 AIGNE CLI。

![授權 AIGNE CLI 連接到 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

### 2. 連接到自行託管的 AIGNE Hub

如果您的組織執行 AIGNE Hub 的私有實例，您可以直接連接到它。

-   在提示中選擇第二個選項。
-   輸入您自行託管的 AIGNE Hub 的 URL，並按照提示完成連接。

![輸入自行託管的 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

如果您需要部署自己的 AIGNE Hub，可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 進行部署。

### 3. 透過第三方模型提供商連接

您可以透過設定適當的環境變數，直接連接到第三方 AI 模型提供商。退出互動式提示，並為您選擇的提供商設定 API 金鑰。

例如，若要使用 OpenAI，請設定 `OPENAI_API_KEY` 環境變數：

```bash 設定您的 OpenAI API 金鑰 icon=lucide:key-round
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定金鑰後，再次執行範例指令。

## 設定語言模型

可以透過設定 `MODEL` 環境變數以及相應的 API 金鑰，將範例設定為使用各種大型語言模型。`MODEL` 變數遵循 `provider:model-name` 的格式。

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

有關支援模型的完整列表及其設定詳細資訊，請參閱 [模型總覽](./models-overview.md) 部分。

## 偵錯與觀測

若要深入了解 Agent 的執行流程，您可以使用兩種主要方法：用於即時終端機輸出的偵錯日誌，以及用於更詳細、基於 Web 分析的 AIGNE 可觀測性伺服器。

### 偵錯日誌

透過設定 `DEBUG` 環境變數來啟用偵錯日誌記錄。這會將有關模型呼叫、回應和其他內部操作的詳細資訊直接列印到您的終端機。

```bash 啟用偵錯日誌 icon=lucide:terminal
DEBUG=* npx -y @aigne/example-chat-bot --chat
```

### AIGNE Observe

`aigne observe` 指令會啟動一個本機 Web 伺服器，用於監控和分析 Agent 的執行資料。這個工具對於偵錯、效能調整以及了解您的 Agent 如何處理資訊至關重要。

1.  **安裝 AIGNE CLI：**

    ```bash 安裝 AIGNE CLI icon=lucide:terminal
    npm install -g @aigne/cli
    ```

2.  **啟動觀測伺服器：**

    ```bash 啟動觀測伺服器 icon=lucide:terminal
    aigne observe
    ```

    ![AIGNE 可觀測性伺服器在終端機中啟動](../../../examples/images/aigne-observe-execute.png)

3.  **檢視追蹤：**

    執行範例後，在瀏覽器中開啟 `http://localhost:7893` 以檢查追蹤、檢視詳細的呼叫資訊，並了解您的 Agent 的執行期行為。

    ![AIGNE Observe UI 中最近的 Agent 執行列表](../../../examples/images/aigne-observe-list.png)