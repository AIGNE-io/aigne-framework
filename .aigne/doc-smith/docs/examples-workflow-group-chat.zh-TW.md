# 工作流程群組聊天

本文件提供逐步指南，說明如何使用 AIGNE 框架建構並執行多 Agent 群組聊天應用程式。您將學習如何協調多個 AI Agent——管理者、作者、編輯和插畫家——協同完成一項任務，展示複雜 Agent 工作流程的實際應用。

## 總覽

在此工作流程中，`Group Manager` Agent 擔任中央協調者。當使用者提供指令時，管理者會將請求導向至適當的專業 Agent。然後，Agent 們透過在群組內共享訊息來協作完成任務。

下圖說明了此互動流程：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  Group-Manager: {
    label: "群組管理者"
  }

  Writer: {
    label: "作者"
  }

  Editor: {
    label: "編輯"
  }

  Illustrator: {
    label: "插畫家"
  }

}

User -> AIGNE-Framework.Group-Manager: "1. 傳送指令"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Writer: "2. 指派任務"
AIGNE-Framework.Writer -> AIGNE-Framework.Editor: "3. 分享草稿（群組訊息）"
AIGNE-Framework.Writer -> AIGNE-Framework.Illustrator: "3. 分享草稿（群組訊息）"
AIGNE-Framework.Writer -> User: "3. 分享草稿（群組訊息）"
AIGNE-Framework.Group-Manager -> AIGNE-Framework.Illustrator: "4. 請求建立圖片"
```

互動流程如下：

1.  **使用者**向**群組管理者**傳送指令。
2.  **群組管理者**將初始任務指派給**作者** Agent。
3.  **作者** Agent 撰寫內容草稿並以群組訊息的形式分享，供**編輯**、**插畫家**和**使用者**檢視。
4.  **管理者**接著請求**插畫家**根據故事內容創作一張圖片。
5.  此協作過程將持續進行，直到初始指令完成為止。

## 前置需求

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨您的 Node.js 安裝一同提供。
*   **OpenAI API 金鑰**：Agent 與 OpenAI 語言模型互動所需。請從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得金鑰。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需複製儲存庫。

### 執行範例

此應用程式支援多種執行模式。

#### 單次執行模式

在預設模式下，應用程式處理單一輸入指令後即終止。

```bash 以單次執行模式執行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat
```

#### 互動式聊天模式

使用 `--chat` 旗標以互動模式執行應用程式，進行連續對話。

```bash 以互動式聊天模式執行 icon=lucide:terminal
npx -y @aigne/example-workflow-group-chat --chat
```

#### 管線輸入

您也可以直接從終端機透過管線傳送輸入。

```bash 使用管線輸入 icon=lucide:terminal
echo "Write a short story about space exploration" | npx -y @aigne/example-workflow-group-chat
```

### 連接至 AI 模型

首次執行範例時，系統會提示您連接至 AI 模型供應商。

![連接至 AI 模型](/sources/examples/workflow-group-chat/run-example.png)

您有以下幾種選擇：

1.  **AIGNE Hub (官方)**：建議的方法。官方 Hub 為新使用者提供免費 token。
2.  **自行託管的 AIGNE Hub**：透過提供其 URL 連接到您自己的 AIGNE Hub 執行個體。
3.  **第三方模型供應商**：透過設定適當的環境變數，直接連接到如 OpenAI 等供應商。對於 OpenAI，請如下設定您的 API 金鑰：

    ```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key-here"
    ```

設定完成後，再次執行 `npx` 指令。

## 從原始碼執行

若要檢視或修改程式碼，您可以複製儲存庫並在本地執行此範例。

### 1. 複製儲存庫

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴套件

導覽至範例目錄並使用 `pnpm` 安裝所需的套件。

```bash 安裝依賴套件 icon=lucide:terminal
cd aigne-framework/examples/workflow-group-chat
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令來執行應用程式。命令列參數必須在 `--` 之後傳遞。

```bash 以單次執行模式執行 icon=lucide:terminal
pnpm start
```

```bash 以互動式聊天模式執行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 使用管線輸入 icon=lucide:terminal
echo "Write a short story about space exploration" | pnpm start
```

## 命令列選項

應用程式的行為可透過以下命令列參數進行自訂。

| 參數 | 說明 | 預設值 |
|---|---|---|
| `--chat` | 以互動式聊天模式執行 | 停用（單次執行模式） |
| `--model <provider[:model]>` | 要使用的 AI 模型，格式為 'provider\[:model]'，其中 model 是選填的。範例：'openai' 或 'openai:gpt-4o-mini' | openai |
| `--temperature <value>` | 模型生成的溫度值 | 供應商預設值 |
| `--top-p <value>` | Top-p 取樣值 | 供應商預設值 |
| `--presence-penalty <value>` | 存在懲罰值 | 供應商預設值 |
| `--frequency-penalty <value>` | 頻率懲罰值 | 供應商預設值 |
| `--log-level <level>` | 設定日誌記錄層級 (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | 直接指定輸入 | 無 |

### 使用範例

以下指令會以 `DEBUG` 的日誌記錄層級執行應用程式：

```bash 設定日誌記錄層級 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## 偵錯

若要檢視和分析 Agent 行為，請使用 `aigne observe` 指令。此工具會啟動一個本地網頁伺服器，提供一個介面來檢視執行追蹤、呼叫詳情以及其他執行期資料，這對於偵錯 Agent 工作流程至關重要。

若要啟動觀察伺服器，請執行：

```bash 啟動觀察伺服器 icon=lucide:terminal
aigne observe
```

![啟動 aigne observe](/sources/examples/images/aigne-observe-execute.png)

一旦執行，網頁介面將顯示最近的 Agent 執行清單，讓您能深入檢視每次執行的詳細資訊。

![檢視最近的執行](/sources/examples/images/aigne-observe-list.png)

## 總結

本指南已示範如何執行與設定一個協作式、多 Agent 的群組聊天。若要探索其他進階工作流程模式，請參考以下範例：

<x-cards data-columns="2">
  <x-card data-title="工作流程：交接" data-href="/examples/workflow-handoff" data-icon="lucide:arrow-right-left">
  學習如何在專業 Agent 之間建立無縫轉換，以解決複雜問題。
  </x-card>
  <x-card data-title="工作流程：協調" data-href="/examples/workflow-orchestration" data-icon="lucide:network">
  在複雜的處理管線中協調多個 Agent 協同工作。
  </x-card>
</x-cards>