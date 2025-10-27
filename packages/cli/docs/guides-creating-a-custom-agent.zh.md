---
labels: ["Reference"]
---

# 创建自定义 Agent

本指南提供了关于如何创建一个新的 JavaScript Agent 并将其作为技能集成到您的 AIGNE 项目中的分步教程。Agent 是赋予您的应用程序独特功能的核心可执行组件。通过创建自定义 Agent，您可以扩展 AI 的功能以执行专门任务、与外部 API 交互或操作本地数据。

### 前提条件

在开始之前，请确保您已设置好一个 AIGNE 项目。如果没有，请先按照我们的[入门指南](./getting-started.md)创建一个。

### 第 1 步：创建技能文件

在 AIGNE 中，一个技能是一个 JavaScript 模块，它导出一个主函数和一些元数据。该函数包含您的 Agent 将执行的逻辑。

让我们创建一个生成问候语的简单 Agent。在您的 AIGNE 项目的根目录中创建一个名为 `greeter.js` 的新文件，并添加以下代码：

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "一个返回问候消息的简单 Agent。";

greet.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "要包含在问候语中的名字。" },
  },
  required: ["name"],
};

greet.output_schema = {
  type: "object",
  properties: {
    message: { type: "string", description: "完整的问候消息。" },
  },
  required: ["message"],
};
```

我们来分解一下这个文件：

- **`export default async function greet({ name })`**：这是您的 Agent 的主函数。它接受一个对象作为参数，该对象包含在 `input_schema` 中定义的输入。它返回一个应符合 `output_schema` 的对象。
- **`greet.description`**：关于此 Agent 功能的纯文本描述。这一点至关重要，因为主语言模型会使用此描述来理解何时以及如何使用您的工具。
- **`greet.input_schema`**：一个 JSON Schema 对象，用于定义您的 Agent 预期的输入。这可以确保传递给函数的数据是有效的。
- **`greet.output_schema`**：一个 JSON Schema 对象，用于定义您的 Agent 预期的输出。

### 第 2 步：将技能集成到您的项目中

创建好技能后，您需要将其注册到项目配置文件中，以便主聊天 Agent 可以使用它。

1.  打开项目根目录下的 `aigne.yaml` 文件。
2.  将您的新文件 `greeter.js` 添加到 `skills` 列表中。

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
  - greeter.js # 在此处添加您的新技能
```

通过将您的脚本添加到此列表中，您就将其作为一个工具提供给主聊天 Agent 在对话期间调用。

### 第 3 步：直接测试您的 Agent

技能已创建并注册，现在可以对其进行测试了。您可以使用 `aigne run` 从命令行直接执行任何技能文件。

在您的终端中运行以下命令：

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

此命令会执行您的 `greeter.js` 脚本，并将来自 `--input` 标志的 JSON 字符串作为参数传递给导出的函数。您应该会看到以下输出，确认您的 Agent 按预期工作：

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### 第 4 步：在聊天模式下使用您的 Agent

当主 AI Agent 能够动态决定使用技能时，技能的真正威力才能得以释放。要查看实际效果，请在交互式聊天模式下运行您的项目：

```bash icon=mdi:console
aigne run --chat
```

聊天会话开始后，让 AI 使用您的新工具。例如：

```
> 使用 greeter 技能向世界问好。
```

AI 将识别该请求，根据描述找到 `greeter` 技能，并使用正确的参数执行它。然后，它将使用您技能的输出来构建其响应。

### 后续步骤

恭喜！您已成功创建了一个自定义 JavaScript Agent，将其作为技能集成，并测试了其功能。现在您可以构建更复杂的 Agent 来连接 API、管理文件或执行任何您可以用脚本实现的其他任务。

要了解如何与他人共享您的项目，请查看我们的[部署 Agent](./guides-deploying-agents.md) 指南。