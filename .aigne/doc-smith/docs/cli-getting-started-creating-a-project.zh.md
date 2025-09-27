# 创建项目

AIGNE 项目是一个文件夹，其中包含了你的 AI agent 所需的所有文件。这包括其配置、个性以及可能具备的任何特殊技能。最简单的入门方法是使用 `aigne create` 命令，该命令会为你设置一个开箱即用的项目结构。

## `create` 命令

该命令会初始化一个新目录，其中包含了你的 agent 运行所需的所有基本文件。你可以通过两种方式运行它。

1.  **交互模式**：只需运行不带任何参数的命令，它就会引导你完成整个过程。
2.  **直接模式**：在命令后直接指定文件夹名称。

让我们详细了解一下交互模式，它非常适合初学者。

### 分步指南

1.  **运行创建命令**

    打开你的终端或命令提示符，键入以下命令，然后按 Enter 键。

    ```bash
    aigne create
    ```

2.  **输入项目名称**

    CLI 将提示你为项目命名。该名称也将作为其创建的文件夹的名称。我们将其命名为 `my-first-agent`。

    ```text
    ? Project name: my-first-agent
    ```

3.  **选择模板**

    接下来，系统会要求你选择一个模板。目前，你只需要 `default` 模板。只需按 Enter 键即可继续。

    ```text
    ? Select a template: (Use arrow keys)
    ❯ default
    ```

完成这些步骤后，CLI 将创建项目文件夹和文件。你应该会看到一条成功消息，确认一切设置完毕。

```text
✅ AIGNE project created successfully!

To use your new agent, run:
  cd my-first-agent && aigne run
```

### 项目包含哪些内容？

`create` 命令会在你的新项目文件夹中生成一些关键文件。下面简要介绍它们的作用：

| File             | Description                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `aigne.yaml`     | 主配置文件。它告诉 AIGNE 使用哪个 AI 模型，并列出项目中的所有 agent 和技能。 |
| `chat.yaml`      | 定义你的 agent 的个性。你可以在此文件中编写其指令并定义其核心行为。       |
| `sandbox.js`     | 一个“技能”的示例。技能是 agent 可以使用的工具。这个技能允许它评估 JavaScript 代码。      |
| `filesystem.yaml`| 一项技能，使 agent 能够与你计算机上的文件进行交互。                                  |


项目创建完成后，你现在就可以让你的 agent 焕发生机了。

### 后续步骤

现在你已经有了一个项目，下一步是开始与你的 agent 对话。

- [运行 Agent](./cli-getting-started-running-an-agent.md)
