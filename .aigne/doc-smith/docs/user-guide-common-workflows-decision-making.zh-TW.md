本文件提供 `AIAgent` 類別的詳細指南，這是 AIGNE 框架中用於建立 AI 驅動 Agent 的核心元件。`AIAgent` 利用大型語言模型 (LLM) 來處理輸入、執行複雜任務並產生智慧回應。

## 總覽

`AIAgent` 是一種多功能 Agent，可連接至指定的語言模型以解讀使用者輸入並執行操作。它作為建構複雜 AI 應用程式的基礎，內建支援可自訂的指令、工具使用 (函式呼叫) 和回應串流。

主要功能包括：
- **語言模型整合**：無縫連接至任何支援的聊天模型 (例如 OpenAI、Gemini、Claude)。
- **可自訂的行為**：使用強大的提示指令來定義 Agent 的個性、目標和限制。
- **工具使用與函式呼叫**：透過提供工具 (技能) 來擴展 Agent 的能力，使其能夠呼叫這些工具來執行特定操作，例如與 API 或資料庫互動。
- **彈性的工作流程模式**：支援多種執行模式，包括自動工具選擇、必要工具使用，以及一個專門的「路由」模式，用於將任務導向其他 Agent。
- **支援串流**：能夠在模型產生回應時進行串流傳輸，從而實現即時應用。
- **結構化資料擷取**：可設定為從模型的串流輸出中解析和擷取結構化資料 (例如 JSON、YAML)。

## 核心概念

理解這些核心概念是有效使用 `AIAgent` 的關鍵。

### 指令

`instructions` 屬性是引導 Agent 行為的主要方式。它可以是一個簡單的字串，或是在更複雜情境下使用 `PromptBuilder` 實例。這些指令通常用於建構傳送給語言模型的系統提示，為整個對話設定情境。

**範例：**
```typescript
const agent = AIAgent.from({
  name: "HaikuBot",
  instructions: "You are a poetic assistant who only responds in haikus.",
});
```

### 輸入與輸出鍵

`AIAgent` 使用鍵來對應輸入訊息、模型和輸出訊息之間的資料。
- `inputKey`：指定輸入訊息中的哪個屬性應被視為主要使用者文字。
- `outputKey`：定義輸出訊息中的屬性，模型的最終文字回應將放置於此。預設為 `message`。

**範例：**
```typescript
const agent = AIAgent.from({
  inputKey: "question", // 預期輸入格式為 { question: "..." }
  outputKey: "answer",  // 產生輸出格式為 { answer: "..." }
  instructions: "Answer the user's question.",
});
```

### 工具選擇

`toolChoice` 選項控制 Agent 如何利用其技能 (工具)。這是建構以行動為導向的 Agent 的強大功能。

- `AIAgentToolChoice.auto` (預設)：模型根據使用者輸入決定是否呼叫工具。
- `AIAgentToolChoice.none`：模型不會呼叫任何工具。
- `AIAgentToolChoice.required`：模型被強制呼叫其中一個可用的工具。
- `AIAgentToolChoice.router`：一種特殊模式，其中 Agent 的唯一目的是選擇單一最佳工具 (或其他 Agent) 來處理請求，然後將輸入直接路由給它。

## 建立 AIAgent

建立 `AIAgent` 最直接的方法是使用靜態的 `AIAgent.from()` 方法。

### 基本範例

以下是一個最簡單的 `AIAgent` 範例，它使用 OpenAI 模型來回應訊息。

```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 1. 初始化模型
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. 建立 AIAgent 實例
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful and friendly assistant.",
});

// 3. 初始化 AIGNE 執行環境
const aigne = new AIGNE({ model });

// 4. 叫用 Agent
const userAgent = aigne.invoke(assistantAgent);
const result = await userAgent.invoke({ message: "Hello, who are you?" });

console.log(result);
// 輸出：{ message: "I am a helpful and friendly assistant. How can I assist you today?" }
```

### 帶有工具的 Agent

為了讓 Agent 更強大，您可以為其提供 `skills` (工具)。在此範例中，我們建立一個 `Calculator` Agent，並將其作為技能提供給一個主要的 `Assistant` Agent。

```typescript
import { AIAgent, AIGNE, Skill } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
});

// 1. 定義一個用於計算的技能 (工具)
const calculatorSkill = Skill.from({
  name: "calculator",
  description: "A simple calculator for basic arithmetic operations.",
  input: z.object({
    expression: z.string().describe("The mathematical expression to evaluate, e.g., '2+2'"),
  }),
  func: async ({ expression }) => {
    // 在實際場景中，請使用安全的評估函式庫
    return { result: eval(expression) };
  },
});

// 2. 建立一個帶有該技能的 Agent
const assistantAgent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant. Use the calculator tool for any math questions.",
  skills: [calculatorSkill],
  toolChoice: "auto", // 模型將決定何時使用計算機
});

const aigne = new AIGNE({ model });
const userAgent = aigne.invoke(assistantAgent);

// Agent 將自動使用計算機工具
const result = await userAgent.invoke({ message: "What is 127 + 345?" });

console.log(result);
// 輸出：{ message: "127 + 345 is 472." }
```

## AIAgent 工作流程

下圖說明了 `AIAgent` 在處理請求時遵循的內部流程，包括它如何與語言模型互動及執行工具。

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AIAgent 內部工作流程"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  Input-Message: {
    label: "輸入訊息\n{ [inputKey]: '...' }"
    shape: rectangle
  }

  Prompt-Builder: {
    label: "建立提示\n(輸入 + 指令 + 技能)"
    shape: rectangle
  }

  Tool-Executor: {
    label: "執行工具"
    shape: rectangle
  }

  Skill-Library: {
    label: "技能庫"
    shape: cylinder
  }

  Response-Formatter: {
    label: "格式化最終回應\n(對應至 outputKey)"
    shape: rectangle
  }

  Output-Message: {
    label: "輸出訊息\n{ [outputKey]: '...' }"
    shape: rectangle
  }
}

LLM: {
  label: "LLM (聊天模型)"
  shape: rectangle
}

Tool-Decision: {
  label: "需要呼叫工具嗎？"
  shape: diamond
}

User -> AIAgent.Input-Message: "1. 叫用 Agent"
AIAgent.Input-Message -> AIAgent.Prompt-Builder
AIAgent.Prompt-Builder -> LLM: "2. 傳送請求"
LLM -> Tool-Decision: "3. 模型回應"
Tool-Decision -> AIAgent.Tool-Executor: "是"
AIAgent.Tool-Executor -> AIAgent.Skill-Library: "4. 尋找並執行技能"
AIAgent.Skill-Library -> AIAgent.Tool-Executor: "回傳結果"
AIAgent.Tool-Executor -> LLM: "5. 傳送工具結果"
LLM -> AIAgent.Response-Formatter: "6. 產生最終回應"
Tool-Decision -> AIAgent.Response-Formatter: "否"
AIAgent.Response-Formatter -> AIAgent.Output-Message: "7. 格式化輸出"
AIAgent.Output-Message -> User: "8. 回傳結果"

```