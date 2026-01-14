# 工作流程程式碼執行

執行由 AI 模型動態產生的程式碼會帶來重大的安全性和可靠性挑戰。本指南提供了一個結構化的逐步流程，說明如何使用 AIGNE 框架建立安全的程式碼執行工作流程。您將學習如何編排一個產生程式碼的 `Coder` Agent，以及一個在隔離環境中執行程式碼的 `Sandbox` Agent。

## 概觀

程式碼執行工作流程旨在安全地處理需要動態程式碼產生與執行的任務。它採用了一個雙 Agent 系統：

1.  **Coder Agent**：一個由 AI 驅動的 Agent，負責解讀使用者的請求並編寫必要的 JavaScript 程式碼來解決問題。
2.  **Sandbox Agent**：一個 `FunctionAgent`，它接收產生的程式碼並在受控環境中執行，然後傳回結果。

這種關注點分離確保了 AI 的程式碼產生與直接執行相隔離，提供了一層安全性。

### 邏輯流程

下圖說明了 Agent 之間的高層級互動。`Coder` Agent 接收輸入，產生程式碼，將其傳遞給 `Sandbox` 執行，然後格式化最終輸出。

```d2
direction: down

User-Input: {
  label: "使用者輸入\n(例如：'計算 15!')"
  shape: rectangle
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  Coder-Agent: {
    label: "Coder Agent\n(AIAgent)"
    shape: rectangle
  }

  Sandbox-Agent: {
    label: "Sandbox Agent\n(FunctionAgent)"
    shape: rectangle
  }
}

Final-Output: {
  label: "最終輸出"
  shape: rectangle
}

User-Input -> AIGNE-Framework.Coder-Agent: "1. 接收提示"
AIGNE-Framework.Coder-Agent -> AIGNE-Framework.Sandbox-Agent: "2. 產生 JS 程式碼並傳遞執行"
AIGNE-Framework.Sandbox-Agent -> AIGNE-Framework.Coder-Agent: "3. 執行程式碼並傳回結果"
AIGNE-Framework.Coder-Agent -> Final-Output: "4. 格式化最終回應"

```

### 互動順序

此循序圖詳細說明了使用者與 Agent 之間針對特定任務（例如計算階乘）的逐輪通訊。


## 快速入門

您可以使用 `npx` 直接執行此範例，無需任何本機安裝。

### 執行範例

此範例支援用於單一任務的一次性執行模式，以及用於對話式工作流程的互動式聊天模式。

#### 一次性模式

這是預設模式。Agent 處理單一輸入後即結束。

```bash icon=lucide:terminal
npx -y @aigne/example-workflow-code-execution
```

您也可以透過標準輸入管道直接提供輸入。

```bash icon=lucide:terminal
echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
```

#### 互動式聊天模式

使用 `--interactive` 旗標來啟動一個持續的對話，您可以在其中與 Agent 進行交談。

```bash icon=lucide:terminal
npx -y @aigne/example-workflow-code-execution --interactive
```

### 連接到 AI 模型

首次執行範例時，它會提示您連接到一個大型語言模型 (LLM)，因為 `Coder` Agent 需要它才能運作。


您有幾種選擇可以繼續。

#### 選項 1：AIGNE Hub (建議)

這是最簡單的入門方式。官方的 AIGNE Hub 為新使用者提供免費額度。

1.  選擇第一個選項：`Connect to the Arcblock official AIGNE Hub`。
2.  您的網頁瀏覽器將開啟一個授權頁面。
3.  按照提示批准連接。


#### 選項 2：自行託管的 AIGNE Hub

如果您有自己的 AIGNE Hub 執行個體，您可以連接到它。

1.  選擇第二個選項：`Connect to a self-hosted AIGNE Hub`。
2.  系統會提示您輸入您的 AIGNE Hub 執行個體的 URL。


#### 選項 3：第三方模型提供商

您可以透過設定適當的環境變數，直接連接到第三方模型提供商，如 OpenAI、Anthropic 或 Google Gemini。例如，要使用 OpenAI，請設定您的 API 金鑰：

