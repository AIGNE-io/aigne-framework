---
labels: ["Reference"]
---

# aigne deploy

`aigne deploy` 命令会将你的 AIGNE 应用程序打包并作为 [Blocklet](https://www.blocklet.dev/) 部署到指定的 Blocklet Server 端点。这是将你的 agent 发布用于生产环境的标准方式，使其可以作为独立的、可执行的服务进行访问。

## 用法

```bash Basic Usage icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## 选项

<x-field data-name="--path" data-type="string" data-required="true" data-desc="指定包含 aigne.yaml 文件的 AIGNE 项目目录的路径。"></x-field>

<x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="应用程序将部署到的 Blocklet Server 端点的 URL。"></x-field>

## 部署流程

`deploy` 命令会自动执行多个步骤，以正确打包你的 agent 并将其部署到目标环境。对于一个给定的项目，首次运行时该过程是交互式的，而后续更新则是非交互式的。

```d2 Deployment Workflow
direction: down

Developer: { 
  shape: c4-person 
}

CLI: {
  label: "`aigne deploy`"
  
  task-1: { label: "1. 准备环境" }
  task-2: { label: "2. 检查 Blocklet CLI" }
  task-3: { label: "3. 配置 Blocklet\n(名称和 DID)" }
  task-4: { label: "4. 打包项目" }
  task-5: { label: "5. 部署到服务器" }

  task-1 -> task-2 -> task-3 -> task-4 -> task-5
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "已部署的 Agent\n(作为 Blocklet)"
}

Developer -> CLI: "使用路径和端点运行命令"
CLI.task-5 -> Blocklet-Server: "上传打包文件"
Blocklet-Server -> Deployed-Blocklet: "托管 agent"
```

以下是运行该命令时发生情况的逐步分解：

1.  **环境准备**：在你的项目根目录中创建一个临时的 `.deploy` 目录。该命令会将你的 agent 的源文件和一个标准的 Blocklet 模板复制到此目录中，为打包做准备。

2.  **依赖安装**：如果存在 `package.json` 文件，它将在临时目录中运行 `npm install` 来获取所有必要的依赖项。

3.  **Blocklet CLI 检查**：该命令会验证 `@blocklet/cli` 是否已全局安装。如果缺失，系统将提示你自动安装，因为打包和部署 Blocklet 需要它。

4.  **配置（首次部署）**：在首次部署项目时，CLI 将引导你完成一个简短的交互式设置：
    *   **Blocklet 名称**：系统会要求你为 Blocklet 提供一个名称。它会根据 `aigne.yaml` 中的 `name` 字段或项目目录名建议一个默认名称。
    *   **DID 生成**：系统会使用 `blocklet create --did-only` 为你的 Blocklet 自动生成一个新的去中心化标识符（DID），赋予其一个唯一的、可验证的身份。
    *   此配置（名称和 DID）会保存在本地的 `~/.aigne/deployed.yaml` 中。对于同一项目的后续部署，将自动使用这些保存的值，从而使过程变为非交互式。

5.  **打包**：CLI 执行 `blocklet bundle --create-release`，将你所有的应用程序文件打包成一个单一的、可部署的工件。

6.  **部署**：最终的打包文件将使用 `blocklet deploy` 上传到你指定的 `--endpoint`。

7.  **清理**：成功部署后，临时的 `.deploy` 目录会被自动删除。

## 示例

要将位于当前目录的 AIGNE 项目部署到你的 Blocklet Server：

```bash Deploying a project icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

如果这是你第一次部署此项目，你将看到一个提示，要求你为 agent Blocklet 命名：

```text First-time deployment prompt
✔ 准备部署环境
✔ 检查 Blocklet CLI
ℹ 配置 Blocklet
? 请输入 agent blocklet 名称: › my-awesome-agent
✔ 打包 Blocklet
...
✅ 部署完成: /path/to/your/project -> https://my-node.abtnode.com
```

有关设置部署目标和管理已部署 agent 的更详细演练，请参阅 [部署 Agents](./guides-deploying-agents.md) 指南。