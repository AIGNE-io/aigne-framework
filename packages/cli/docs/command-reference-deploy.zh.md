---
labels: ["Reference"]
---

# aigne deploy

`aigne deploy` 命令将 AIGNE 应用程序打包并作为 Blocklet 部署到指定端点。该过程会自动执行在生产环境中运行 Agent 所需的配置、打包和部署步骤。

## 用法

```bash
aigne deploy --path <path-to-project> --endpoint <blocklet-server-endpoint>
```

## 选项

| 选项 | 描述 | 是否必需 |
|------------|------------------------------------------------------------------------------|----------|
| `--path` | 要部署的 AIGNE 项目目录的文件路径。 | 是 |
| `--endpoint` | 应用程序将部署到的 Blocklet Server 端点的 URL。 | 是 |

## 部署流程

运行 `aigne deploy` 时，CLI 会执行一系列自动化任务来准备和上传你的应用程序。该流程在首次运行时为交互式，在后续部署中则完全自动化。

```d2
direction: down

"start": "aigne deploy"
"prepare": "1. 准备环境\n(在 .deploy 文件夹中)"
"install_deps": "2. 安装依赖\n(npm install)"
"check_cli": {
  shape: diamond
  label: "3. Blocklet CLI\n是否已安装？"
}
"prompt_install": "提示用户安装"
"install_cli": "安装 @blocklet/cli"
"configure": "4. 配置 blocklet.yml\n(名称和 DID)"
"bundle": "5. 打包应用程序\n(blocklet bundle)"
"deploy": "6. 部署到端点\n(blocklet deploy)"
"cleanup": "7. 清理\n(删除 .deploy)"
"end": "部署完成"

start -> prepare -> install_deps -> check_cli
check_cli -> "是": configure
check_cli -> "否": prompt_install -> install_cli -> configure
configure -> bundle -> deploy -> cleanup -> end
```

以下是涉及的步骤分解：

1.  **准备环境**：CLI 会在你的项目根目录下创建一个临时的 `.deploy` 目录。你的 Agent 文件和一个标准的 Blocklet 模板会被复制到该目录中。如果你的项目中存在 `package.json` 文件，CLI 会自动在该临时目录中运行 `npm install`。

2.  **检查 Blocklet CLI**：该命令会验证 `@blocklet/cli` 是否已全局安装。如果未安装，它会提示你授权安装，因为打包和部署过程需要该工具。

3.  **配置 Blocklet**：`.deploy` 目录中的 `blocklet.yml` 配置文件会自动填充。
    *   **名称**：首次部署项目时，CLI 会提示你为 Blocklet 输入一个名称。默认建议名称取自 `aigne.yaml` 文件中的 `name` 字段。此选定名称将被保存以供未来部署使用。
    *   **DID**：CLI 会使用 Blocklet CLI 为你的 Blocklet 创建一个唯一的去中心化身份（DID）。该 DID 也会被保存并在后续部署中重用。
    *   每个项目的部署信息（名称和 DID）都存储在 `~/.aigne/deployed.yaml` 中，并与项目的绝对路径映射，以简化未来的更新。

4.  **打包应用程序**：它会执行 `blocklet bundle --create-release` 命令，将所有必要文件打包到一个 `.blocklet/bundle` 目录下的可部署构件中。

5.  **部署到端点**：最后，它会运行 `blocklet deploy` 将打包好的构件推送到指定的 `--endpoint`。底层命令的输出会直接流式传输到你的终端，以便你监控进度。

6.  **清理**：部署成功后，临时的 `.deploy` 目录会被删除。

## 示例

将位于 `my-chat-agent` 目录中的 AIGNE 项目部署到 `https://my-node.blocklet.dev` 上的 Blocklet Server：

```bash
aigne deploy --path ./my-chat-agent --endpoint https://my-node.blocklet.dev
```

在首次运行时，系统可能会要求你输入信息：

```bash
? 请输入 Agent Blocklet 名称: (my-chat-agent) my-production-chat-agent
```

输入名称并完成流程后，后续运行相同命令时将自动重用 `my-production-chat-agent`。

---

如需更详细的 Agent 部署演练，请参阅 [部署 Agent](./guides-deploying-agents.md) 指南。