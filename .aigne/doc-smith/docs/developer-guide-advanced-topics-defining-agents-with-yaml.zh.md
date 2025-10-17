# 使用 YAML 定义 Agent

AIGNE 框架支持使用 YAML 配置文件以声明式方法来定义 Agent。这种方法将 Agent 的定义（其属性、指令和技能）与应用程序的业务逻辑分离开来，从而促进了更好的组织、可重用性，并使复杂 Agent 系统的管理更加容易。

本指南全面概述了用于定义各种 Agent 类型及其属性的 YAML 语法。

## 基本结构

每个 Agent 的定义，无论其类型如何，都包含在一个 `.yaml` 文件中。`type` 属性是主要的区分符，它决定了 Agent 的行为和所需的属性。如果省略 `type`，则默认为 `ai`。

以下是一个 AI Agent 配置的基本示例：

```yaml chat.yaml
name: 基础聊天 Agent
description: 一个响应用户消息的简单 Agent。
type: ai
instructions: "你是一个乐于助人的助手。请简明扼要地回复用户的消息。"
input_key: message
skills:
  - my-skill.js
```

### 核心属性

以下属性在大多数 Agent 类型中是通用的：

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agent 的人类可读名称。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>关于 Agent 目的和功能的简要描述。</x-field-desc>
  </x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-default="ai">
    <x-field-desc markdown>指定 Agent 的类型。决定了所需的字段和行为。有效类型包括 `ai`、`image`、`team`、`transform`、`mcp` 和 `function`。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="object | string" data-required="false">
    <x-field-desc markdown>用于 Agent 的聊天模型的配置，会覆盖任何全局定义的模型。可以是一个字符串或一个详细的对象。</x-field-desc>
  </x-field>
  <x-field data-name="skills" data-type="array" data-required="false">
    <x-field-desc markdown>该 Agent 可用作工具的其他 Agent 或 JavaScript/TypeScript 函数的列表。每个技能通过其文件路径引用。</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>定义预期输入结构的 JSON schema。可以是一个内联对象或一个指向外部 `.json` 或 `.yaml` 文件的路径。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>用于结构化 Agent 输出的 JSON schema。可以是一个内联对象或一个指向外部文件的路径。这对启用结构化输出至关重要。</x-field-desc>
  </x-field>
  <x-field data-name="memory" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>为 Agent 启用状态性。设置为 `true` 可使用默认内存，或提供一个配置对象以指定提供商。</x-field-desc>
  </x-field>
  <x-field data-name="hooks" data-type="array" data-required="false">
    <x-field-desc markdown>定义生命周期钩子（`onStart`、`onSuccess`、`onError`、`onEnd`），在执行的不同阶段触发其他 Agent。</x-field-desc>
  </x-field>
</x-field-group>

## 加载外部提示和 Schema

为了保持配置的整洁和模块化，你可以从外部文件加载 Agent 的指令和 schema。这对于复杂的提示或可重用的数据结构特别有用。

### 外部指令

对于 `ai` 和 `image` 类型的 Agent，指令可能会很长。你可以将它们定义在一个单独的 Markdown 或文本文件中，并使用 `url` 键来引用它。

```yaml chat-with-prompt.yaml
name: chat-with-prompt
description: 一个从外部文件加载指令的 AI Agent。
type: ai
instructions:
  url: prompts/main-prompt.md
input_key: message
memory: true
skills:
  - skills/sandbox.js
```

`main-prompt.md` 文件包含了将用作 Agent 系统提示的原始文本。

```markdown prompts/main-prompt.md
你是一位编程大师。当用户要求提供代码时，请提供一个完整、可运行的示例，并解释其关键部分。
```

你还可以构建一个包含不同角色的多部分提示：

```yaml multi-role-prompt.yaml
instructions:
  - role: system
    url: prompts/system-role.md
  - role: user
    content: "这是一个良好回应的示例："
  - role: assistant
    url: prompts/example-response.md
```

### 外部 Schema

同样，`inputSchema` 和 `outputSchema` 可以引用定义 schema 结构的外部 JSON 或 YAML 文件。

```yaml structured-output-agent.yaml
name: JSON 提取器
type: ai
instructions: 从文本中提取用户的姓名和电子邮件。
outputSchema: schemas/user-schema.yaml
```

