---
labels: ["Reference"]
---

# 创建自定义 Agent

本指南提供分步教程，指导你如何创建一个新的 JavaScript agent 并将其作为技能集成到你的 AIGNE 项目中。Agent 是核心的可执行组件，为你的应用程序赋予独特的功能。通过创建自定义 agent，你可以扩展 AI 的功能，以执行特定任务、与外部 API 交互或操作本地数据。

### 前提条件

开始之前，请确保你已创建 AIGNE 项目。如果尚未创建，请先按照我们的[入门指南](./getting-started.md)进行创建。

### 步骤 1：创建技能文件

在 AIGNE 中，技能是一个 JavaScript 模块，它导出一个主函数和一些元数据。该函数包含你的 agent 将执行的逻辑。

我们来创建一个能生成问候语的简单 agent。在 AIGNE 项目的根目录下创建一个名为 `greeter.js` 的新文件，并添加以下代码：

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "A simple agent that returns a greeting message.";

greet.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "The name to include in the greeting." },
  },
  required: ["name"],
};

greet.output_schema = {
  type: "object",
  properties: {
    message: { type: "string", description: "The complete greeting message." },
  },
  required: ["message"],
};
```

我们来分解一下这个文件：

- **`export default async function greet({ name })`**：这是你的 agent 的主函数。它接受一个对象作为参数，该对象包含在 `input_schema` 中定义的输入。它返回的对象应符合 `output_schema`。
- **`greet.description`**：关于 agent 功能的纯文本描述。这至关重要，因为主语言模型会使用此描述来理解何时以及如何使用你的工具。
- **`greet.input_schema`**：一个 JSON Schema 对象，用于定义 agent 的预期输入。这能确保传递给你函数的数据是有效的。
- **`greet.output_schema`**：一个 JSON Schema 对象，用于定义 agent 的预期输出。

### 步骤 2：将技能集成到你的项目中

创建技能后，你需要将其注册到项目的配置文件中，以便主聊天 agent 能够使用它。

1.  打开项目根目录下的 `aigne.yaml` 文件。
2.  将新的 `greeter.js` 文件添加到 `skills` 列表中。

```yaml aigne.yaml icon=mdi:file-cog-outline
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
  - greeter.js # 在此处添加你的新技能
```

通过将你的脚本添加到此列表中，你使其成为一个可供主聊天 agent 在对话期间调用的工具。

### 步骤 3：直接测试你的 Agent

技能创建并注册后，就可以进行测试了。你可以使用 `aigne run` 从命令行直接执行任何技能文件。

在终端中运行以下命令：

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

该命令会执行你的 `greeter.js` 脚本，并将来自 `--input` 标志的 JSON 字符串作为参数传递给导出的函数。你应该能看到以下输出，这确认了你的 agent 按预期工作：

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### 步骤 4：在聊天模式中使用你的 Agent

当主 AI agent 能够动态地决定使用技能时，技能的真正威力才会显现。要查看实际效果，请在交互式聊天模式下运行你的项目：

```bash icon=mdi:console
aigne run --chat
```

聊天会话开始后，请 AI 使用你的新工具。例如：

```
> 使用 greeter 技能向世界问好。
```

AI 将识别该请求，根据其描述找到 `greeter` 技能，并使用正确的参数执行它。然后，它将使用你技能的输出来组织其回应。

### 后续步骤

恭喜！你已成功创建一个自定义 JavaScript agent，将其作为技能集成，并测试了其功能。现在你可以构建更复杂的 agent 来连接 API、管理文件或执行任何其他可以用脚本编写的任务。

要了解如何与他人共享你的项目，请查阅我们的[部署 Agent](./guides-deploying-agents.md) 指南。