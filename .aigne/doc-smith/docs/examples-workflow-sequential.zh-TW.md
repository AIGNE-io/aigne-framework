# 循序工作流程

本指南將示範如何建構一個循序處理的管線，其中任務會按照保證的順序執行。您將學習如何將多個 Agent 串連在一起，讓一個 Agent 的輸出成為下一個 Agent 的輸入，從而建立一個可靠且可預測的工作流程。

此範例非常適合需要一系列轉換或分析的流程，例如起草內容、對其進行精煉，然後將其格式化以供發布。對於可以從同步任務執行中受益的工作流程，請參閱 [工作流程並行](./examples-workflow-concurrency.md) 範例。

## 總覽

循序工作流程會按照預先定義的順序處理任務。每個步驟都必須完成後，下一個步驟才能開始，以確保從輸入到最終輸出的有序進展。此模式是建構複雜、多階段代理系統的基礎。

```d2
direction: down

Input: {
  label: "輸入\n（產品描述）"
  shape: oval
}

Sequential-Workflow: {
  label: "循序工作流程 (TeamAgent)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Concept-Extractor: {
    label: "1. 概念提取器"
    shape: rectangle
  }

  Writer: {
    label: "2. 寫手"
    shape: rectangle
  }

  Format-Proofread: {
    label: "3. 格式化與校對"
    shape: rectangle
  }
}

Output: {
  label: "最終輸出\n（概念、草稿、內容）"
  shape: oval
}

Input -> Sequential-Workflow.Concept-Extractor
Sequential-Workflow.Concept-Extractor -> Sequential-Workflow.Writer: "output: 概念"
Sequential-Workflow.Writer -> Sequential-Workflow.Format-Proofread: "output: 草稿"
Sequential-Workflow.Format-Proofread -> Output: "output: 內容"
```

## 快速入門

您可以使用 `npx` 直接執行此範例，無需任何本機安裝。

### 先決條件

