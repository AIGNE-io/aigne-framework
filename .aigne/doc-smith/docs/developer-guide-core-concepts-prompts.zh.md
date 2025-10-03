# 提示

在 AIGNE 框架中，提示是指导 AI 模型的主要机制。一个结构良好的提示对于引导模型产生期望的输出至关重要。该框架提供了一个由 `PromptBuilder` 类管理的灵活而强大的模板系统，用于为各种 Agent 创建动态、可重用和复杂的提示。

该系统允许您构建多轮对话，使用变量插入动态数据，并通过包含（includes）在不同提示之间重用通用指令。

## `PromptBuilder` 类

`PromptBuilder` 是负责构建发送给聊天模型的最终输入的核心组件。它接收一组指令，将它们与用户输入、Agent 配置和上下文等运行时数据相结合，并编译成一个结构化的 `ChatModelInput` 对象。

您可以通过以下几种方式初始化 `PromptBuilder`：

*   **通过简单字符串：** 用于基本的单消息提示。
*   **通过文件路径：** 从外部文件加载复杂或多部分的提示模板。
*   **通过结构化对象：** 以编程方式定义多角色对话。

`build` 方法是 `PromptBuilder` 的核心功能。它负责协调整个提示构建过程，包括消息格式化、记忆集成和工具配置。

```typescript PromptBuilder 类 icon=logos:typescript
class PromptBuilder {
  /**
   * 为聊天模型构建最终的提示输入。
   * @param options - 构建选项，包括 Agent、输入和上下文。
   * @returns 一个解析为 ChatModelInput 对象的 Promise。
   */
  async build(options: PromptBuildOptions): Promise<ChatModelInput & { toolAgents?: Agent[] }> {
    // 实现细节...
  }

  // 其他方法...
}
```

## 使用变量进行模板化

AIGNE 使用基于 [Nunjucks](https://mozilla.github.io/nunjucks/) 的模板引擎，允许您将变量直接嵌入到提示中。这使得在运行时将用户输入、来自其他 Agent 的数据或任何其他上下文信息动态插入到提示中成为可能。

变量由双花括号表示，例如 `{{ variable_name }}`。

### 示例：在提示中使用变量

考虑一个使用 YAML 配置定义的 Agent，其指令中包含一个变量 `topic`。

```yaml test-agent-with-multi-roles-instructions.yaml icon=mdi:language-yaml
type: ai
name: test_agent_with_multi_roles_instructions
instructions:
  - role: system
    url: ./test-agent-with-multi-roles-instructions-system.txt
  - role: user
    content: This is a user instruction.
  - role: agent
    content: This is an agent instruction.
  - role: user
    content: Latest user instruction about {{topic}}
input_schema:
  type: object
  properties:
    topic:
      type: string
  required: [topic]
```

当调用此 Agent 时，`PromptBuilder` 会将 `{{topic}}` 替换为 `input` 对象中提供的值。例如，如果使用 `{ topic: "AIGNE prompts" }` 调用该 Agent，那么发送给模型的最终用户消息将是“Latest user instruction about AIGNE prompts”。

## 使用 Includes 实现可重用提示

为了提高可重用性和可维护性，模板引擎支持 `{% include %}` 标签。这允许您将一个文件的内容直接导入到另一个文件中，非常适合在多个 Agent 之间共享通用指令、角色定义或格式化指南。

使用 includes 时，设置 `workingDir` 选项非常重要，这样模板引擎才能正确解析相对文件路径。

### 示例：包含指令文件

在这里，一个主提示文件包含了一个含有特定语言指令的独立文件。

```markdown chat-prompt.md icon=mdi:markdown
You are a helper agent to answer everything about chat prompt in AIGNE.

{% include "language_instruction.txt" %}
```

`language_instruction.txt` 的内容将被插入到 `{% include %}` 标签所在的位置。这使您可以在一个位置管理语言指令，并在任何需要它们的提示中重用它们。

## 多角色对话模板

提示不限于单个系统消息。您可以通过定义一系列具有不同角色（`system`、`user`、`agent`）的消息来构建复杂的多轮对话。这是通过使用 `ChatMessagesTemplate` 实现的，它接受一个消息模板数组。

每条消息都可以使用相应的模板类创建：

*   `SystemMessageTemplate`：用于系统级指令。
*   `UserMessageTemplate`：用于用户输入或问题。
*   `AgentMessageTemplate`：用于助手的示例响应。
*   `ToolMessageTemplate`：用于工具调用的结果。

这种结构化方法对于少样本提示（few-shot prompting）至关重要，您可以通过提供示例来指导模型的行为和响应格式。

### 示例：定义多角色提示

下面的 YAML 示例定义了一个包含 `system`、`user` 和 `agent` 消息的对话。

```typescript 创建 ChatMessagesTemplate icon=logos:typescript
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
  AgentMessageTemplate
} from "@aigne/core";

const instructions = new ChatMessagesTemplate([
  SystemMessageTemplate.from("You are a helpful assistant."),
  UserMessageTemplate.from("What is the capital of France?"),
  AgentMessageTemplate.from("The capital of France is Paris."),
  UserMessageTemplate.from("What is the primary language spoken there?")
]);

// 此模板现在可以被 PromptBuilder 使用。
```

这种结构化格式使您能够精确控制提供给模型的对话历史，从而实现更复杂、更具上下文感知能力的交互。