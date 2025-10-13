# 提示詞

提示詞建構與範本化系統是建立與 AI 模型動態且強大互動的核心元件。它包含兩個主要部分：

1.  **提示詞範本**：一個使用 Nunjucks 的彈性系統，用於建立動態、可重複使用的提示詞元件。
2.  **提示詞建構器**：一個高階協調器，可將範本、上下文、記憶、工具和輸出結構描述組裝成一個完整的 `ChatModelInput`，以便傳送給模型。

### `PromptBuilder` 工作流程

`PromptBuilder` 是核心類別，負責協調所有不同的部分——範本、使用者輸入、上下文、記憶和工具——以建構一個最終、可供模型使用的 `ChatModelInput` 物件。下圖說明了這個過程：

```d2
direction: down

Inputs: {
  label: "建構器輸入"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 2

  使用者輸入
  上下文
  記憶
  工具
  輸出結構描述: "輸出結構描述"

  Templates: {
    label: "提示詞範本"
    shape: rectangle

    Nunjucks-Engine: {
      label: "Nunjucks 引擎"
      style.fill: "#f5f5f5"
    }

    PromptTemplate: {
      label: "PromptTemplate\n（用於字串格式化）"
    }

    ChatMessagesTemplate: {
      label: "ChatMessagesTemplate\n（用於對話）"
      grid-columns: 2
      系統訊息範本
      使用者訊息範本
      Agent 訊息範本
      工具訊息範本
    }
  }
}

PromptBuilder: {
  label: "PromptBuilder"
  shape: rectangle
  style.fill: "#e6f7ff"
}

ChatModelInput: {
  label: "ChatModelInput"
  shape: rectangle
  style.fill: "#d9f7be"
}

AI-Model: {
  label: "AI 模型"
  shape: cylinder
}

Inputs.Templates.PromptTemplate -> Inputs.Templates.Nunjucks: "使用"
Inputs.Templates.ChatMessagesTemplate -> Inputs.Templates.Nunjucks: "使用"

Inputs -> PromptBuilder: "由 .build() 組裝"
PromptBuilder -> ChatModelInput: "產生"
ChatModelInput -> AI-Model: "傳送至"

```

## 提示詞範本

提示詞範本讓您可以定義提示詞和對話的結構，透過使用變數和包含其他檔案，來建立模組化且可維護的提示詞指令。

### `PromptTemplate`

`PromptTemplate` 類別是一個圍繞 Nunjucks 範本字串的簡單封裝。它讓您可以使用變數來格式化字串。

**主要功能：**

*   **變數替換**：將動態資料注入您的提示詞中。
*   **檔案包含**：使用 `{% raw %}{% include "path/to/file.md" %}{% endraw %}` 語法包含其他範本檔案，以建構複雜的提示詞。

**範例：**

假設您有兩個範本檔案：

**`./main-prompt.md`**
```markdown
You are a professional chatbot.

{% raw %}{% include "./personality.md" %}{% endraw %}
```

**`./personality.md`**
```markdown
Your name is {% raw %}{{ name }}{% endraw %}.
```

您可以使用 `PromptTemplate` 來渲染此結構，只需提供一個 `workingDir` 來解析相對的包含路徑。

```typescript
import { PromptTemplate } from "packages/core/src/prompt/template.ts";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

// 主範本檔案的路徑
const templatePath = '/path/to/your/prompts/main-prompt.md';
const workingDir = nodejs.path.dirname(templatePath);

// 假設您讀取了 main-prompt.md 的內容
const templateContent = 'You are a professional chatbot.\n\n{% include "./personality.md" %}';

const template = PromptTemplate.from(templateContent);

const formattedPrompt = await template.format(
  { name: "Alice" },
  { workingDir: workingDir } // 為 include 提供 workingDir
);

console.log(formattedPrompt);
// 輸出：
// You are a professional chatbot.
//
// Your name is Alice.
```

### 聊天訊息範本

