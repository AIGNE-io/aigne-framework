---
labels: ["Reference"]
---

# aigne deploy

`aigne deploy` 命令会将您的 AIGNE 应用程序打包并作为 [Blocklet](https://www.blocklet.dev/) 部署到指定的 Blocklet Server 端点。这是为生产环境发布 Agent 的标准方式，使其可以作为自包含、可执行的服务进行访问。

## 用法

```bash Basic Usage icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## 选项

| 选项 | 描述 | 是否必需 |
| --- | --- | --- |
| `--path <string>` | 指定包含 `aigne.yaml` 文件的 AIGNE 项目目录的路径。 | 是 |
| `--endpoint <string>` | 将要部署应用的 Blocklet Server 端点的 URL。 | 是 |

## 部署过程

`deploy` 命令自动化了几个步骤，以确保您的 Agent 被正确打包并部署到目标环境。该过程设计为在首次运行时是交互式的，在后续更新中是非交互式的。

```d2 Deployment Workflow
direction: down

Developer: { 
  shape: c4-person 
}

AIGNE-Project: {
  label: "本地 AIGNE 项目"
  shape: rectangle
}

CLI: {
  label: "`aigne deploy`"
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "已部署的 Agent\n（作为 Blocklet）"
}

Developer -> CLI: "1. 使用路径和端点运行命令"
CLI -> AIGNE-Project: "2. 准备和打包"
CLI -> Blocklet-Server: "3. 部署捆绑包"
Blocklet-Server -> Deployed-Blocklet: "4. 托管 Agent"
```

以下是运行该命令时发生情况的分步解析：

1.  **环境准备**：一个临时的 `.deploy` 目录会在您的项目根目录中被创建。该命令会将您的 Agent 源文件和标准的 Blocklet 模板复制到此目录中。

2.  **依赖安装**：它会在临时目录中运行 `npm install`，以获取您项目 `package.json` 中列出的所有必要依赖。

3.  **Blocklet CLI 检查**：该命令会验证 `@blocklet/cli` 是否已全局安装。如果缺失，系统将提示您自动安装它，因为打包和部署 Blocklet 需要它。

4.  **配置（首次部署）**：在项目的首次部署时，CLI 将引导您完成一个简短的交互式设置过程：
    *   **Blocklet 名称**：您将被要求为您的 Blocklet 提供一个名称。它会根据您 `aigne.yaml` 中的 `name` 字段或项目目录名建议一个默认名称。
    *   **DID 生成**：一个新的去中心化身份标识（DID）会为您的 Blocklet 自动生成，赋予其一个独特、可验证的身份。
    *   此配置（名称和 DID）会保存在本地的 `~/.aigne/deployed.yaml` 文件中。对于同一项目的后续部署，将使用这些已保存的值，从而使过程变为非交互式。

5.  **打包**：CLI 执行 `blocklet bundle --create-release`，将您的所有应用文件打包成一个单一、可部署的工件。

6.  **部署**：最终的捆绑包会被上传到您指定的 `--endpoint`。

7.  **清理**：成功部署后，临时的 `.deploy` 目录会自动被移除。

## 示例

要将位于当前目录的 AIGNE 项目部署到您的 Blocklet Server：

```bash Deploying a project icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

如果这是您第一次部署此项目，您将看到一个提示，要求您为 Agent Blocklet 命名：

```text First-time deployment prompt
✔ 准备部署环境
✔ 检查 Blocklet CLI
ℹ 配置 Blocklet
? 请输入 Agent Blocklet 名称: › my-awesome-agent
✔ 打包 Blocklet
...
✅ 部署完成: /path/to/your/project -> https://my-node.abtnode.com
```

有关设置部署目标和管理已部署 Agent 的更详细演练，请参阅 [部署 Agent](./guides-deploying-agents.md) 指南。