```bash icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定環境變數後，再次執行範例指令。有關所有支援的提供商及其所需環境變數的列表，請參閱範例的 `.env.local.example` 檔案。

### 使用 AIGNE Observe 進行偵錯

AIGNE 框架包含一個強大的可觀察性工具，用於偵錯和分析 Agent 行為。

1.  **啟動伺服器**：在您的終端機中，執行 `aigne observe` 指令。這會啟動一個本機網頁伺服器。

    ```bash icon=lucide:terminal
    aigne observe
    ```

    
2.  **檢視追蹤**：開啟您的網頁瀏覽器並導覽至提供的本機 URL (例如 `http://localhost:7893`)。介面會顯示最近的 Agent 執行列表，讓您能夠檢查每個追蹤的輸入、輸出、工具呼叫和效能指標。

    
## 本機安裝與使用

出於開發目的，您可以複製儲存庫並在本機執行範例。

### 先決條件

-   [Node.js](https://nodejs.org) (版本 20.0 或更高)
-   [pnpm](https://pnpm.io) 用於套件管理

### 1. 複製儲存庫

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例目錄並安裝所需的套件。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令來執行工作流程。

```bash icon=lucide:terminal
# 以一次性模式執行 (預設)
pnpm start

# 以互動式聊天模式執行
pnpm start -- --interactive

# 使用管道輸入
echo "Calculate 15!" | pnpm start
```

### 命令列選項

該腳本接受幾個命令列參數來自訂其行為。

| 參數 | 說明 | 預設值 |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `--interactive` | 以互動式聊天模式執行。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 提供商預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 提供商預設值 |
| `--presence-penalty <value>`| 設定存在懲罰值。 | 提供商預設值 |
| `--frequency-penalty <value>`| 設定頻率懲罰值。 | 提供商預設值 |
| `--log-level <level>` | 設定記錄層級 (`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入。 | 無 |

#### 使用範例

此指令以 `DEBUG` 記錄層級在互動模式下執行工作流程。

```bash icon=lucide:terminal
pnpm start -- --interactive --log-level DEBUG
```

## 程式碼實作

以下 TypeScript 程式碼示範如何建構程式碼執行工作流程。它定義了 `sandbox` 和 `coder` Agent，並使用 AIGNE 執行個體來調用它們。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 從環境變數中取得 OpenAI API 金鑰。
const { OPENAI_API_KEY } = process.env;

// 1. 初始化聊天模型
// 此模型將為 AI Agent 提供支援。
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定義 Sandbox Agent
// 此 Agent 使用 FunctionAgent 安全地執行 JavaScript 程式碼。
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "一個用於執行 JavaScript 程式碼的 js 沙箱",
  inputSchema: z.object({
    code: z.string().describe("要執行的程式碼"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // eval 的使用被隔離在此沙箱化的 Agent 中。
    // biome-ignore lint/security/noGlobalEval: <這是用於範例的受控沙箱環境>
    const result = eval(code);
    return { result };
  },
});

// 3. 定義 Coder Agent
// 此 AI Agent 被指示編寫程式碼並使用沙箱技能。
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
您是一位熟練的程式設計師。您編寫程式碼來解決問題。
與沙箱協作以執行您的程式碼。
`,
  skills: [sandbox],
});

// 4. 初始化 AIGNE 框架
const aigne = new AIGNE({ model });

// 5. 調用工作流程
// AIGNE 執行個體使用使用者的提示來執行 coder Agent。
const result = await aigne.invoke(coder, "10! = ?");

console.log(result);
// 預期輸出:
// {
//   $message: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
```

## 總結

本指南示範了如何使用 AIGNE 框架建立並執行一個安全的程式碼執行工作流程。透過將程式碼產生和執行的關注點分離到不同的 `AIAgent` 和 `FunctionAgent` 角色中，您可以安全地利用 LLM 的強大功能來處理需要動態程式碼的任務。

若想了解更進階的工作流程模式，請探索以下範例：

<x-cards data-columns="2">
  <x-card data-title="循序工作流程" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right-circle">建立具備保證執行順序的逐步處理管道。</x-card>
  <x-card data-title="工作流程編排" data-href="/examples/workflow-orchestration" data-icon="lucide:milestone">協調多個 Agent 在複雜的處理管道中協同工作。</x-card>
</x-cards>
