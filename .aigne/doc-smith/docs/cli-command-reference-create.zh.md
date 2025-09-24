# create

`aigne create` 命令是您构建新 AI agent 的起点。它会自动为您生成一个完整的项目结构，包括所有必要的配置文件和文件夹，以便您可以立即开始开发 agent 的技能。

## 用法

要创建一个新项目，请在您的终端中运行 `create` 命令。您可以直接指定一个文件夹名称，或者不带任何参数运行该命令，以通过交互式设置进行引导。

```bash 基本用法 icon=material-symbols:terminal
aigne create [path]
```

## 参数

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="false" data-desc="将创建项目的文件夹名称。如果省略此项，CLI 将会询问您项目名称。"></x-field>
</x-field-group>

## 交互式设置

当您运行该命令时，它将引导您通过几个简单的问题来设置您的项目：

1.  **项目名称**：如果您没有提供路径，它会首先询问您的项目名称。这也将是它创建的文件夹的名称。
2.  **模板选择**：系统会要求您选择一个项目模板。对于大多数情况，`default` 模板是完美的起点。
3.  **目录非空**：如果目标文件夹已存在且包含文件，该命令在继续操作前会请求您的确认，以避免意外覆盖您的工作。

## 示例

### 在新文件夹中创建项目

这是最常见的开始方式。此命令将创建一个名为 `my-first-agent` 的新文件夹，并在其中设置项目。

```bash icon=material-symbols:terminal
aigne create my-first-agent
```

运行命令后，您将看到一条成功消息：

```text Output
✅ AIGNE 项目创建成功！

要使用您的新 agent，请运行：
  cd my-first-agent && aigne run
```

### 在当前文件夹中创建项目

如果您已经位于要创建项目的文件夹内，可以不带任何参数运行该命令。

```bash icon=material-symbols:terminal
aigne create
```

然后，CLI 将以交互方式提示您输入项目名称。

```text Interactive Prompt
? 项目名称： (my-aigne-project)
```

## 后续步骤

项目创建后，下一步是与您的 agent 开始对话。请进入您的新项目目录，并使用 [run 命令](./cli-command-reference-run.md) 来启动它。