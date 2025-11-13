# 工作流程式碼執行

本文件提供建立安全、由 AI 驅動的工作流程的技術演練，該工作流程能動態產生並執行程式碼。閱讀完畢後，您將了解如何協調一個撰寫 JavaScript 解決問題的「Coder」Agent，以及一個安全執行程式碼的「Sandbox」Agent，從而實現複雜的自動化問題解決方案。

## 概述

在許多進階的 AI 應用中，有必要解決超出標準語言模型能力的計算或邏輯問題。本範例實作了一種常見且強大的模式：使用一個 AI Agent 撰寫程式碼，並由另一個隔離的 Agent 執行。這種方法讓系統能夠動態執行複雜的計算、資料操作和其他程式化任務。

此工作流程包含兩個主要的 Agent：
*   **Coder Agent**：一個 `AIAgent`，負責理解使用者請求並撰寫 JavaScript 程式碼以完成任務。
*   **Sandbox Agent**：一個 `FunctionAgent`，封裝了一個 JavaScript 評估環境。它從 Coder 接收程式碼、執行它，並回傳結果。這會將程式碼執行隔離，防止其影響主應用程式。

這種關注點分離確保了安全性與模組化。下圖說明了高層級的資料流。

```d2
direction: down

User: {
  shape: c4-person
}

Workflow: {
  label: "AI 工作流"
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

User -> Workflow.Coder-Agent: "1. 問題請求\n(例如：'計算 10!')"
Workflow.Coder-Agent -> Workflow.Sandbox-Agent: "2. 產生並執行 JS\n(例如：'evaluateJs({ code: ... })')"
Workflow.Sandbox-Agent -> Workflow.Coder-Agent: "3. 回傳結果\n(例如：3628800)"
Workflow.Coder-Agent -> User: "4. 最終答案\n(例如：'10! 是 3628800')"

```

以下的序列圖詳細說明了使用者與 Agent 之間針對範例請求的互動。

DIAGRAM_PLACEHOLDER

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 一起安裝。
*   **OpenAI API 金鑰**：Coder Agent 與 AI 模型互動所需。您可以從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得金鑰。

## 快速入門

您可以使用 `npx` 直接從命令列執行此範例，無需在本機安裝。

### 執行範例

在您的終端機中執行以下其中一個指令：

*   **單次模式**：Agent 處理單一輸入後即結束。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution
    ```

*   **互動式聊天模式**：與 Agent 啟動一個持續的聊天會話。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-code-execution --chat
    ```

*   **管道模式**：從另一個指令透過管道傳入輸入。

    ```bash icon=lucide:terminal
    echo 'Calculate 15!' | npx -y @aigne/example-workflow-code-execution
    ```

### 連線至 AI 模型

首次執行範例時，系統會提示您連線至 AI 模型提供者。

![連線至模型提供者](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/workflow-code-execution/run-example.png)

您有幾個選項：

1.  **AIGNE Hub (官方)**：最簡單的入門方式。它為新使用者提供免費額度。

    ![連線至官方 AIGNE Hub](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

2.  **AIGNE Hub (自行託管)**：連線至您自己的 AIGNE Hub 執行個體。

    ![連線至自行託管的 AIGNE Hub](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **第三方模型提供者**：設定直接連線至 OpenAI、DeepSeek 或 Google Gemini 等提供者。為此，請將相應的 API 金鑰設定為環境變數。對於 OpenAI，請使用：

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="your-openai-api-key"
    ```

    設定環境變數後，再次執行範例。

## 完整安裝與使用

若要開發或修改此範例，請複製儲存庫並在本機安裝依賴項。

### 1. 複製儲存庫

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例目錄並使用 `pnpm` 安裝必要的套件。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-code-execution
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令來執行工作流程。

*   **單次模式**：

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **互動式聊天模式**：

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

*   **管道模式**：

    ```bash icon=lucide:terminal
    echo "Calculate 15!" | pnpm start
    ```

### 命令列選項

此範例支援數個命令列參數來自訂其行為。

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--chat` | 以互動式聊天模式執行。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型 (例如：`openai` 或 `openai:gpt-4o-mini`)。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 提供者預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 提供者預設值 |
| `--presence-penalty <value>` | 設定存在懲罰值。 | 提供者預設值 |
| `--frequency-penalty <value>` | 設定頻率懲罰值。 | 提供者預設值 |
| `--log-level <level>` | 設定日誌層級 (`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入。 | 無 |

## 程式碼實作

以下的 TypeScript 程式碼概述了程式碼執行工作流程的核心邏輯。它定義了 `sandbox` 和 `coder` Agent，並調用它們來解決問題。

```typescript code-execution.ts icon=logos:typescript
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

// 確保 OpenAI API 金鑰在環境變數中可用。
const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 建立 Sandbox Agent
// 此 Agent 使用 FunctionAgent 安全地執行 JavaScript 程式碼。
const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "一個用於執行 javascript 程式碼的 js 沙箱",
  inputSchema: z.object({
    code: z.string().describe("要執行的程式碼"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // eval 的使用被隔離在此沙箱 Agent 內。
    // biome-ignore lint/security/noGlobalEval: 這是為沙箱環境刻意使用的。
    const result = eval(code);
    return { result };
  },
});

// 3. 建立 Coder Agent
// 此 AI Agent 被指示使用沙箱技能來撰寫並執行程式碼。
const coder = AIAgent.from({
  name: "coder",
  instructions: `\
你是一個熟練的程式設計師。你撰寫程式碼來解決問題。
與沙箱協作以執行你的程式碼。
`,
  skills: [sandbox],
});

// 4. 初始化 AIGNE 框架
const aigne = new AIGNE({ model });

// 5. 調用工作流程
const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
```

預期的輸出是一個 JSON 物件，其中包含來自 Agent 的最終訊息：

```json
{
  "$message": "The value of \\(10!\\) (10 factorial) is 3,628,800."
}
```

## 偵錯

您可以使用 AIGNE 觀察者工具來監控和分析 Agent 的執行。它提供一個基於 Web 的介面來檢查追蹤、查看詳細的呼叫，並了解 Agent 在執行時的行為。

首先，在一個獨立的終端機中啟動觀察伺服器：

```bash icon=lucide:terminal
aigne observe
```

執行您的工作流程後，您可以在觀察者 UI 中查看執行追蹤。

![AIGNE Observe 執行](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

UI 提供了一個最近執行的列表，以供詳細檢查。

![AIGNE Observe 列表](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)