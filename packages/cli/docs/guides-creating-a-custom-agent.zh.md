# 创建自定义 Agent

本指南提供分步教程，指导您如何使用 JavaScript 创建新的 Agent，并将其作为可重用技能集成到您的 AIGNE 项目中。技能是可以由更高级别的 Agent 编排的基本可执行组件。

阅读本指南后，您将学会：
- 编写一个作为 Agent 的 JavaScript 函数。
- 使用标准 JSON 模式定义其接口。
- 在项目配置中将新的 Agent 注册为技能。

---

## 步骤 1：创建 JavaScript 技能文件

首先，为您的 Agent 创建一个新的 JavaScript 文件。一个好的做法是将技能保存在专用目录中，例如 `skills/`。让我们创建一个简单的 Agent，它接受一个名称并返回一句问候语。

创建一个名为 `greeter.js` 的文件：

```javascript
// skills/greeter.js
import vm from "node:vm";

export default async function greeter({ name }) {
  const result = `Hello, ${name}!`;
  return { greeting: result };
}
```

该文件导出一个默认的异步函数。该函数接受一个包含 `name` 属性的对象，并返回一个包含 `greeting` 属性的对象。

## 步骤 2：定义元数据和模式

为使 AIGNE 引擎能够理解如何使用您的 Agent，您必须为该函数附加元数据。这包括描述、输入模式和输出模式。

修改您的 `greeter.js` 文件以包含以下属性：

```javascript
import vm from "node:vm";

export default async function greeter({ name }) {
  const result = `Hello, ${name}!`;
  return { greeting: result };
}

// Agent 功能的人类可读描述。
greeter.description = "此 Agent 生成友好的问候语。";

// 定义预期的输入结构。
greeter.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "要问候的人的姓名" },
  },
  required: ["name"],
};

// 定义预期的输出结构。
greeter.output_schema = {
  type: "object",
  properties: {
    greeting: { type: "string", description: "生成的问候消息" },
  },
  required: ["greeting"],
};
```

- `description`：对 Agent 用途的清晰、简洁的解释。
- `input_schema`：一个用于验证输入的 JSON Schema 对象。它指定输入必须是一个包含名为 `name` 的必需字符串属性的对象。
- `output_schema`：一个描述输出的 JSON Schema 对象。它指定 Agent 将返回一个包含名为 `greeting` 的必需字符串属性的对象。

## 步骤 3：将技能集成到您的项目中

创建技能后，您需要让您的 AIGNE 项目能够识别它。为此，您需要将文件路径添加到 `aigne.yaml` 配置文件的 `skills` 列表中。

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
  - greeter.js # 在此处添加您的新技能
```

通过将 `greeter.js` 添加到 `skills` 列表，项目中的任何 Agent 都可以使用它。

## 步骤 4：运行您的 Agent

技能创建并注册后，您现在可以使用 `aigne run` 命令直接执行它。这对于独立测试您的技能非常有用。

要运行 `greeter` 技能，您可以使用以下命令，并提供所需的 `name` 输入：

```bash
aigne run greeter.js --input '{"name": "World"}'
```

**预期输出：**

```json
{
  "greeting": "Hello, World!"
}
```

---

## 后续步骤

您已成功创建并集成自定义 JavaScript Agent。现在，您项目中的其他 Agent 可以将此技能组合成更复杂的工作流。

- 要了解有关 Agent 和技能的结构及交互方式的更多信息，请参阅 [Agents and Skills](./core-concepts-agents-and-skills.md) 文档。
- 有关更高级的执行选项，请参阅 [`aigne run`](./command-reference-run.md) 命令参考。
