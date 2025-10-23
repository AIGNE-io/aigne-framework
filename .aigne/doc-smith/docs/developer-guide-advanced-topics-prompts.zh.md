# 提示词

与 AI 模型的有效沟通取决于所提供提示词的质量和结构。AIGNE 框架通过其 `PromptBuilder` 类和集成的 Nunjucks 模板引擎，提供了一个强大的系统，用于创建动态、可复用和结构化的提示词。本指南对这些组件进行了系统性解释。

有关如何在 Agent 中使用提示词的更多背景信息，请参阅 [AI Agent](./developer-guide-agents-ai-agent.md) 文档。

## 使用 Nunjucks 进行提示词模板化

该框架利用 [Nunjucks 模板引擎](https://mozilla.github.io/nunjucks/) 来促进动态提示词的创建。这允许直接在提示词文件中注入变量、包含外部文件以及实现其他编程逻辑。

所有提示词文本都由 `PromptTemplate` 类处理，该类使用 Nunjucks 来渲染最终的字符串。

### 变量替换

您可以使用 `{{ variable_name }}` 语法在提示词中定义占位符。这些占位符会在运行时被替换为实际值。

```markdown title="analyst-prompt.md" icon=mdi:text-box
Analyze the following data:

{{ data }}
```

在使用此提示词调用 Agent 时，您需要在输入消息中提供 `data` 变量。

```typescript title="index.ts" icon=logos:typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { OpenAI }s from "@aigne/openai";

const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const aigne = new AIGNE({
  model,
  agents: {
    analyst: new AIAgent({
      instructions: { path: "./analyst-prompt.md" },
      inputKey: "data",
    }),
  },
});

const result = await aigne.invoke("analyst", {
  data: "User feedback scores: 8, 9, 7, 10, 6.",
});

console.log(result);
```

### 文件包含

Nunjucks 允许使用 `{% include "path/to/file.md" %}` 标签从多个文件组合提示词。这对于在不同提示词中复用通用指令或组件非常有效。路径是相对于包含 `include` 标签的文件进行解析的。

例如，您可以在一个文件中定义一组通用指令，并将其包含在另一个文件中。

```markdown title="common-instructions.md" icon=mdi:text-box
Always respond in a professional and factual manner.
Do not speculate or provide opinions.
```

```markdown title="main-prompt.md" icon=mdi:text-box
You are an expert financial analyst.

{% include "./common-instructions.md" %}

Analyze the quarterly earnings report provided.
```

这种模块化的方法简化了提示词管理并确保了一致性。

## 使用 ChatMessageTemplate 构建提示词结构

对于基于聊天的模型，提示词被构建为一系列消息，每条消息都有特定的角色。该框架提供了以编程方式表示这些消息的类。

-   **`SystemMessageTemplate`**：为 AI 模型设置上下文或高级指令。
-   **`UserMessageTemplate`**：表示来自最终用户的消息。
-   **`AgentMessageTemplate`**：表示 AI 模型的先前响应，可用于少样本提示或继续对话。
-   **`ToolMessageTemplate`**：表示 Agent 进行工具调用的结果。

这些模板可以组合成一个 `ChatMessagesTemplate` 来定义一个完整的对话式提示词。

```typescript title="structured-prompt.ts" icon=logos:typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "@aigne/core";

const promptTemplate = new ChatMessagesTemplate([
  SystemMessageTemplate.from(
    "You are a helpful assistant that translates {{ input_language }} to {{ output_language }}."
  ),
  UserMessageTemplate.from("{{ text }}"),
]);

// 然后，此模板可以在 AIAgent 的 `instructions` 中使用。
```

## `PromptBuilder` 类

`PromptBuilder` 是负责组装发送给语言模型的最终完整提示词的核心组件。它协调整个过程，将各种输入整合成一个连贯的结构。

下图说明了信息流入 `PromptBuilder` 的流程：
<d2>
direction: right
style {
  stroke-width: 2
  font-size: 14
}
"用户输入 (消息)": {
  shape: document
  style.fill: "#D1E7DD"
}
"提示词模板 (.md)": {
  shape: document
  style.fill: "#D1E7DD"
}
"Agent 配置": {
  shape: document
  style.fill: "#D1E7DD"
}
上下文: {
  shape: document
  style.fill: "#D1E7DD"
}
PromptBuilder: {
  shape: hexagon
  style.fill: "#A9CCE3"
}
"ChatModelInput (发送至 LLM)": {
  shape: document
  style.fill: "#FADBD8"
}

"用户输入 (消息)" -> PromptBuilder
"提示词模板 (.md)" -> PromptBuilder
"Agent 配置" -> PromptBuilder
上下文 -> PromptBuilder

PromptBuilder -> "ChatModelInput (发送至 LLM)"

"Agent 配置".children: {
  "技能/工具"
  记忆
  "输出模式"
}

"ChatModelInput (发送至 LLM)".children: {
  "渲染后的消息"
  "工具定义"
  "响应格式"
}
</d2>

`PromptBuilder` 在 `build` 过程中自动执行以下操作：

1.  **加载指令**：从字符串、文件路径或 MCP `GetPromptResult` 对象加载提示词模板。
2.  **渲染模板**：使用 Nunjucks 格式化提示词模板，注入用户输入消息中的变量。
3.  **注入记忆**：如果 Agent 配置为使用记忆，`PromptBuilder` 会检索相关记忆并将其转换为系统、用户或 Agent 消息，以提供对话上下文。
4.  **整合工具（技能）**：收集所有可用的技能（来自 Agent 配置和调用上下文），并将其格式化为模型的 `tools` 和 `tool_choice` 参数。
5.  **定义响应格式**：如果 Agent 具有 `outputSchema`，`PromptBuilder` 会配置模型的 `responseFormat` 以强制执行结构化的 JSON 输出。

### 实例化

创建 `PromptBuilder` 最常用的方法是通过静态的 `PromptBuilder.from()` 方法，该方法可以接受不同的来源：

-   **来自字符串**：
    ```typescript
    const builder = PromptBuilder.from("You are a helpful assistant.");
    ```
-   **来自文件路径**：
    ```typescript
    const builder = PromptBuilder.from({ path: "./prompts/my-prompt.md" });
    ```

当使用 `instructions` 定义 `AIAgent` 时，它内部会使用 `PromptBuilder.from()` 来创建和管理提示词构建过程。

## 总结

AIGNE 框架为提示词工程提供了一个分层且强大的系统。通过理解和利用 `PromptTemplate` 与 Nunjucks 来处理动态内容，以及使用 `PromptBuilder` 来协调最终结构，您可以为您的 AI Agent 创建复杂、模块化且有效的提示词。

如需进一步阅读，请探索 [AIAgent 文档](./developer-guide-agents-ai-agent.md)，了解这些提示词如何集成到 Agent 生命周期中。