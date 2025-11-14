# 工作流程群組聊天

本指南將示範如何使用 AIGNE 框架建構並執行多 Agent 群組聊天工作流程。您將學習如何協調多個 Agent（包括一位管理者）協同完成一項任務，模擬一個團隊環境，讓他們共享訊息並共同合作以達成共同目標。

## 概覽

群組聊天工作流程範例展示了一個複雜的多 Agent 系統，其中具有專門角色的不同 Agent 協同合作以完成使用者的請求。此過程由一位 `Group Manager` Agent 管理，它負責引導其他 Agent（如 `Writer`、`Editor` 和 `Illustrator`）之間的對話和任務執行。

此範例支援兩種主要操作模式：
*   **單次執行模式 (One-shot mode)**：工作流程根據單一輸入執行一次直到完成。
*   **互動模式 (Interactive mode)**：工作流程進行持續對話，允許後續提問和動態互動。

核心互動模型如下：

```d2
direction: down

User: {
  shape: c4-person
}

GroupChat: {
  label: "群組聊天工作流程"
  shape: rectangle

  Group-Manager: {
    label: "群組管理者"
    shape: rectangle
  }

  Collaborators: {
    label: "協作者"
    shape: rectangle
    grid-columns: 3

    Writer: {
      shape: rectangle
    }
    Editor: {
      shape: rectangle
    }
    Illustrator: {
      shape: rectangle
    }
  }
}

User -> GroupChat.Group-Manager: "1. 使用者請求"
GroupChat.Group-Manager -> GroupChat.Collaborators.Writer: "2. 委派任務"
GroupChat.Collaborators.Writer <-> GroupChat.Collaborators.Editor: "3. 協作"
GroupChat.Collaborators.Editor <-> GroupChat.Collaborators.Illustrator: "4. 協作"
GroupChat.Collaborators.Writer -> GroupChat.Group-Manager: "5. 傳送結果"
GroupChat.Group-Manager -> User: "6. 最終輸出"
```

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：
*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 一併安裝。
*   **OpenAI API 金鑰**：預設模型組態所需。您可以從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需複製儲存庫。

### 執行範例

在您的終端機中執行以下命令之一：

若要在預設的單次執行模式下執行工作流程：
```bash 在單次執行模式下執行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

若要啟動互動式聊天會話：
```bash 在互動模式下執行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

您也可以透過管線直接提供輸入：
```bash 使用管線輸入執行 icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### 連接到 AI 模型

首次執行範例時，由於尚未設定任何 API 金鑰，它會提示您連接到一個 AI 模型提供者。

![Initial setup prompt for connecting to an AI model.](../../../examples/workflow-group-chat/run-example.png)

您有幾種選項可以繼續：

#### 1. 連接到 AIGNE Hub（建議）

這是最簡單的入門方式，並為新使用者提供免費額度。

1.  選擇第一個選項：`Connect to the Arcblock official AIGNE Hub`。
2.  您的網頁瀏覽器將打開一個頁面以授權 AIGNE CLI。
3.  點擊「Approve」以授予必要的權限。CLI 將會自動設定。

![Authorization dialog for AIGNE Hub connection.](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 連接到自行託管的 AIGNE Hub

如果您正在執行自己的 AIGNE Hub 實例：

1.  選擇第二個選項：`Connect to your self-hosted AIGNE Hub`。
2.  在提示時輸入您的 AIGNE Hub 實例的 URL。
3.  按照瀏覽器中的指示完成連接。

![Prompt to enter the URL for a self-hosted AIGNE Hub.](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 設定第三方模型提供者

您可以透過設定環境變數直接連接到像 OpenAI 這樣的提供者。

1.  退出互動式提示。
2.  在您的終端機中設定 `OPENAI_API_KEY` 環境變數：

    ```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

3.  再次執行範例命令。

對於其他提供者，如 Google Gemini 或 DeepSeek，請參閱專案中的 `.env.local.example` 檔案以了解正確的環境變數名稱。

## 本地安裝與使用

為了開發目的，您可以複製儲存庫並在本地執行此範例。

### 1. 複製儲存庫

```bash 複製框架儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例的目錄並使用 `pnpm` 安裝所需的套件。

```bash 安裝依賴項 icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 命令來執行工作流程。命令列參數必須在 `--` 之後傳遞。

若要在單次執行模式下執行：
```bash 在單次執行模式下執行 icon=lucide:terminal
pnpm start
```

若要在互動式聊天模式下執行：
```bash 在互動模式下執行 icon=lucide:terminal
pnpm start -- --chat
```

若要使用管線輸入：
```bash 使用管線輸入執行 icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

### 命令列選項

此範例接受數個命令列參數來自訂其行為：

| 參數 | 說明 | 預設值 |
|-----------|-------------|---------|
| `--chat` | 以互動式聊天模式執行 | 禁用（單次執行模式） |
| `--model <provider[:model]>` | 要使用的 AI 模型，格式為 'provider\[:model]'，其中 model 是可選的。範例：'openai' 或 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | 模型生成的溫度值 | 提供者預設值 |
| `--top-p <value>` | Top-p 取樣值 | 提供者預設值 |
| `--presence-penalty <value>` | 存在懲罰值 | 提供者預設值 |
| `--frequency-penalty <value>` | 頻率懲罰值 | 提供者預設值 |
| `--log-level <level>` | 設定記錄層級（ERROR, WARN, INFO, DEBUG, TRACE） | INFO |
| `--input`, `-i <input>` | 直接指定輸入 | 無 |

#### 範例

```bash 設定記錄層級 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 使用特定模型 icon=lucide:terminal
pnpm start -- --model openai:gpt-4o-mini
```

## 使用 AIGNE Observe 進行偵錯

要檢查執行流程並偵錯 Agent 的行為，您可以使用 `aigne observe` 命令。此工具會啟動一個本地網頁伺服器，提供 Agent 追蹤的詳細視圖。

首先，在一個獨立的終端機中啟動可觀察性伺服器：
```bash 啟動可觀察性伺服器 icon=lucide:terminal
aigne observe
```
![Terminal output showing the AIGNE Observe server starting.](../../../examples/images/aigne-observe-execute.png)

執行工作流程範例後，在瀏覽器中打開 `http://localhost:7893` 以查看追蹤記錄。您可以檢查每個 Agent 在整個執行過程中的輸入、輸出和內部狀態。

![AIGNE Observe web interface showing a list of traces.](../../../examples/images/aigne-observe-list.png)

## 總結

本指南提供了執行工作流程群組聊天範例的逐步說明。您學習了如何使用 `npx` 執行工作流程、連接到各種 AI 模型提供者，以及如何在本地安裝以進行開發。您還了解了如何使用 `aigne observe` 來偵錯 Agent 的互動。

若要了解更複雜的模式，請探索 AIGNE 框架文件中的其他範例。

<x-cards data-columns="2">
  <x-card data-title="工作流程：交接" data-icon="lucide:arrow-right-left" data-href="/examples/workflow-handoff">
    學習如何在專業 Agent 之間建立無縫過渡，以解決複雜問題。
  </x-card>
  <x-card data-title="工作流程：協調" data-icon="lucide:network" data-href="/examples/workflow-orchestration">
    探索如何協調多個 Agent 在複雜的處理流程中協同工作。
  </x-card>
</x-cards>