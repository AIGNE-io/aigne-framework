---
labels: ["Reference"]
---

# aigne create

`aigne create` 命令通过模板构建一个新的 AIGNE 项目。它会设置必要的目录结构和配置文件，让你能立即开始开发你的 agent。

## 用法

要在新目录中创建项目，请提供一个路径作为参数：

```bash
# 在 'my-aigne-project' 目录中创建一个项目
aigne create my-aigne-project
```

如果你在运行命令时未提供路径参数，它将提示你输入项目名称，并在当前位置的新子目录中创建项目。

```bash
# 在当前工作目录中创建一个项目（交互式）
aigne create
```

## 交互过程

当你运行 `aigne create` 时未提供路径，或者目标目录已包含文件时，CLI 将引导你完成一个交互过程。

1.  **项目名称**：如果你未指定路径，系统将提示你输入项目名称。默认值为 `my-aigne-project`。

    ![AIGNE CLI 在创建过程中提示输入项目名称。](../assets/create/create-project-interactive-project-name-prompt.png)

2.  **覆盖确认**：如果目标目录存在且不为空，CLI 将请求确认后再继续，以避免意外丢失数据。

    ```bash
    ? The directory "/path/to/your/my-aigne-project" is not empty. Do you want to remove its contents? › (y/N)
    ```

3.  **模板选择**：系统将要求你选择一个项目模板。目前提供一个 `default` 模板。

    ```bash
    ? Select a template: › - Use arrow-keys. Return to submit.
    ❯   default
    ```

## 参数

| 参数 | 描述 |
| :------- | :------------------------------------------- |
| `[path]` | 可选。将创建项目目录的路径。默认为当前目录（`.`），如果未提供，则提示输入项目名称。 |

## 命令流程

下图展示了 `aigne create` 命令的流程。

```d2
direction: down

"start": "开始：aigne create"
"path_provided": "是否提供路径？"
"prompt_name": "提示输入项目名称"
"set_path": "设置项目路径"
"check_empty": "目录是否非空？"
"prompt_overwrite": "提示是否覆盖？"
"cancel": "取消操作"
"select_template": "选择模板"
"create_files": "创建目录并复制文件"
"success_msg": "显示成功消息"
"end": "结束"

start -> path_provided

path_provided -- "No" --> prompt_name
prompt_name -> set_path
path_provided -- "Yes" --> set_path

set_path -> check_empty
check_empty -- "Yes" --> prompt_overwrite
check_empty -- "No" --> select_template

prompt_overwrite -- "No" --> cancel
prompt_overwrite -- "Yes" --> select_template

select_template -> create_files
create_files -> success_msg

success_msg -> end
cancel -> end
```

## 输出

成功创建后，CLI 会打印一条确认消息，并提供运行你的 agent 的下一步命令。

![AIGNE CLI 创建项目后的成功消息。](../assets/create/create-project-using-default-template-success-message.png)

创建项目后，你可以进入新目录并使用 `aigne run` 命令来启动 agent。

有关运行 agent 的更多详细信息，请参阅 [aigne run](./command-reference-run.md) 命令参考。