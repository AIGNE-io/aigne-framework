---
labels: ["Reference"]
---

# 创建自定义 Agent

本指南提供分步教程，讲解如何使用 JavaScript 创建新的 Agent，并将其作为可复用技能集成到 AIGNE 项目中。技能是基本的可执行组件，可由更高级别的 Agent 编排以执行特定任务。

阅读本指南后，您将学习如何：
- 编写一个用作技能的 JavaScript 函数。
- 使用标准 JSON 结构定义其输入和输出接口。
- 在项目配置中注册新技能。
- 直接测试技能，并在更大的 Agent 中使用它。

## 工作原理：概述

在深入学习之前，了解自定义技能如何融入 AIGNE 生态系统会很有帮助。下图说明了自定义技能文件、项目配置和 AIGNE 运行时引擎之间的关系。当您运行项目时，引擎会加载您的技能，使其可供大语言模型 (LLM) 在响应用户提示时使用。

```d2
direction: down

"AIGNE-Project-Structure": {
    label: "AIGNE 项目结构"
    shape: package

    "Configuration": {
        shape: document
        label: "aigne.yaml"
    }

    "Custom-Skill": {
        shape: document
        label: "skills/calculator.js"
    }

    "Agent": {
        shape: document
        label: "chat.yaml"
    }

    "Configuration" -> "Custom-Skill": "注册"
    "Configuration" -> "Agent": "提供技能给"
}

"Execution-Flow": {
    "User": {
        shape: person
        label: "用户"
    }
    
    "CLI": {
        label: "aigne run --chat"
        shape: rectangle
    }

    "AIGNE-Engine": {
        label: "AIGNE 引擎"
        shape: hexagon
    }

    "LLM": {
        label: "LLM"
        shape: cloud
    }

    "User" -> "CLI": "1. 运行命令"
    "CLI" -> "AIGNE-Engine": "2. 启动会话"
    "AIGNE-Engine" -> "AIGNE-Project-Structure": "3. 加载项目"
    "AIGNE-Engine" <-> "LLM": "4. 编排"
    "LLM" -> "AIGNE-Project-Structure.Custom-Skill": "5. 选择并使用技能"
}

```

## 第 1 步：创建 JavaScript 技能文件

首先，为您的 Agent 创建一个新的 JavaScript 文件。一种常见的做法是将自定义技能组织在专用目录中，例如 `skills/`。我们将创建一个简单的 Agent，用于将两个数字相加。

在项目的 `skills/` 目录中创建一个名为 `calculator.js` 的文件：

```javascript
// skills/calculator.js
export default async function calculator({ a, b }) {
  const result = a + b;
  return { result };
}
```

该文件导出一个默认的异步函数。该函数接受一个包含 `a` 和 `b` 属性的对象，并返回一个在 `result` 属性中包含它们总和的对象。

## 第 2 步：定义元数据和结构

为了让 AIGNE 引擎理解如何使用您的技能，您必须为该函数附加元数据。这包括 `description`、`input_schema` 和 `output_schema`。

修改您的 `calculator.js` 文件以包含这些属性：

```javascript
// skills/calculator.js
export default async function calculator({ a, b }) {
  const result = a + b;
  return { result };
}

// 技能作用的人类可读描述。
calculator.description = "This skill calculates the sum of two numbers.";

// 使用 JSON Schema 定义预期的输入结构。
calculator.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "第一个数字" },
    b: { type: "number", description: "第二个数字" },
  },
  required: ["a", "b"],
};

// 使用 JSON Schema 定义预期的输出结构。
calculator.output_schema = {
  type: "object",
  properties: {
    result: { type: "number", description: "两个数字的和" },
  },
  required: ["result"],
};
```

- **`description`**：对技能用途的清晰解释。这有助于语言模型理解何时使用它。
- **`input_schema`**：一个用于验证输入的 JSON Schema 对象。它指定输入必须是一个包含两个必需数字属性 `a` 和 `b` 的对象。
- **`output_schema`**：一个描述输出的 JSON Schema 对象。它指定技能将返回一个包含名为 `result` 的必需数字属性的对象。

## 第 3 步：将技能集成到项目中

技能定义完成后，您需要将其注册到 AIGNE 项目中。将文件路径添加到 `aigne.yaml` 配置文件的 `skills` 列表中。

```yaml
# aigne.yaml

chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
  - skills/calculator.js # 在此处添加您的新技能
```

通过将 `skills/calculator.js` 添加到 `skills` 列表中，项目中的任何 Agent（例如默认的 `chat.yaml` Agent）都可以使用它。

## 第 4 步：测试您的技能

您可以使用 `aigne run` 从命令行直接执行技能。这对于在将其集成到更复杂的工作流之前，单独测试其逻辑非常有用。

要运行 `calculator` 技能，请使用 `--input` 标志提供所需的输入：

```bash
aigne run skills/calculator.js --input '{"a": 15, "b": 27}'
```

**预期输出：**

该命令将打印您技能的 JSON 输出。

```json
{
  "result": 42
}
```

这确认了您的技能按预期工作。现在您可以将其用作更大 Agent 的一部分。

当您运行主聊天 Agent 时，它现在将能够使用您的计算器来回答问题。使用 `aigne run --chat` 启动一个会话，并提出一个问题，例如“25 + 75 是多少？”。Agent 将识别出 `calculator` 技能可以解决这个问题，并使用它来提供答案。

![Running a project in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)
*您可以在交互式聊天会话中测试您的新技能。*

---

## 后续步骤

您已成功创建、集成并测试了一个自定义 JavaScript 技能。现在，您项目中的其他 Agent 可以将此技能组合到更复杂的工作流中。

- 要了解有关 Agent 和技能的结构及交互方式的更多信息，请参阅 [Agents and Skills](./core-concepts-agents-and-skills.md) 文档。
- 有关更高级的执行选项，请参阅 [`aigne run`](./command-reference-run.md) 命令参考。