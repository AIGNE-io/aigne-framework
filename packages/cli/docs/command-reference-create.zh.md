---
labels: ["Reference"]
---

# aigne create

`aigne create` 命令从模板搭建一个新的 AIGNE 项目。它会设置必要的目录结构和配置文件，让你可以立即开始开发你的 Agent。

## 用法

```bash 基本用法 icon=lucide:terminal
aigne create [path]
```

## 参数

<x-field data-name="path" data-type="string" data-default="." data-required="false" data-desc="创建新项目目录的路径。如果省略，则默认为当前目录，并会触发交互模式提示输入项目名称。"></x-field>

## 交互模式

如果你在运行 `aigne create` 时未指定路径，或使用 `.` 表示当前目录，CLI 将进入交互模式引导你完成设置过程。系统将提示你输入以下信息：

*   **项目名称**：新项目目录的名称。
*   **模板**：要使用的项目模板。目前，只有一个 `default` 模板可用。

![项目名称的交互式提示](../assets/create/create-project-interactive-project-name-prompt.png)

### 覆盖确认

为安全起见，如果目标目录已存在且不为空，CLI 在继续删除其内容前会请求你的确认。如果你选择不继续，操作将被安全地取消。

```text 确认提示
? The directory "/path/to/my-aigne-project" is not empty. Do you want to remove its contents? (y/N)
```

## 示例

### 交互式创建项目

要通过引导完成创建过程，请不带任何参数运行该命令。CLI 将提示你输入项目名称。

```bash 在当前目录中创建 icon=lucide:terminal
aigne create
```

### 在特定目录中创建项目

要在名为 `my-awesome-agent` 的新目录中创建项目，请将该名称作为参数提供。

```bash 在新的 'my-awesome-agent' 目录中创建 icon=lucide:terminal
aigne create my-awesome-agent
```

此命令会创建 `my-awesome-agent` 目录并在其中搭建项目。你仍将被提示选择一个模板。

## 成功输出

成功创建后，你将看到一条确认消息以及运行新 Agent 的后续步骤说明。

![项目创建成功消息](../assets/create/create-project-using-default-template-success-message.png)

---

创建项目后，下一步是执行你的 Agent。有关更多详细信息，请参阅 [`aigne run`](./command-reference-run.md) 命令参考。
