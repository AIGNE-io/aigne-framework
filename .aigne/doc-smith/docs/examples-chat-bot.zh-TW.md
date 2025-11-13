本文提供了一份全面的指南，說明如何使用 AIGNE 框架建立和執行一個基於 Agent 的聊天機器人。您將學習如何在不安裝的情況下立即執行聊天機器人、將其連接到各種 AI 模型提供者，以及為本地開發進行設定。此範例支援單次回應（one-shot）和連續對話（interactive）兩種模式。

## 總覽

此範例透過建立一個功能齊全的聊天機器人，展示了 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework)和 [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) 的能力。此 Agent 可以在兩種主要模式下運作：

*   **單次模式 (One-shot Mode)**：聊天機器人處理單一輸入並提供單一回應後即結束。這非常適合直接提問或使用命令列管道。
*   **互動模式 (Interactive Mode)**：聊天機器人進行連續對話，在對話回合之間保持上下文，直到使用者終止會話。

## 先決條件

在繼續之前，請確保您的環境符合以下要求：

*   **Node.js**：20.0 或更高版本。
*   **npm**：隨您的 Node.js 安裝一同提供。
*   **AI 模型存取權**：需要來自像 OpenAI 這樣的提供者的 API 金鑰。或者，您也可以連接到 AIGNE Hub。

## 快速入門（無需安裝）

您可以使用 `npx` 直接從您的終端機執行聊天機器人範例，無需任何本地安裝步驟。

### 執行聊天機器人

聊天機器人可以以不同模式執行，以滿足您的需求。

*   **單次模式（預設）**：用於單一問答。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot
    ```

*   **互動聊天模式**：開始連續對話。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-chat-bot --chat
    ```

*   **管道輸入**：您可以在單次模式下將輸入直接透過管道傳送給聊天機器人。

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | npx -y @aigne/example-chat-bot
    ```

### 連接到 AI 模型

首次執行時，CLI 會提示您連接到一個 AI 模型服務。您有多個選項可供選擇。
```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Connection-Options: {
  label: "連線選項"
  shape: rectangle
  grid-columns: 3

  AIGNE-Hub-Official: {
    label: "AIGNE Hub\n(官方)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  AIGNE-Hub-Self-Hosted: {
    label: "AIGNE Hub\n(自行託管)"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "第三方提供者\n(例如 OpenAI)"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

User -> AIGNE-CLI: "1. 執行聊天機器人"
AIGNE-CLI -> User: "2. 提示連接 AI 模型"
User -> Connection-Options: "3. 選擇一個選項"

Connection-Options.AIGNE-Hub-Official -> AIGNE-CLI: "透過瀏覽器驗證連接"
Connection-Options.AIGNE-Hub-Self-Hosted -> AIGNE-CLI: "透過服務 URL 連接"
Connection-Options.AIGNE-Hub-Self-Hosted <- Blocklet-Store: "從此處部署"
Connection-Options.Third-Party-Provider -> AIGNE-CLI: "透過環境變數連接"
```
1.  **透過 AIGNE Hub 連接（官方）**
    這是為新使用者推薦的路徑。選擇此選項將在您的網頁瀏覽器中打開官方的 AIGNE Hub。請按照螢幕上的指示進行連接。新使用者會自動獲得免費的 Token 餘額以開始使用。

2.  **透過 AIGNE Hub 連接（自行託管）**
    如果您有自行運作的 AIGNE Hub 實例，請選擇此選項並輸入您服務的 URL 來完成連接。您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署一個自行託管的 AIGNE Hub。

3.  **透過第三方模型提供者連接**
    您可以透過設定必要的環境變數，直接連接到像 OpenAI 這樣的提供者。對於 OpenAI，請如下設定您的 API 金鑰：

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    設定好環境變數後，再次執行聊天機器人指令。要查看其他提供者（例如 DeepSeek、Google Gemini）支援的變數列表，請參閱儲存庫中的 `.env.local.example` 檔案。

## 本地安裝與設定

若要進行開發或自訂，您可以複製儲存庫並從您的本地機器執行此範例。

### 1. 安裝 AIGNE CLI

首先，全域安裝 AIGNE 命令列介面。

```bash icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. 複製儲存庫

複製 AIGNE 框架儲存庫，並進入聊天機器人範例的目錄。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. 在本地執行範例

在 `chat-bot` 目錄內，使用 `pnpm` 來執行啟動腳本。

*   **單次模式（預設）**：

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **互動聊天模式**：

    ```bash icon=lucide:terminal
    pnpm start --chat
    ```

*   **管道輸入**：

    ```bash icon=lucide:terminal
    echo "Tell me about the AIGNE Framework" | pnpm start
    ```

## 命令列選項

聊天機器人腳本接受多個命令列參數來自訂其行為和設定。

| 參數 | 說明 | 預設值 |
|---|---|---|
| `--chat` | 以互動模式執行聊天機器人，進行連續對話。 | 停用（單次模式） |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式為 `provider[:model]`。範例：`openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度以控制隨機性。 | 提供者預設值 |
| `--top-p <value>` | 設定用於 Token 選擇的 top-p（核取樣）值。 | 提供者預設值 |
| `--presence-penalty <value>` | 根據新 Token 是否已存在於文本中來調整懲罰。 | 提供者預設值 |
| `--frequency-penalty <value>` | 根據新 Token 在文本中的頻率來調整懲罰。 | 提供者預設值 |
| `--log-level <level>` | 設定日誌的詳細程度。選項：`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入查詢。 | 無 |

## 偵錯

AIGNE 框架包含一個強大的觀察工具，用於監控和分析 Agent 的執行情況，這對於偵錯和效能調校至關重要。

1.  **啟動觀察伺服器**
    在您的終端機中執行 `aigne observe` 指令。這會啟動一個本地網頁伺服器，用來監聽來自您的 Agent 的執行資料。

2.  **查看執行情況**
    在您的瀏覽器中打開網頁介面，以查看最近的 Agent 執行列表。您可以選擇一個執行來檢查其追蹤記錄、查看詳細的呼叫資訊，並了解 Agent 如何處理資訊及與模型互動。

## 總結

此範例為使用 AIGNE 框架建構基於 Agent 的聊天機器人提供了實用的基礎。您已經學會如何以不同模式執行聊天機器人、將其連接到 AI 模型，以及偵錯其執行過程。

若想了解更進階的範例和功能，您可能想探索以下主題：

<x-cards data-columns="2">
  <x-card data-title="記憶體" data-icon="lucide:brain-circuit" data-href="/examples/memory">了解如何賦予您的聊天機器人記憶，使其能夠回憶過去的互動。</x-card>
  <x-card data-title="AIGNE 檔案系統 (AFS)" data-icon="lucide:folder-tree" data-href="/examples/afs-system-fs">建立一個能與您的本地檔案系統互動的聊天機器人。</x-card>
  <x-card data-title="工作流編排" data-icon="lucide:workflow" data-href="/examples/workflow-orchestration">協調多個 Agent 共同處理複雜任務。</x-card>
  <x-card data-title="核心概念" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">更深入地了解 AIGNE 框架的基礎建構模組。</x-card>
</x-cards>