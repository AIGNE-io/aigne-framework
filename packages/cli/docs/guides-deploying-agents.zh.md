---
labels: ["Reference"]
---

# 部署 Agent

你可以将你的 AIGNE 项目打包并部署为一个 Blocklet，这是一种在 Blocklet Server 上运行的自包含应用程序格式。本指南将引导你使用 `aigne deploy` 命令来准备、配置和发布你的 Agent 以供生产使用。

有关 deploy 命令所有可用选项的详细说明，请参阅 [aigne deploy 命令参考](./command-reference-deploy.md)。

## 前提条件

在开始之前，请确保你已具备以下条件：

- 一个包含 `aigne.yaml` 文件的现有 AIGNE 项目。
- 你拥有部署权限的目标 Blocklet Server 端点的 URL。
- Blocklet CLI (`@blocklet/cli`)。如果你尚未安装，部署过程将提示你进行安装。

## 部署命令

部署的主要工具是 `aigne deploy` 命令。其基本语法要求指定项目路径和目标端点。

```bash
aigne deploy --path <project-path> --endpoint <deployment-endpoint>
```

**参数**

| 参数 | 说明 |
|---|---|
| `--path` | 必需。你的 AIGNE 项目目录的本地路径。 |
| `--endpoint` | 必需。要部署到的 Blocklet Server 的 URL。 |

## 部署工作流

当你运行 `aigne deploy` 时，CLI 会执行一系列自动化步骤来打包和发布你的 Agent。对于新项目，首次运行该过程是交互式的；对于后续更新，该过程是非交互式的。下图说明了高级工作流程。

```d2
direction: down

"start": "开始: aigne deploy" {
  shape: oval
}

"cli_check": "检查 Blocklet CLI" {
  shape: diamond
}

"prompt_install": "提示安装 CLI" {
  shape: parallelogram
}

"install_cli": "全局安装 @blocklet/cli" {
  style.animated: true
}

"prep_env": {
  label: "准备构建环境"
  shape: package
  grid-columns: 1

  "copy_files": "复制项目和模板文件"
  "npm_install": "运行 npm install"
}

"config_check": "在 ~/.aigne/deployed.yaml 中是否存在已保存的配置？" {
  shape: diamond
}

"interactive_setup": {
  label: "首次设置"
  shape: package
  grid-columns: 1

  "prompt_name": "提示输入 Blocklet 名称"
  "gen_did": "生成新的 DID"
  "save_config": "将名称和 DID 保存到配置文件"
}


"update_yml": "使用名称和 DID 更新 blocklet.yml"
"bundle": "将项目打包成 Blocklet"
"deploy": "将包部署到端点"
"cleanup": "清理临时目录"

"success": "✅ 部署成功" {
  shape: oval
  style.fill: "#D4EDDA"
}

"failure": "❌ 部署失败" {
  shape: oval
  style.fill: "#F8D7DA"
}

start -> cli_check
cli_check -> prompt_install: "未找到"
cli_check -> prep_env: "已找到"
prompt_install -> install_cli: "用户同意"
install_cli -> prep_env

prep_env -> config_check

config_check -> interactive_setup: "否"
config_check -> update_yml: "是"

interactive_setup -> update_yml

update_yml -> bundle -> deploy -> cleanup -> success

# Error paths
prompt_install -> failure: "用户拒绝"
deploy -> failure: "错误"
bundle -> failure: "错误"
```

### 分步指南

1.  **启动部署**

    在你的项目根目录中，执行 `deploy` 命令。对于当前目录中的项目，你可以使用 `.` 作为路径。

    ```bash
    aigne deploy --path . --endpoint https://my-blocklet-server.com
    ```

2.  **首次配置（交互式）**

    如果这是你首次从你的计算机部署此特定项目，CLI 将引导你完成一次性设置：

    -   **Blocklet CLI 安装**：如果在你的环境中未找到 `@blocklet/cli`，系统将提示你进行全局安装。
    -   **Blocklet 名称**：系统将要求你为你的 Agent Blocklet 提供一个名称。此名称将在 Blocklet Server 上使用。系统会根据你的项目文件夹或 `aigne.yaml` 配置建议一个默认名称，你可以接受或覆盖该名称。

3.  **打包和发布**

    然后，CLI 将继续执行工作流图中所示的自动化任务：准备文件、打包应用程序并将其上传到指定端点。你将在终端中看到每个主要步骤的进度指示器。

4.  **后续部署**

    首次成功部署后，CLI 会将你选择的 Blocklet 名称及其唯一的 DID (Decentralized Identifier) 保存到位于 `~/.aigne/deployed.yaml` 的配置文件中。对于同一项目（通过其绝对路径识别）的所有未来部署，CLI 将使用此已保存的信息，从而使该过程非交互式，并适用于 CI/CD 管道。

完成后，一条成功消息将确认部署已完成。

```bash
✅ 部署完成: /path/to/your/project -> https://my-blocklet-server.com
```

如果该过程失败，将显示一条错误消息，指出失败原因以帮助诊断问题。