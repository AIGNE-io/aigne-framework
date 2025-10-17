---
labels: ["Reference"]
---

# aigne create

`aigne create` 命令从模板中搭建一个新的 AIGNE 项目。它会设置必要的目录结构和配置文件，让您可以立即开始开发您的 agent。

## 用法

```bash 基本用法 icon=lucide:terminal
aigne create [path]
```

## 参数

<x-field data-name="path" data-type="string" data-default="." data-required="false" data-desc="新项目目录的创建路径。如果省略，默认为当前目录，并会触发交互模式提示输入项目名称。"></x-field>

## 交互模式

如果您在运行 `aigne create` 时未指定路径，或使用 `.` 表示当前目录，CLI 将进入交互模式以引导您完成设置过程。系统将提示您输入以下信息：

*   **项目名称**：新项目目录的名称。
*   **模板**：要使用的项目模板。目前，只有一个 `default` 模板可用。

![项目名称的交互式提示](../assets/create/create-project-interactive-project-name-prompt.png)

### 覆盖确认

为安全起见，如果目标目录已存在且不为空，CLI 在继续删除其内容之前会请求您的确认。如果您选择不继续，操作将被安全取消。

```text 确认提示
? 目录 "/path/to/my-aigne-project" 不为空。您想删除其内容吗？ (y/N)
```

## 示例

### 以交互方式创建项目

如需引导完成创建过程，请不带任何参数运行该命令。CLI 将提示您输入项目名称。

```bash 在当前目录中创建 icon=lucide:terminal
aigne create
```

### 在特定目录中创建项目

要在名为 `my-awesome-agent` 的新目录中创建项目，请将该名称作为参数提供。

```bash 在新的 'my-awesome-agent' 目录中创建 icon=lucide:terminal
aigne create my-awesome-agent
```

此命令会创建 `my-awesome-agent` 目录并在其中搭建项目。系统仍会提示您选择模板。

## 成功输出

成功创建后，您将看到一条确认消息以及运行新 agent 的后续步骤说明。

![项目创建成功消息](../assets/create/create-project-using-default-template-success-message.png)

---

创建项目后，下一步是执行您的 agent。更多详情，请参阅 [`aigne run`](./command-reference-run.md) 命令参考。
