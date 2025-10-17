---
labels: ["Reference"]
---

# 部署 Agent

部署您的 AIGNE 项目会将其从本地开发设置转变为一个独立的、可分发的应用程序，称为 Blocklet。这使您的 Agent 能够在生产环境中运行，与他人共享，并无缝集成到更广泛的 Blocklet 生态系统中。`aigne deploy` 命令会自动完成整个打包和部署过程。

本指南将引导您完成部署工作流程。有关所有可用命令选项的详细分解，请参阅 [`aigne deploy` 命令参考](./command-reference-deploy.md)。

## 部署流程

`aigne deploy` 命令协调一系列步骤来准备、配置、打包和部署您的 Agent。它在底层利用 `@blocklet/cli` 来处理创建 Blocklet 的复杂性。

以下是部署流程的高级概述：

```d2
direction: down

Developer: {
  shape: c4-person
  label: "开发者"
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Blocklet-CLI: {
  label: "Blocklet CLI"
}

Deployment-Endpoint: {
  label: "部署端点"
  shape: cylinder
}

Local-Project: {
  label: "您的 AIGNE 项目"
  shape: rectangle
  aigne-yaml: {
    label: "aigne.yaml"
  }
  source-code: {
    label: "源代码"
  }
}

Developer -> AIGNE-CLI: "1. 运行 `aigne deploy`"
AIGNE-CLI -> Local-Project.aigne-yaml: "2. 读取项目配置"
AIGNE-CLI -> AIGNE-CLI: "3. 准备临时 .deploy 目录"
AIGNE-CLI -> Blocklet-CLI: "4. 检查 CLI / 提示安装"
AIGNE-CLI -> Developer: "5. 提示输入 Blocklet 名称"
Developer -> AIGNE-CLI: "6. 提供名称"
AIGNE-CLI -> Blocklet-CLI: "7. 创建 Blocklet DID"
Blocklet-CLI -> AIGNE-CLI: "8. 返回 DID"
AIGNE-CLI -> AIGNE-CLI: "9. 配置 blocklet.yml"
AIGNE-CLI -> Blocklet-CLI: "10. 打包项目"
Blocklet-CLI -> Deployment-Endpoint: "11. 部署打包文件"
AIGNE-CLI -> Developer: "12. 显示成功消息"

```

### 分步指南

要部署您的项目，请导航到项目的根目录并运行部署命令，指定您的项目路径和目标端点。

```bash Command icon=lucide:terminal
aigne deploy --path . --endpoint <your-endpoint-url>
```

让我们分解一下执行此命令时会发生什么：

1.  **环境准备**：CLI 首先创建一个临时的 `.deploy` 目录。它将您的项目文件以及一个标准的 Blocklet 模板复制到其中。然后，它在此目录中运行 `npm install` 以获取任何必要的依赖项。

2.  **Blocklet CLI 检查**：该过程会验证您的系统上是否安装了 `@blocklet/cli`。如果未安装，它将提示您授予全局安装的权限。这是一次性设置。

    ```
    ? Install Blocklet CLI? ›
    ❯ yes
      no
    ```

3.  **Blocklet 配置（首次部署）**：如果这是您第一次部署此项目，CLI 将要求您为 Blocklet 命名。它会根据您在 `aigne.yaml` 中的 Agent 名称或项目文件夹名称建议一个默认名称。

    ```
    ? Please input agent blocklet name: › my-awesome-agent
    ```

    在您提供名称后，它会自动为您的 Blocklet 生成一个新的去中心化标识符 (DID)。此名称和 DID 将保存在本地的 `~/.aigne/deployed.yaml` 中，因此在同一项目的后续部署中不会再次提示您输入。

4.  **打包**：然后，CLI 会调用 `blocklet bundle --create-release`，它会将您的 Agent、其依赖项以及所有必要的配置打包成一个单一的可部署文件 `.blocklet/bundle`。

5.  **部署**：最后，使用 `blocklet deploy` 命令将打包好的应用程序推送到您指定的 `--endpoint`。

该过程完成后，您将在终端中看到一条确认消息。

```
✅ 部署完成：/path/to/your/project -> <your-endpoint-url>
```

您的 AIGNE Agent 现在已作为 Blocklet 上线，准备在生产环境中运行。