- [Node.js](https://nodejs.org) (版本 20.0 或更高)
- 來自受支援模型提供者的 API 金鑰（例如 [OpenAI](https://platform.openai.com/api-keys)）

### 執行工作流程

此範例可以在預設的一次性模式、互動式聊天模式下執行，或透過直接傳送輸入來執行。

1.  **一次性模式**：使用預先定義的輸入執行工作流程一次。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential
    ```

2.  **互動式聊天模式**：啟動一個會話，您可以在其中持續提供輸入。

    ```sh icon=lucide:terminal
    npx -y @aigne/example-workflow-sequential --chat
    ```

3.  **管線輸入**：處理從另一個指令傳送過來的輸入。

    ```sh icon=lucide:terminal
    echo "Create marketing content for our new AI-powered fitness app" | npx -y @aigne/example-workflow-sequential
    ```

### 連線至 AI 模型

要執行工作流程，您必須連線至一個 AI 模型。首次執行時，系統會提示您選擇一種連線方法。

- **AIGNE Hub (建議)**：最簡單的入門方式。新使用者會收到免費的 token。
- **自行託管的 AIGNE Hub**：連線至您自己的 AIGNE Hub 執行個體。
- **第三方提供者**：使用來自 OpenAI 等提供者的 API 金鑰設定您的環境。

若要直接使用 OpenAI，請設定以下環境變數：

```sh icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## 運作方式

此循序工作流程是使用一個設定為 `ProcessMode.sequential` 的 `TeamAgent` 所建構的。這確保了在 `skills` 陣列中列出的 Agent 會按照它們被定義的順序執行。

### 程式碼實作

核心邏輯涉及定義三個不同的 `AIAgent` 執行個體，並在一個循序的 `TeamAgent` 中進行協調。

```typescript sequential-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 初始化模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. 定義序列中的第一個 Agent：概念提取器
const conceptExtractor = AIAgent.from({
  instructions: `\
您是一位行銷分析師。根據產品描述，識別：
- 關鍵功能
- 目標受眾
- 獨特賣點

產品描述：
{{product}}`,
  outputKey: "concept",
});

// 3. 定義第二個 Agent：寫手
const writer = AIAgent.from({
  instructions: `\
您是一位行銷文案撰寫員。根據描述功能、受眾和獨特賣點的文字區塊，
撰寫一篇引人注目的行銷文案（約 150 字）。

產品描述：
{{product}}

以下是關於該產品的資訊：
{{concept}}`, // 使用前一個 Agent 的輸出
  outputKey: "draft",
});

// 4. 定義最後一個 Agent：格式化與校對
const formatProof = AIAgent.from({
  instructions: `\
您是一位編輯。根據草稿文案，修正文法、提高清晰度並確保語氣一致。
輸出最終潤飾過的文案。

產品描述：
{{product}}

以下是關於該產品的資訊：
{{concept}}

草稿文案：
{{draft}}`, // 使用先前 Agent 的輸出
  outputKey: "content",
});

// 5. 設定 AIGNE 執行個體和 TeamAgent
const aigne = new AIGNE({ model });

const teamAgent = TeamAgent.from({
  skills: [conceptExtractor, writer, formatProof],
  mode: ProcessMode.sequential, // 將執行模式設定為循序
});

// 6. 叫用工作流程
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);
```

### 執行分析

1.  **模型初始化**：使用必要的 API 金鑰設定一個 `OpenAIChatModel`。
2.  **Agent 定義**：
    *   `conceptExtractor`：接收初始的 `product` 描述並產生一個 `concept` 輸出。
    *   `writer`：使用原始的 `product` 描述和上一步的 `concept` 來建立一份 `draft`。
    *   `formatProof`：接收所有先前的輸出（`product`、`concept`、`draft`）來產生最終的 `content`。
3.  **團隊設定**：建立一個 `TeamAgent`，其中包含按所需執行順序排列的三個 Agent。指定 `ProcessMode.sequential` 以強制執行此順序。
4.  **叫用**：`aigne.invoke` 方法使用一個初始輸入物件來啟動工作流程。框架會自動管理狀態，將累積的輸出傳遞給每個後續的 Agent。
5.  **輸出**：最終結果是一個物件，其中包含序列中所有 Agent 的輸出。

```json 輸出範例
{
  "concept": "**Product Description: AIGNE - No-code Generative AI Apps Engine**\n\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to empower users to seamlessly create ...",
  "draft": "Unlock the power of creation with AIGNE, the revolutionary No-code Generative AI Apps Engine! Whether you're a small business looking to streamline operations, an entrepreneur ...",
  "content": "Unlock the power of creation with AIGNE, the revolutionary No-Code Generative AI Apps Engine! Whether you are a small business aiming to streamline operations, an entrepreneur ..."
}
```

## 命令列選項

您可以使用以下參數自訂執行：

| 參數 | 說明 | 預設值 |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat` | 以互動式聊天模式執行。 | 已停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度。 | 提供者預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 提供者預設值 |
| `--presence-penalty <value>`| 設定存在懲罰值。 | 提供者預設值 |
| `--frequency-penalty <value>`| 設定頻率懲罰值。 | 提供者預設值 |
| `--log-level <level>` | 設定記錄層級（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input, -i <input>` | 直接透過命令列指定輸入。 | 無 |

### 使用範例

```sh icon=lucide:terminal
# 以聊天模式使用特定模型執行
npx @aigne/example-workflow-sequential --chat --model openai:gpt-4o-mini

# 將記錄層級設定為 debug 以取得詳細輸出
npx @aigne/example-workflow-sequential --log-level DEBUG
```

## 總結

此範例展示了如何使用 AIGNE 框架設定和執行循序工作流程。透過定義一系列 Agent 並將它們安排在一個具有 `ProcessMode.sequential` 的 `TeamAgent` 中，您可以為複雜的多步驟任務建構穩健、有序的管線。

若要進一步了解 Agent 協作，請探索以下主題：

<x-cards data-columns="2">
  <x-card data-title="Team Agent" data-href="/developer-guide/agents/team-agent" data-icon="lucide:users">
    深入了解如何在循序、平行或自我修正模式下協調多個 Agent。
  </x-card>
  <x-card data-title="工作流程：並行" data-href="/examples/workflow-concurrency" data-icon="lucide:git-fork">
    探索如何平行執行 Agent，以最佳化可同步執行的任務效能。
  </x-card>
</x-cards>