`user-schema.yaml` 文件将包含 JSON schema 定义：

```yaml schemas/user-schema.yaml
type: object
properties:
  name:
    type: string
    description: 用户的全名。
  email:
    type: string
    description: 用户的电子邮件地址。
required:
  - name
  - email
```

## Agent 类型详情

以下部分详细介绍了每种 Agent 类型的独特配置属性。

### AI Agent (`type: ai`)

`AIAgent` 是最常见的类型，专为与语言模型的通用交互而设计。

```yaml ai-agent-example.yaml
type: ai
name: 客户支持 AI
instructions:
  url: prompts/support-prompt.md
input_key: customer_query
output_key: response
# 强制模型调用特定技能
tool_choice: "sandbox"
outputSchema: schemas/support-response.yaml
skills:
  - sandbox.js
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object | array" data-required="false">
    <x-field-desc markdown>AI 模型的系统提示或指令。可以是一个简单的字符串，一个对外部文件（`url`）的引用，或一个消息对象数组（`role`, `content`/`url`）。</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>输入对象中包含要发送给模型的主要用户消息的键。</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-required="false">
    <x-field-desc markdown>AI 的最终文本响应将被放置在输出对象中的键。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="string" data-required="false">
    <x-field-desc markdown>强制模型使用特定的技能（工具）。该值必须与附加到 Agent 的技能名称匹配。</x-field-desc>
  </x-field>
</x-field-group>

### Team Agent (`type: team`)

`TeamAgent` 协调一组子 Agent（在 `skills` 下定义）来执行多步骤任务。

```yaml team-agent-example.yaml
type: team
name: 研究与写作团队
# Agent 将按顺序逐个运行
mode: sequential
# 此团队的输出将是所有步骤输出的集合
include_all_steps_output: true
skills:
  - url: agents/researcher.yaml
  - url: agents/writer.yaml
  - url: agents/editor.yaml
```

<x-field-group>
  <x-field data-name="mode" data-type="string" data-required="false" data-default="sequential">
    <x-field-desc markdown>团队的执行模式。可以是 `sequential`（Agent 按顺序运行）或 `parallel`（Agent 并发运行）。</x-field-desc>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown>输入对象中包含数组的键。团队将为数组中的每个项目执行其工作流。</x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="object" data-required="false">
    <x-field-desc markdown>配置一个自我修正循环，其中 `reviewer` Agent 检查输出，并可以触发重新运行，直到输出被批准。</x-field-desc>
  </x-field>
</x-field-group>

### Image Agent (`type: image`)

`ImageAgent` 专门用于使用图像模型生成图像。

```yaml image-agent-example.yaml
type: image
name: Logo 生成器
instructions: "为一家名为 'Innovate' 的科技初创公司设计一个简约、扁平化风格的 Logo。"
# 将特定选项传递给图像模型提供商
model_options:
  quality: hd
  style: vivid
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object" data-required="true">
    <x-field-desc markdown>描述所需图像的提示。与 AI Agent 不同，这是一个必填字段。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用于控制图像生成的提供商特定选项的键值映射（例如 `quality`、`style`、`size`）。</x-field-desc>
  </x-field>
</x-field-group>

### Transform Agent (`type: transform`)

`TransformAgent` 使用 [JSONata](https://jsonata.org/) 表达式以声明方式映射、过滤或重构 JSON 数据，而无需编写代码。

```yaml transform-agent-example.yaml
type: transform
name: 用户格式化器
description: 从列表中提取并格式化用户名。
jsonata: "payload.users.{'name': firstName & ' ' & lastName}"
```

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>对输入数据执行的 JSONata 表达式。</x-field-desc>
  </x-field>
</x-field-group>

## 总结

通过 YAML 定义 Agent 为程序化定义提供了一种强大的声明式替代方案。它允许清晰的关注点分离，增强了可重用性，并简化了 Agent 配置的管理。通过利用外部文件来处理提示和 schema，你可以构建复杂、模块化且可维护的 AI 系统。

有关更多实践示例，请参阅[高级主题](./developer-guide-advanced-topics.md)部分中的其他指南。