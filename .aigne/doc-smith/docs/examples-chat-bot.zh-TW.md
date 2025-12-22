# 聊天機器人

本指南全面介紹了基於 Agent 的聊天機器人範例。您將學習如何在不同模式下執行聊天機器人、將其連接到各種 AI 模型提供商，並使用 AIGNE 可觀測性工具來偵錯其執行過程。本範例旨在開箱即用，讓您無需任何本地安裝即可開始使用。

## 總覽

本範例展示如何使用 AIGNE 框架建立並執行一個簡單而強大的基於 Agent 的聊天機器人。它支援兩種主要的操作模式：
*   **單次模式 (One-shot mode)**：聊天機器人接受單次輸入，提供回應後即退出。
*   **互動模式 (Interactive mode)**：聊天機器人進行持續對話，直到您決定結束對話。

聊天機器人可配置使用不同的 AI 模型，並可直接從命令列或透過管道接受輸入。

## 先決條件

在執行此範例之前，請確保您的系統上已安裝以下軟體：

*   [Node.js](https://nodejs.org) (版本 20.0 或更高)
*   一個 [OpenAI API 金鑰](https://platform.openai.com/api-keys)或對 AIGNE Hub 的存取權限，以進行模型互動。

## 快速入門

您可以直接使用 `npx` 執行此範例，而無需複製儲存庫或在本地安裝任何相依套件。

### 執行範例

在您的終端機中執行以下命令來啟動聊天機器人。

在預設的單次模式下執行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-chat-bot
```

使用 `--chat` 旗標在互動式聊天模式下執行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-chat-bot --chat
```

使用管道輸入直接提供提示：
```bash npx command icon=lucide:terminal
echo "Tell me about AIGNE Framework" | npx -y @aigne/example-chat-bot
```

### 連接到 AI 模型

首次執行此範例時，由於未配置任何 API 金鑰，它會提示您連接到 AI 模型服務。下圖說明了可用的連接選項：

```d2
direction: down

Chatbot-Example: {
  label: "聊天機器人範例\n(@aigne/example-chat-bot)"
  shape: rectangle
}

Connection-Options: {
  label: "連接選項"
  shape: rectangle
  style: {
    stroke-dash: 4
  }

  Official-AIGNE-Hub: {
    label: "1. 官方 AIGNE Hub\n（推薦）"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Self-Hosted-Hub: {
    label: "2. 自架 AIGNE Hub"
    icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
  }

  Third-Party-Provider: {
    label: "3. 第三方提供商\n（例如 OpenAI）"
    shape: rectangle
  }
}

Blocklet-Store: {
  label: "Blocklet Store"
  icon: "https://store.blocklet.dev/assets/z8ia29UsENBg6tLZUKi2HABj38Cw1LmHZocbQ/logo.png"
}

Chatbot-Example -> Connection-Options: "提示使用者連接到 AI 模型"
Connection-Options.Self-Hosted-Hub -> Blocklet-Store: "從此處安裝"
```

![連接 AI 模型的初始設定提示。](../../../examples/chat-bot/run-example.png)

您有以下幾個選項可以繼續：

#### 1. 連接到官方 AIGNE Hub（推薦）

這是最簡單的入門方式。
1.  選擇第一個選項：`Connect to the Arcblock official AIGNE Hub`。
2.  您的網頁瀏覽器將打開一個頁面以授權 AIGNE CLI。
3.  按照螢幕上的指示批准連接。新使用者會收到免費的 token 補助以使用該服務。

![授權 AIGNE CLI 連接到 AIGNE Hub。](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 連接到自架的 AIGNE Hub

如果您正在執行自己的 AIGNE Hub 實例：
1.  選擇第二個選項：`Connect to a self-hosted AIGNE Hub instance`。
2.  在提示時輸入您自架 AIGNE Hub 的 URL。
3.  按照後續提示完成連接。

如果您需要設定一個自架的 AIGNE Hub，可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安裝。

![輸入自架 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 透過第三方模型提供商連接

您也可以透過設定適當的環境變數，直接連接到第三方 AI 模型提供商，例如 OpenAI。舉例來說，若要使用 OpenAI，請如下設定您的 API 金鑰：

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定環境變數後，再次執行此範例。有關支援的提供商及其所需環境變數的列表，請參考範例設定檔。

## 本地安裝與使用

出於開發目的，您可能希望複製儲存庫並在本地執行此範例。

### 1. 安裝 AIGNE CLI

首先，全域安裝 AIGNE 命令列介面（CLI）。

```bash 安裝 AIGNE CLI icon=lucide:terminal
npm install -g @aigne/cli
```

### 2. 複製儲存庫

複製 `aigne-framework` 儲存庫並導覽至 `chat-bot` 範例目錄。

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
cd aigne-framework/examples/chat-bot
```

### 3. 在本地執行範例

使用 `pnpm start` 命令來執行聊天機器人。

在預設的單次模式下執行：
```bash pnpm command icon=lucide:terminal
pnpm start
```

在互動式聊天模式下執行：
```bash pnpm command icon=lucide:terminal
pnpm start --chat
```

使用管道輸入：
```bash pnpm command icon=lucide:terminal
echo "Tell me about AIGNE Framework" | pnpm start
```

## 命令列選項

聊天機器人腳本接受數個命令列參數以自訂其行為。

| 參數 | 說明 | 預設值 |
|---|---|---|
| `--chat` | 以互動式聊天模式執行。若省略，則以單次模式執行。 | `Disabled` |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式為 `provider[:model]`。範例：`openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度，控制隨機性。 | 提供商預設值 |
| `--top-p <value>` | 設定模型生成的 top-p（核心取樣）值。 | 提供商預設值 |
| `--presence-penalty <value>` | 設定存在懲罰值，以影響主題多樣性。 | 提供商預設值 |
| `--frequency-penalty <value>` | 設定頻率懲罰值，以減少重複性輸出。 | 提供商預設值 |
| `--log-level <level>` | 設定記錄層級。選項為 `ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入提示。 | `None` |

## 使用 AIGNE Observe 進行偵錯

AIGNE 包含一個強大的本地可觀測性工具，用於偵錯和分析 Agent 的執行過程。`aigne observe` 命令會啟動一個本地網頁伺服器，提供一個使用者介面來檢查執行追蹤。

首先，在您的終端機中啟動觀察伺服器：

```bash aigne observe icon=lucide:terminal
aigne observe
```

![終端機輸出顯示 aigne observe 伺服器正在執行。](../../../examples/images/aigne-observe-execute.png)

執行聊天機器人後，您可以在瀏覽器中打開提供的 URL（通常是 `http://localhost:7893`）來查看最近的 Agent 執行列表。此介面可讓您檢查每次執行的詳細資訊，包括輸入、輸出、模型呼叫和效能指標，這對於偵錯和最佳化非常有價值。

![AIGNE 可觀測性介面顯示追蹤列表。](../../../examples/images/aigne-observe-list.png)

## 總結

本範例為使用 AIGNE 框架建構基於 Agent 的聊天機器人提供了實用的基礎。您已經學會如何執行範例、將其連接到各種 AI 模型，並利用內建的可觀測性工具進行偵錯。

若想了解更進階的主題和範例，您可能會發現以下文件很有幫助：

<x-cards data-columns="2">
  <x-card data-title="記憶體" data-icon="lucide:brain-circuit" data-href="/examples/memory">
    了解如何為您的聊天機器人增加記憶體，以在對話中保持上下文。
  </x-card>
  <x-card data-title="AIGNE 核心概念" data-icon="lucide:book-open" data-href="/developer-guide/core-concepts">
    深入了解 AIGNE 框架的基礎建構模組。
  </x-card>
</x-cards>