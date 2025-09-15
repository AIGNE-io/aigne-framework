---
labels: ["Reference"]
---

# Agents 和技能

在 AIGNE 生态系统中，Agents 和技能是让你的 AI 应用得以实现的基础构建模块。它们协同工作，共同创建复杂的、由工具增强的 AI 系统。可以将 Agent 视为负责推理和对话的大脑，而技能则是它用来执行操作和与外部世界交互的工具。

本节将介绍这些核心组件的定义和结构。有关如何在项目中将它们连接在一起的详细信息，请参阅 [项目配置 (aigne.yaml)](./core-concepts-project-configuration.md) 文档。

## Agents

Agent 是处理用户输入、维护上下文并决定采取何种行动的核心组件。其行为由一组指令（其核心提示）及其有权访问的技能集合来定义。

Agents 通常在 `.yaml` 文件中定义。

### Agent 定义示例

以下是一个配备了代码执行技能的聊天 Agent 的基本示例。

```yaml chat.yaml icon=mdi:robot-outline
name: chat
description: 聊天 Agent
instructions: |
  你是一个乐于助人的助手，可以回答问题并提供关于各种主题的信息。
  你的目标是帮助用户找到他们需要的信息，并进行友好的对话。
input_key: message
memory: true
skills:
  - sandbox.js
```

### Agent 属性

Agent 的行为通过其 YAML 定义文件中的几个关键属性进行配置：

| 属性           | 类型      | 描述                                                                                            |
|----------------|-----------|---------------------------------------------------------------------------------------------------------|
| `name`         | `string`  | Agent 的简短描述性名称。                                                                                |
| `description`  | `string`  | 对 Agent 用途的更详细说明。                                                                             |
| `instructions` | `string`  | 定义 Agent 个性、目标和约束的系统提示。这是其核心逻辑。                                                 |
| `input_key`    | `string`  | 输入对象中包含主要用户消息的属性名称（例如，`message`）。                                               |
| `memory`       | `boolean` | 如果为 `true`，Agent 将保留对话历史记录，从而支持后续提问和上下文。                                       |
| `skills`       | `array`   | Agent 有权使用的技能文件列表（例如，`sandbox.js`）。                                                    |

## 技能

技能是一个可执行函数，通常用 JavaScript 编写，为 Agent 提供特定功能。这可以是运行代码、从 API 获取数据或与文件系统交互等任何操作。技能是连接大语言模型推理与具体任务执行之间的桥梁。

### 技能定义示例

技能是标准的 Node.js 模块，导出一个默认的异步函数。关键在于，它们还导出描述其用途并定义其输入/输出结构的元数据，从而使 Agent 能够理解如何以及何时使用它们。

```javascript sandbox.js icon=logos:javascript
import vm from "node:vm";

export default async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

evaluateJs.description = "该 Agent 用于评估 JavaScript 代码。";

evaluateJs.input_schema = {
  type: "object",
  properties: {
    code: { type: "string", description: "要评估的 JavaScript 代码" },
  },
  required: ["code"],
};

evaluateJs.output_schema = {
  type: "object",
  properties: {
    result: { type: "any", description: "已评估代码的结果" },
  },
  required: ["result"],
};
```

### 技能结构

一个技能文件由三个主要部分组成：

1.  **默认导出的函数**：技能的核心逻辑。它是一个 `async` 函数，接收一个参数对象并返回一个结果。
2.  **`description`**：附加到函数上的字符串属性，用自然语言描述该技能的功能。Agent 的底层 LLM 使用此描述来确定何时适合调用此技能。
3.  **`input_schema` / `output_schema`**：定义函数输入和输出的预期结构和类型的 JSON Schema 对象。这确保了 Agent 提供有效的参数，并能正确解释结果。

## 它们如何协同工作

用户、Agent 和技能之间的交互遵循一个清晰的模式。Agent 充当智能协调器，解释用户的请求并调用适当的技能来完成它。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Runtime: {
  label: "AIGNE 运行时"
  shape: rectangle

  Chat-Agent: {
    label: "聊天 Agent"
  }

  Sandbox-Skill: {
    label: "沙箱技能 (sandbox.js)"
  }
}

User -> AIGNE-Runtime.Chat-Agent: "1. 输入：'5 + 7 等于多少？'"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Chat-Agent: "2. LLM 推理出需要进行计算"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Sandbox-Skill: "3. 使用 { code: '5 + 7' } 调用技能"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Sandbox-Skill: "4. 在沙箱中执行代码"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Chat-Agent: "5. 返回 { result: 12 }"
AIGNE-Runtime.Chat-Agent -> User: "6. 形成响应：'结果是 12。'"
```

通过将推理 (Agent) 与执行（技能）分离，你可以构建功能强大且可扩展的 AI 系统，这些系统易于维护和升级。

### 后续步骤

既然你已经了解了 Agents 和技能的核心概念，可以继续阅读以下部分：

<x-cards>
  <x-card data-title="项目配置 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    了解如何在主项目配置文件中配置 Agents、技能和模型。
  </x-card>
  <x-card data-title="创建自定义 Agent" data-icon="lucide:wand-sparkles" data-href="/guides/creating-a-custom-agent">
    按照分步指南构建你自己的自定义 Agent，并将其集成为一个技能。
  </x-card>
</x-cards>