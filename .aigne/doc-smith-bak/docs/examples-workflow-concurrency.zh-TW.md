# 工作流程並行性

並行執行任務可以顯著提高複雜工作流程的效率。本指南將示範如何使用 AIGNE 框架建立一個並行工作流程，其中多個 Agent 同時處理相同的輸入，並將其輸出進行匯總。您將學習如何設定並執行一個實際範例，該範例會同時從不同角度分析一個產品。

## 概覽

在此範例中，我們將建構一個以產品描述為輸入的工作流程。接著，兩個專業的 Agent 將並行工作：

1.  **功能提取器**：分析描述以識別並總結關鍵產品功能。
2.  **受眾分析器**：分析相同的描述以確定目標受眾。

最後，一個**匯總器**會將這兩個 Agent 的輸出合併為單一的綜合結果。這種並行處理模型非常適合可分解為獨立子任務的任務，能減少總執行時間。

下圖說明了此並行工作流程：

```d2
direction: down

Input: {
  label: "產品描述"
  shape: oval
}

Parallel-Processing: {
  label: "並行處理"
  style.stroke-dash: 2

  Feature-Extractor: {
    label: "功能提取器\n(Agent 1)"
  }

  Audience-Analyzer: {
    label: "受眾分析器\n(Agent 2)"
  }
}

Aggregator: {
  label: "匯總器"
}

Result: {
  label: "綜合結果"
  shape: oval
}

Input -> Parallel-Processing.Feature-Extractor: "分析功能"
Input -> Parallel-Processing.Audience-Analyzer: "分析受眾"
Parallel-Processing.Feature-Extractor -> Aggregator: "功能摘要"
Parallel-Processing.Audience-Analyzer -> Aggregator: "受眾輪廓"
Aggregator -> Result
```

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：
*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 一併安裝。
*   **OpenAI API 金鑰**：連接 OpenAI 模型所需。您可以從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需任何安裝。

### 執行範例

在您的終端機中執行以下指令，以不同模式執行工作流程。

*   **單次執行模式 (預設)**：處理單一、預先定義的輸入後結束。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-concurrency
    ```

*   **互動式聊天模式**：啟動一個聊天會話，您可以在其中提供多個輸入。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-concurrency --interactive
    ```

*   **管道模式**：使用來自另一個指令的管道輸入。

    ```bash icon=lucide:terminal
    echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | npx -y @aigne/example-workflow-concurrency
    ```

### 連接至 AI 模型

首次執行範例時，由於尚未設定任何 API 金鑰，系統會提示您連接至一個 AI 模型提供商。

![AI 模型設定的初始連接提示](../../../examples/workflow-concurrency/run-example.png)

您有以下幾個選項可以繼續：

1.  **透過官方 AIGNE Hub 連接 (建議)**

    這是最簡單的入門方式。新用戶可獲得免費點數。選擇第一個選項，您的瀏覽器將打開 AIGNE Hub 授權頁面。請按照螢幕上的指示批准連接。

    ![授權 AIGNE CLI 連接至 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

2.  **透過自行託管的 AIGNE Hub 連接**

    如果您有自己的 AIGNE Hub 執行個體，請選擇第二個選項。系統會提示您輸入自行託管的 Hub 的 URL 以完成連接。

    ![輸入自行託管的 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

3.  **透過第三方模型提供商連接**

    您可以透過設定包含 API 金鑰的環境變數，直接連接到像 OpenAI 這樣的提供商。例如，若要使用 OpenAI，請匯出您的金鑰並重新執行指令：

    ```bash icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    npx -y @aigne/example-workflow-concurrency --interactive
    ```

## 從原始碼安裝

若需進行開發或自訂，您可以克隆儲存庫並在本地執行範例。

### 1. 克隆儲存庫

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例的目錄並使用 pnpm 安裝所需套件。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-concurrency
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令來執行工作流程。指令行參數必須在 `--` 之後傳遞。

*   **以單次執行模式執行：**

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **以互動式聊天模式執行：**

    ```bash icon=lucide:terminal
    pnpm start -- --interactive
    ```

*   **使用管道輸入：**

    ```bash icon=lucide:terminal
    echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | pnpm start
    ```

## 執行選項

此應用程式支援數個用於自訂的指令行參數：

| 參數 | 說明 | 預設值 |
|-----------|-------------|---------|
| `--interactive` | 以互動式聊天模式執行。 | 停用 (單次執行模式) |
| `--model <provider[:model]>` | 指定要使用的 AI 模型 (例如 `openai` 或 `openai:gpt-4o-mini`)。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 提供商預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 提供商預設值 |
| `--presence-penalty <value>` | 設定存在懲罰值。 | 提供商預設值 |
| `--frequency-penalty <value>` | 設定頻率懲罰值。 | 提供商預設值 |
| `--log-level <level>` | 設定記錄層級 (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input`, `-i <input>` | 直接透過指令行指定輸入。 | 無 |

## 程式碼範例

以下 TypeScript 程式碼示範如何使用帶有 `ProcessMode.parallel` 的 `TeamAgent` 來定義和協調並行工作流程。

```typescript concurrency-workflow.ts
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 定義第一個 Agent 來提取產品功能
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.\n\nProduct description:\n{{product}}`,
  outputKey: "features",
});

// 定義第二個 Agent 來分析目標受眾
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.\n\nProduct description:\n{{product}}`,
  outputKey: "audience",
});

// 初始化 AIGNE 執行個體
const aigne = new AIGNE({ model });

// 建立一個 TeamAgent 來管理並行工作流程
const teamAgent = TeamAgent.from({
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel,
});

// 使用產品描述呼叫團隊
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);

/*
預期輸出：
{
  features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
  audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
}
*/
```

## 偵錯

AIGNE 框架包含一個內建的可觀察性工具，可幫助您監控和偵錯 Agent 的執行過程。

透過執行以下指令來啟動可觀察性伺服器：

```bash icon=lucide:terminal
aigne observe
```

![顯示 aigne observe 指令正在執行的終端機輸出](../../../examples/images/aigne-observe-execute.png)

此指令會啟動一個本地 Web 伺服器，通常位於 `http://localhost:7893`。在您的瀏覽器中打開此 URL 以存取可觀察性介面，您可以在其中檢查每個 Agent 執行的詳細追蹤，包括輸入、輸出和效能指標。

![顯示最近追蹤列表的 Aigne 可觀察性介面](../../../examples/images/aigne-observe-list.png)

## 總結

本指南介紹了如何使用 AIGNE 框架建立並執行一個並行工作流程。透過在並行模式下利用 `TeamAgent`，您可以有效地同時處理多個獨立任務。若要探索其他工作流程模式，請參閱以下範例：

<x-cards data-columns="2">
  <x-card data-title="循序工作流程" data-icon="lucide:arrow-right-circle" data-href="/examples/workflow-sequential">
    了解如何按特定、有序的順序執行 Agent。
  </x-card>
  <x-card data-title="工作流程協調" data-icon="lucide:milestone" data-href="/examples/workflow-orchestration">
    在更複雜、精密的管道中協調多個 Agent。
  </x-card>
</x-cards>
