# AI Agent

The `AIAgent` 是一个专门的 agent，它连接到语言模型以处理输入并生成响应。它充当应用程序逻辑与大型语言模型 (LLM) 强大功能之间的主要桥梁。该 agent 设计为高度可配置，支持自定义提示、工具使用（函数调用）和响应流等功能。

您可以通过编程方式使用 TypeScript 或通过声明方式使用 YAML 配置文件来创建 `AIAgent`。

## 基本用法

以下是使用 TypeScript 创建和调用 `AIAgent` 的基本示例。该示例演示了核心组件：一个 AI 模型、agent 本身以及用于运行它的 AIGNE 引擎。

```typescript 一个基本的 AI Agent icon=logos:typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 1. 创建一个 AI 模型实例
const model = new OpenAIChatModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4-turbo",
});

// 2. 创建带有指令的 AI agent
const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant.",
});

// 3. 使用 AIGNE 引擎来编排执行
const aigne = new AIGNE({ model });

// 4. 调用 agent 并发送消息
const userAgent = await aigne.invoke(agent);
const response = await userAgent.invoke(
  "Hello, can you help me write a short article?",
);

console.log(response);
```

## 配置选项

`AIAgent` 可以通过传递给其构造函数的一组选项进行自定义。这些选项允许您控制从提示指令到 agent 如何使用工具的所有内容。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false">
    <x-field-desc markdown>用于指导 AI 模型行为的指令。可以是一个简单的字符串，也可以是一个 `PromptBuilder` 实例，用于创建复杂的动态提示。更多详情请参阅 [Prompts](./developer-guide-core-concepts-prompts.md) 文档。</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false" data-desc="指定输入消息中的哪个键应用作模型的主要用户消息。"></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-required="false" data-desc="定义 agent 的文本响应将存储在输出消息中的键。"></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-required="false">
    <x-field-desc markdown>控制 agent 如何使用工具。可设置为 `auto`、`none`、`required` 或 `router`。</x-field-desc>
  </x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-default="false" data-required="false" data-desc="如果为 true，memory agents 将作为工具提供给模型直接调用，允许其明确地检索或存储信息。"></x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-required="false" data-desc="如果为 false，当工具执行失败时，agent 将抛出错误。否则，它会捕获错误并继续处理。"></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-required="false" data-desc="启用一种模式，在该模式下，agent 的流式响应会被解析，以提取嵌入在特殊标签中的结构化元数据（例如 JSON 或 YAML）。"></x-field>
</x-field-group>

## YAML 配置

在许多用例中，通过 YAML 文件定义 agents 是一种更方便、更易读的方法。AIGNE 框架可以加载这些文件来实例化和配置 agents。

以下是在 YAML 文件中定义的简单聊天 agent 示例。

```yaml 聊天 Agent 配置 icon=mdi:file-yaml
name: chat
model: google/gemini-2.5-flash
description: 聊天 agent
instructions: |
  您是一个乐于助人的助手，可以回答问题并提供关于各种主题的信息。
  您的目标是帮助用户找到他们需要的信息，并进行友好对话。
input_key: message
memory: true
skills:
  - sandbox.js
```

在此配置中：
- `name`、`model` 和 `description` 定义了 agent 的基本属性。
- `instructions` 为语言模型提供系统提示。
- `input_key` 告诉 agent 使用输入中的 `message` 字段作为用户查询。
- `memory: true` 为 agent 启用内存。
- `skills` 列出了 agent 可用的工具（在本例中是一个 JavaScript 沙箱）。

您还可以将指令外部化到单独的文件中，以便更好地组织。

```yaml 使用外部提示文件 icon=mdi:file-yaml
name: chat-with-prompt
description: 聊天 agent
instructions:
  url: chat-prompt.md
input_key: message
memory: true
skills:
  - sandbox.js
```

## 高级功能

### 工具选择

`toolChoice` 选项决定了 agent 如何与其分配的工具（技能）进行交互。

| Mode       | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `auto`     | （默认）语言模型根据用户输入决定是否使用工具。 |
| `none`     | 为 agent 禁用所有工具。                                      |
| `required` | 强制 agent 使用其中一个可用工具。                         |
| `router`   | agent 对模型进行单次调用以选择最合适的工具，然后将用户输入直接路由到该工具执行。这对于创建专门的路由 agents 非常高效。 |

### 结构化流模式

当 `structuredStreamMode` 启用时，`AIAgent` 可以直接从流式响应中解析和提取结构化数据，如 JSON 或 YAML。必须指示模型将结构化数据包装在特定标签中（例如，`<metadata>...</metadata>`）。这对于需要在自然语言响应的同时提取特定实体、分类或其他结构化信息的任务非常有用。

## 摘要

`AIAgent` 是 AIGNE 框架中一个多功能的核心组件。它提供了与语言模型的强大接口，并通过工具使用、内存集成和高级数据提取等强大功能得到增强。

对于更复杂的场景，您可以使用 [Team Agent](./developer-guide-agent-types-and-examples-team-agent.md) 组合多个 agents，或使用自定义 [Prompts](./developer-guide-core-concepts-prompts.md) 定义复杂的交互逻辑。