對於以聊天為基礎的模型，該程式庫提供了一組類別來代表對話中的不同角色，讓建構多輪對話變得容易。

*   `SystemMessageTemplate`：代表系統層級的指令。
*   `UserMessageTemplate`：代表來自使用者的訊息。
*   `AgentMessageTemplate`：代表來自 AI Agent 的訊息。
*   `ToolMessageTemplate`：代表工具呼叫的輸出。
*   `ChatMessagesTemplate`：一個用於存放訊息範本陣列的容器。

**範例：**

```typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate
} from "packages/core/src/prompt/template.ts";

const conversationTemplate = ChatMessagesTemplate.from([
  SystemMessageTemplate.from("You are a helpful assistant who speaks like a pirate."),
  UserMessageTemplate.from("My name is {% raw %}{{ name }}{% endraw %}. What is my name?"),
]);

const messages = await conversationTemplate.format({ name: "Captain Hook" });

console.log(messages);
// 輸出：
// [
//   { role: 'system', content: 'You are a helpful assistant who speaks like a pirate.' },
//   { role: 'user', content: 'My name is Captain Hook. What is my name?' }
// ]
```

## `PromptBuilder`

`PromptBuilder` 是一個高階類別，可將所有元件——範本、使用者輸入、上下文、記憶、工具和結構描述——組裝成一個最終、可供模型使用的 `ChatModelInput` 物件。

### 運作方式

此建構器遵循一個封裝在 `build` 方法中的清晰流程：
1.  **解析指令**：它從基礎指令開始，該指令可以是字串或 `ChatMessagesTemplate`。
2.  **整合記憶**：如果 Agent 設定為使用記憶，建構器會擷取它們並將其格式化為聊天訊息。
3.  **新增使用者輸入**：它會附加當前的使用者訊息和任何附加檔案。
4.  **設定工具**：它會從 Agent 和當前的上下文中收集所有可用的工具（技能），為模型將它們格式化，並決定 `toolChoice` 策略。
5.  **設定回應格式**：如果提供了 `outputSchema`，它會設定模型的 `responseFormat` 以確保結構化輸出（例如 JSON）。

### 範例

以下是一個全面的範例，說明 `PromptBuilder` 如何組裝一個完整的請求。

```typescript
import { PromptBuilder } from "packages/core/src/prompt/prompt-builder.ts";
import { AIAgent } from "packages/core/src/agents/ai-agent.ts";
import { z } from "zod";

// 1. 定義一個帶有指令和輸出結構描述的 Agent
const myAgent = new AIAgent({
  name: "UserExtractor",
  description: "Extracts user details from text.",
  instructions: "Extract the user's name and age from the following text.",
  outputSchema: z.object({
    name: z.string().describe("The user's full name"),
    age: z.number().describe("The user's age in years"),
  }),
});

// 2. 建立一個 PromptBuilder 實例
const builder = new PromptBuilder();

// 3. 定義使用者輸入的訊息
const userInput = {
  message: "My name is John Doe and I am 30 years old.",
};

// 4. 建構最終的 ChatModelInput
const chatModelInput = await builder.build({
  agent: myAgent,
  input: userInput,
});

console.log(JSON.stringify(chatModelInput, null, 2));
// 輸出：
// {
//   "messages": [
//     {
//       "role": "system",
//       "content": "Extract the user's name and age from the following text."
//     },
//     {
//       "role": "user",
//       "content": [
//         {
//           "type": "text",
//           "text": "My name is John Doe and I am 30 years old."
//         }
//       ]
//     }
//   ],
//   "responseFormat": {
//     "type": "json_schema",
//     "jsonSchema": {
//       "name": "output",
//       "schema": {
//         "type": "object",
//         "properties": {
//           "name": {
//             "type": "string",
//             "description": "The user's full name"
//           },
//           "age": {
//             "type": "number",
//             "description": "The user's age in years"
//           }
//         },
//         "required": ["name", "age"]
//       },
//       "strict": true
//     }
//   }
// }
```