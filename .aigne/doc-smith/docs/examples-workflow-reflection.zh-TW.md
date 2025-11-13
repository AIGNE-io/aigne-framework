# 工作流反思

您是否想過如何建立一個能夠自我修正錯誤的 AI 工作流？本指南將示範如何建構一個自我改進的系統，其中一個 AI Agent 負責產生內容，另一個則負責審查和完善，從而形成一個持續改進的回饋迴圈。您將學會如何設定一個由「Coder」和「Reviewer」組成的 Agent 團隊，共同協作以產出精良的最終成品。

## 概覽

工作流反思模式涉及一個為迭代優化而設計的多 Agent 系統。在此範例中，我們建立了一個包含兩個不同 Agent 的工作流：

*   **Coder Agent**：根據使用者請求，負責產生初始解決方案（例如，撰寫一段程式碼）。
*   **Reviewer Agent**：根據特定標準（例如，正確性、效率、安全性）評估 Coder 的輸出。

此工作流遵循一個結構化的迴圈：

1.  使用者提供一個初始想法或問題。
2.  `Coder` Agent 接收該想法並產生一個解決方案。
3.  `Reviewer` Agent 檢查該解決方案。
4.  如果解決方案被批准，則會傳送到最終輸出。
5.  如果解決方案被拒絕，`Reviewer` 會提供回饋，並將請求送回給 `Coder` 進行修訂。

這個循環過程會持續進行，直到 `Reviewer` 批准輸出為止，以確保高品質的結果。

```d2
direction: down

User: {
  shape: c4-person
}

Coder-Agent: {
  label: "Coder Agent"
  shape: rectangle
}

Reviewer-Agent: {
  label: "Reviewer Agent"
  shape: rectangle
}

Decision: {
  label: "已批准？"
  shape: diamond
}

Final-Output: {
  label: "最終輸出"
  shape: rectangle
}

User -> Coder-Agent: "1. 提供想法"
Coder-Agent -> Reviewer-Agent: "2. 產生解決方案"
Reviewer-Agent -> Decision: "3. 檢查解決方案"
Decision -> Final-Output: "4. 是"
Decision -> Coder-Agent: "5. 否，提供回饋"
```

## 快速入門

您無需任何本地安裝，即可使用 `npx` 直接執行此範例。

### 執行範例

在您的終端機中執行以下指令。

*   **單次執行模式**：Agent 處理單一輸入後終止。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection
    ```

*   **互動式聊天模式**：與 Agent 團隊開始一個持續的聊天會話。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-workflow-reflection --chat
    ```

*   **管道模式**：直接從另一個指令傳送輸入。

    ```bash icon=lucide:terminal
    echo "Write a function to validate email addresses" | npx -y @aigne/example-workflow-reflection
    ```

### 連接至 AI 模型

AIGNE 框架需要連接至大型語言模型（LLM）才能運作。您可以透過 AIGNE Hub 獲得託管體驗，或直接設定第三方提供者。

例如，若要使用 OpenAI，請設定 `OPENAI_API_KEY` 環境變數：

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

設定 API 金鑰後，再次執行範例。有關設定不同模型提供者的詳細指南，請參閱[模型設定](./models-configuration.md)文件。

## 從原始碼執行

對於希望檢查或修改程式碼的開發者，請依照以下步驟從原始碼儲存庫執行範例。

### 1. 複製儲存庫

首先，將 AIGNE 框架儲存庫複製到您的本地機器。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例目錄並使用 `pnpm` 安裝所需依賴項。

```bash icon=lucide:terminal
cd aigne-framework/examples/workflow-reflection
pnpm install
```

### 3. 執行範例

執行啟動腳本以執行工作流。

*   **單次執行模式（預設）**

    ```bash icon=lucide:terminal
    pnpm start
    ```

*   **互動式聊天模式**

    ```bash icon=lucide:terminal
    pnpm start -- --chat
    ```

## 程式碼實作

此範例的核心是一個 TypeScript 檔案，它定義並協調 `Coder` 和 `Reviewer` Agent。讓我們來看看關鍵組件。

