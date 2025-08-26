---
labels: ["Reference"]
---

# 创建自定义 Agent

本指南提供分步教程，介绍如何使用 JavaScript 创建新的 Agent，并将其作为可重用技能集成到您的 AIGNE 项目中。技能是基本的可执行组件，可由更高级别的 Agent 编排以执行特定任务。

阅读本指南后，您将学会：
- 编写一个用作技能的 JavaScript 函数。
- 使用标准 JSON 结构为其定义输入和输出接口。
- 在项目配置中注册新技能。
- 直接测试技能，并在更大的 Agent 中使用它。

---

## 步骤 1：创建 JavaScript 技能文件

首先，为您的 Agent 创建一个新的 JavaScript 文件。通常的做法是将自定义技能组织在一个专用目录中，例如 `skills/`。我们将创建一个对两个数字求和的简单 Agent。

在您项目中的 `skills/` 目录中创建一个名为 `calculator.js` 的文件：

```javascript
// skills/calculator.js
export default async function calculator({ a, b }) {
  const result = a + b;
  return { result };
}
```

此文件导出一个默认的异步函数。该函数接受一个包含 `a` 和 `b` 属性的对象，并返回一个在 `result` 属性中包含其和的对象。

## 步骤 2：定义元数据和结构

为使 AIGNE 引擎能够理解如何使用您的技能，您必须为该函数附加元数据，包括 `description`、`input_schema` 和 `output_schema`。

修改您的 `calculator.js` 文件以包含这些属性：

```javascript
// skills/calculator.js
export default async function calculator({ a, b }) {
  const result = a + b;
  return { result };
}

// 技能功能的人类可读描述。
calculator.description = "此技能计算两个数字的和。";

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
- **`input_schema`**：一个用于验证输入的 JSON Schema 对象。它指定输入必须是一个具有两个必需的数字属性 `a` 和 `b` 的对象。
- **`output_schema`**：一个描述输出的 JSON Schema 对象。它指定技能将返回一个具有名为 `result` 的必需数字属性的对象。

## 步骤 3：将技能集成到您的项目中

现在技能已经定义好，您需要将其注册到您的 AIGNE 项目中。将文件路径添加到您的 `aigne.yaml` 配置文件中的 `skills` 列表中。

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

## 步骤 4：测试您的技能

您可以使用 `aigne run` 从命令行直接执行该技能。这对于在将其集成到更复杂的工作流之前独立测试其逻辑很有用。

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

当您运行主聊天 Agent 时，它现在将能够使用您的计算器来回答问题。使用 `aigne run --chat` 启动一个会话，并询问一个问题，例如“25 + 75 是多少？”。该 Agent 将识别出 `calculator` 技能可以解决这个问题，并使用它来提供答案。

![Running a project in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)
*可以测试您新技能的交互式聊天会话。*

---

## 后续步骤

您已成功创建、集成并测试了一个自定义 JavaScript 技能。现在，您项目中的其他 Agent 可以将此技能组合成更复杂的工作流。

- 要了解有关 Agent 和技能的结构及交互方式的更多信息，请参阅 [Agent 和技能](./core-concepts-agents-and-skills.md) 文档。
- 有关更高级的执行选项，请参阅 [`aigne run`](./command-reference-run.md) 命令参考。