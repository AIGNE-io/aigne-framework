# 提示词

提示词构建和模板系统是与 AI 模型创建动态、强大交互的核心组件。它由两个主要部分组成：

1.  **提示词模板**：一个使用 Nunjucks 的灵活系统，用于创建动态、可复用的提示词组件。
2.  **提示词构建器**：一个高级编排器，它将模板、上下文、记忆、工具和输出模式组装成一个完整的 `ChatModelInput`，准备发送给模型。

### `PromptBuilder` 工作流

`PromptBuilder` 是一个核心类，它负责编排所有不同的部分——模板、用户输入、上下文、记忆和工具——以构建一个最终的、可供模型使用的 `ChatModelInput` 对象。下图说明了此过程：

```d2
direction: down

Inputs: {
  label: "构建器输入"
  shape: rectangle
  style.stroke-dash: 2
  grid-columns: 2

  User-Input: "用户输入"
  Context: "上下文"
  Memories: "记忆"
  Tools: "工具"
  Output-Schemas: "输出模式"

  Templates: {
    label: "提示词模板"
    shape: rectangle

    Nunjucks-Engine: {
      label: "Nunjucks 引擎"
      style.fill: "#f5f5f5"
    }

    PromptTemplate: {
      label: "PromptTemplate\n(用于字符串格式化)"
    }

    ChatMessagesTemplate: {
      label: "ChatMessagesTemplate\n(用于对话)"
      grid-columns: 2
      SystemMessageTemplate
      UserMessageTemplate
      AgentMessageTemplate
      ToolMessageTemplate
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

Inputs -> PromptBuilder: "由 .build() 组装"
PromptBuilder -> ChatModelInput: "生成"
ChatModelInput -> AI-Model: "发送至"

```

## 提示词模板

提示词模板允许您定义提示词和对话的结构，使用变量并包含其他文件来创建模块化、可维护的提示词指令。

### `PromptTemplate`

`PromptTemplate` 类是 Nunjucks 模板字符串的一个简单封装。它允许您使用变量格式化字符串。

**主要特性：**

*   **变量替换**：将动态数据注入到您的提示词中。
*   **文件包含**：通过使用 `{% raw %}{% include "path/to/file.md" %}{% endraw %}` 语法包含其他模板文件来构建复杂的提示词。

**示例：**

假设您有两个模板文件：

**`./main-prompt.md`**
```markdown
You are a professional chatbot.

{% raw %}{% include "./personality.md" %}{% endraw %}
```

**`./personality.md`**
```markdown
Your name is {% raw %}{{ name }}{% endraw %}.
```

您可以通过提供一个 `workingDir` 来解析相对的 include 路径，从而使用 `PromptTemplate` 来渲染此结构。

```typescript
import { PromptTemplate } from "packages/core/src/prompt/template.ts";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

// 主模板文件的路径
const templatePath = '/path/to/your/prompts/main-prompt.md';
const workingDir = nodejs.path.dirname(templatePath);

// 假设你读取了 main-prompt.md 的内容
const templateContent = 'You are a professional chatbot.\n\n{% include "./personality.md" %}';

const template = PromptTemplate.from(templateContent);

const formattedPrompt = await template.format(
  { name: "Alice" },
  { workingDir: workingDir } // 提供 workingDir 以处理 include
);

console.log(formattedPrompt);
// 输出:
// You are a professional chatbot.
//
// Your name is Alice.
```

### 聊天消息模板

对于基于聊天的模型，该库提供了一组类来表示对话中的不同角色，从而可以轻松构建多轮对话。

*   `SystemMessageTemplate`：表示系统级指令。
*   `UserMessageTemplate`：表示来自用户的消息。
*   `AgentMessageTemplate`：表示来自 AI Agent 的消息。
*   `ToolMessageTemplate`：表示工具调用的输出。
*   `ChatMessagesTemplate`：一个包含一系列消息模板的容器。

**示例：**

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
// 输出:
// [
//   { role: 'system', content: 'You are a helpful assistant who speaks like a pirate.' },
//   { role: 'user', content: 'My name is Captain Hook. What is my name?' }
// ]
```

## `PromptBuilder`

`PromptBuilder` 是一个高级类，它将所有组件——模板、用户输入、上下文、记忆、工具和模式——组装成一个最终的、可供模型使用的 `ChatModelInput` 对象。

### 工作原理

构建器遵循一个封装在 `build` 方法中的清晰流程：
1.  **解析指令**：它从基本指令开始，这些指令可以是一个字符串或一个 `ChatMessagesTemplate`。
2.  **整合记忆**：如果 Agent 配置为使用记忆，构建器会检索它们并将其格式化为聊天消息。
3.  **添加用户输入**：它会附加当前的用户消息和任何附加文件。
4.  **配置工具**：它会从 Agent 和当前上下文中收集所有可用的工具（技能），为模型格式化它们，并确定 `toolChoice` 策略。
5.  **设置响应格式**：如果提供了 `outputSchema`，它会配置模型的 `responseFormat` 以确保结构化输出（例如，JSON）。

### 示例

以下是一个 `PromptBuilder` 如何组装一个完整请求的综合示例。

```typescript
import { PromptBuilder } from "packages/core/src/prompt/prompt-builder.ts";
import { AIAgent } from "packages/core/src/agents/ai-agent.ts";
import { z } from "zod";

// 1. 定义一个带有指令和输出模式的 Agent
const myAgent = new AIAgent({
  name: "UserExtractor",
  description: "Extracts user details from text.",
  instructions: "Extract the user's name and age from the following text.",
  outputSchema: z.object({
    name: z.string().describe("The user's full name"),
    age: z.number().describe("The user's age in years"),
  }),
});

// 2. 创建一个 PromptBuilder 实例
const builder = new PromptBuilder();

// 3. 定义用户的输入消息
const userInput = {
  message: "My name is John Doe and I am 30 years old.",
};

// 4. 构建最终的 ChatModelInput
const chatModelInput = await builder.build({
  agent: myAgent,
  input: userInput,
});

console.log(JSON.stringify(chatModelInput, null, 2));
// 输出:
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