```typescript reflection-workflow.ts icon=logos:typescript
import { AIAgent, AIGNE, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 定義 Coder Agent
const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.
For example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

Respond using the following format:

Thoughts: <Your comments>
Code: <Your code>

Previous review result:
{{feedback}}

User's question:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
});

// 3. 定義 Reviewer Agent
const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) =>
    output.approval ? UserOutputTopic : "rewrite_request",
  instructions: `\
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Previous feedback:
{{feedback}}

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("APPROVE or REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

// 4. 初始化並執行 AIGNE 實例
const aigne = new AIGNE({ model, agents: [coder, reviewer] });
aigne.publish(
  UserInputTopic,
  "Write a function to find the sum of all even numbers in a list.",
);

const { message } = await aigne.subscribe(UserOutputTopic);
console.log(message);
```

### 說明

1.  **初始化模型**：建立一個 `OpenAIChatModel` 實例，作為兩個 Agent 的底層 LLM。
2.  **定義 Coder Agent**：
    *   `subscribeTopic`：監聽初始使用者輸入 (`UserInputTopic`) 和來自 Reviewer 的修訂請求 (`rewrite_request`)。
    *   `publishTopic`：將其產生的程式碼傳送到 `review_request` 主題，供 Reviewer 接收。
    *   `instructions`：一個詳細的提示，定義其角色、輸出格式以及如何處理回饋。
    *   `outputSchema`：使用 Zod 結構描述來強制輸出必須包含一個 `code` 字串。
3.  **定義 Reviewer Agent**：
    *   `subscribeTopic`：監聽 `review_request` 主題上的程式碼提交。
    *   `publishTopic`：一個動態路由輸出的函式。如果 `approval` 為 `true`，結果會被傳送到最終的 `UserOutputTopic`。否則，它會被送回 `rewrite_request` 主題，供 Coder 修訂。
    *   `instructions`：一個指導 Reviewer 如何評估程式碼的提示。
    *   `outputSchema`：一個 Zod 結構描述，要求一個布林值 `approval` 欄位和一個結構化的 `feedback` 物件。
4.  **執行工作流**：
    *   使用模型和兩個 Agent 建立一個 `AIGNE` 實例。
    *   `aigne.publish()` 將初始問題陳述傳送到 `UserInputTopic`，啟動工作流。
    *   `aigne.subscribe()` 等待 `UserOutputTopic` 上的訊息，這只會在 Reviewer 批准程式碼後發生。

### 範例輸出

當腳本執行時，最終批准的輸出將會記錄到主控台：

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)",
  "approval": true,
  "feedback": {
    "correctness": "The function correctly calculates the sum of all even numbers in the given list. It properly checks for evenness using the modulus operator and sums the valid numbers.",
    "efficiency": "The implementation is efficient as it uses a generator expression which computes the sum in a single pass over the list. This minimizes memory usage as compared to creating an intermediate list of even numbers.",
    "safety": "The function does not contain any safety issues. However, it assumes that all elements in the input list are integers. It would be prudent to handle cases where the input contains non-integer values (e.g., None, strings, etc.).",
    "suggested_changes": "Consider adding type annotations to the function for better clarity and potential type checking, e.g. `def sum_of_even_numbers(numbers: list[int]) -> int:`. Also, include input validation to ensure 'numbers' is a list of integers."
  }
}
```

## 命令列選項

您可以使用以下命令列旗標自訂執行：

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--chat` | 以互動式聊天模式執行。 | 停用 |
| `--model <provider[:model]>` | 要使用的 AI 模型，例如 'openai' 或 'openai:gpt-4o-mini'。 | `openai` |
| `--temperature <value>` | 模型生成的溫度。 | 提供者預設值 |
| `--top-p <value>` | 模型生成的 Top-p 取樣值。 | 提供者預設值 |
| `--presence-penalty <value>` | 模型生成的 Presence penalty 值。 | 提供者預設值 |
| `--frequency-penalty <value>` | 模型生成的 Frequency penalty 值。 | 提供者預設值 |
| `--log-level <level>` | 設定記錄層級（ERROR、WARN、INFO、DEBUG、TRACE）。 | `INFO` |
| `--input`, `-i <input>` | 直接透過命令列指定輸入。 | 無 |

#### 使用範例

```bash 設定日誌層級為 DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## 總結

此範例說明了工作流反思在建構穩健、自我修正的 AI 系統中的強大作用。透過將生成和評估的角色分離到不同的 Agent 中，您可以建立一個回饋迴圈，顯著提高最終輸出的品質和可靠性。

要探索其他進階工作流模式，請參閱以下範例：

<x-cards data-columns="2">
  <x-card data-title="工作流協調" data-href="/examples/workflow-orchestration" data-icon="lucide:workflow">
  協調多個 Agent 在複雜的處理管道中協同工作。
  </x-card>
  <x-card data-title="工作流路由器" data-href="/examples/workflow-router" data-icon="lucide:git-fork">
  實作智慧路由邏輯，將請求導向至適當的處理器。
  </x-card>
</x-cards>