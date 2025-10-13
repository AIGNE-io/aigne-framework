# 反思工作流程

`反思` 工作流程模式能夠實現 Agent 輸出的自我改進和迭代優化。在此模式中，會先生成一個初始輸出，然後將其傳遞給一個獨立的 `reviewer` Agent 進行評估。如果輸出未達到所需標準，它會連同回饋意見一起被送回，以進行另一次迭代。這個循環會持續進行，直到輸出被核准或達到最大迭代次數為止。

此模式對於需要高品質、經驗證輸出的情境特別有效，例如：
- **程式碼生成與審查**：由一個 `coder` Agent 編寫程式碼，再由一個 `reviewer` Agent 檢查其正確性、效率和安全性。
- **內容品質控制**：由一個 `writer` Agent 生成內容，再由一個 `editor` Agent 檢查其風格、文法和準確性。
- **自我修正系統**：Agent 可以從回饋中學習，並在特定任務上迭代地提升其表現。

## 運作方式

反思過程遵循一個循環：一個或多個 Agent 生成解決方案，然後由一個 `reviewer` Agent 提供回饋。初始的 Agent 接著會利用這些回饋來優化下一次的嘗試。

# 反思工作流程

`反思` 工作流程模式能夠實現 Agent 輸出的自我改進和迭代優化。在此模式中，會先生成一個初始輸出，然後將其傳遞給一個獨立的 `reviewer` Agent 進行評估。如果輸出未達到所需標準，它會連同回饋意見一起被送回，以進行另一次迭代。這個循環會持續進行，直到輸出被核准或達到最大迭代次數為止。

此模式對於需要高品質、經驗證輸出的情境特別有效，例如：
- **程式碼生成與審查**：由一個 `coder` Agent 編寫程式碼，再由一個 `reviewer` Agent 檢查其正確性、效率和安全性。
- **內容品質控制**：由一個 `writer` Agent 生成內容，再由一個 `editor` Agent 檢查其風格、文法和準確性。
- **自我修正系統**：Agent 可以從回饋中學習，並在特定任務上迭代地提升其表現。

## 運作方式

反思過程遵循一個循環：一個或多個 Agent 生成解決方案，然後由一個 `reviewer` Agent 提供回饋。初始的 Agent 接著會利用這些回饋來優化下一次的嘗試。

```d2
direction: down

start: { 
  label: "開始"
  shape: oval 
}

generator: {
  label: "生成器 Agent\n生成初始輸出"
  shape: rectangle
}

reviewer: {
  label: "審查者 Agent\n評估輸出"
  shape: rectangle
}

decision: {
  label: "輸出是否\n符合標準？"
  shape: diamond
}

end: {
  label: "結束\n(已核准的輸出)"
  shape: oval
}

start -> generator
generator -> reviewer: "提交審查"
reviewer -> decision
decision -> end: "是"
decision -> generator: "否 (提供回饋)"
```

## 設定

若要啟用反思模式，您需要在 `TeamAgentOptions` 中設定 `reflection` 屬性。此屬性接受一個 `ReflectionMode` 物件，用以定義審查和核准流程。

**ReflectionMode 參數**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="負責審查輸出並提供回饋的 Agent。"></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean | unknown>) | string" data-required="true" data-desc="一個函式或審查者輸出中的欄位名稱，用以決定結果是否被核准。若為函式，它會接收審查者的輸出，並應回傳一個真值 (truthy value) 表示核准。若為字串，則會檢查輸出中對應欄位的真值性 (truthiness)。"></x-field>
  <x-field data-name="maxIterations" data-type="number" data-required="false" data-default="3" data-desc="在流程終止前，審查-回饋循環的最大次數。這可以防止無限循環。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-required="false" data-default="false" data-desc="若設為 `true`，當達到 `maxIterations` 時，工作流程會回傳最後一次生成的輸出，即使它未被核准。若為 `false`，則會拋出錯誤。"></x-field>
</x-field-group>

## 範例：程式碼生成與審查

此範例示範了一個反思工作流程，其中 `coder` Agent 編寫一個 Python 函式，而 `reviewer` Agent 則對其進行評估。此過程會持續進行，直到 `reviewer` 核准該程式碼為止。

### 1. 定義 Coder Agent

`coder` Agent 負責根據使用者的請求編寫初始程式碼。它的設計旨在接收來自審查者的回饋，以便在後續的迭代中改進其解決方案。

```typescript
import { TeamAgent, AIAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  name: "Coder",
  instructions: `
You are a proficient coder. You write Python code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.

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
  inputKey: "question",
});
```

### 2. 定義 Reviewer Agent

`reviewer` Agent 評估由 `coder` 生成的程式碼。它會檢查程式碼的正確性、效率和安全性，並提供結構化的回饋。其輸出包含一個布林值 `approval` 欄位，用於控制反思循環。

```typescript
const reviewer = AIAgent.from({
  name: "Reviewer",
  instructions: `
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("Set to true to APPROVE or false to REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
});
```

### 3. 建立並叫用 TeamAgent

設定一個 `TeamAgent` 來協調此工作流程。將 `coder` 設定為主要 Agent (技能)，並在 `reflection` 屬性中設定 `reviewer`。`isApproved` 條件指向 `reviewer` 輸出中的 `approval` 欄位。

```typescript
const reflectionTeam = TeamAgent.from({
  skills: [coder],
  reflection: {
    reviewer,
    isApproved: "approval",
    maxIterations: 3,
  },
});

async function run() {
  const result = await reflectionTeam.invoke(
    {
      question: "Write a function to find the sum of all even numbers in a list.",
    },
    { model }
  );
  
  console.log(JSON.stringify(result, null, 2));
}

run();
```

### 範例輸出

經過一次或多次迭代後，`reviewer` Agent 會核准程式碼，並回傳 `coder` Agent 的最終輸出。

```json
{
  "code": "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)"
}
```