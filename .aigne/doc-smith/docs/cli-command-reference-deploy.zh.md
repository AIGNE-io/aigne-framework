# deploy

使用 `deploy` 命令将您的 Agent 应用程序打包并发布到指定的端点。该命令简化了将本地 AIGNE 项目转变为可部署应用程序的过程，利用 Blocklet 生态系统进行打包和分发。

## 用法

```bash
aigne deploy --path <path_to_agent_project> --endpoint <deployment_url>
```

## 选项

<x-field-group>
  <x-field data-name="--path" data-type="string" data-required="true">
    <x-field-desc markdown>您的 AIGNE Agent 项目目录的路径。可以是绝对路径，也可以是相对于当前工作目录的相对路径。</x-field-desc>
  </x-field>
  <x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="将部署 Agent 的 Blocklet Server 或类似服务的 URL。"></x-field>
</x-field-group>

## 工作原理

`deploy` 命令会自动执行多个步骤来准备和发布您的 Agent。它实质上是将您的 AIGNE Agent 包装在一个标准化的包格式 Blocklet 中，并使用 `@blocklet/cli` 来处理部署。

以下是部署流程的高级概述：

```d2 部署流程 icon=mdi:rocket-launch
direction: down

开发者: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Agent-Project: {
  label: "您的 Agent 项目"
  shape: rectangle
}

Blocklet-CLI: {
  label: "@blocklet/cli"
}

Deployment-Endpoint: {
  label: "部署端点"
  shape: cylinder
}

开发者 -> AIGNE-CLI: "1. aigne deploy"
AIGNE-CLI -> Agent-Project: "2. 读取项目文件"
AIGNE-CLI -> AIGNE-CLI: "3. 准备临时 .deploy 目录"
AIGNE-CLI -> Blocklet-CLI: "4. 配置并创建 DID"
AIGNE-CLI -> Blocklet-CLI: "5. 将 Agent 打包为 Blocklet"
AIGNE-CLI -> Blocklet-CLI: "6. 部署包"
Blocklet-CLI -> Deployment-Endpoint: "7. 推送包"
Deployment-Endpoint -> Blocklet-CLI: "8. 确认部署"
Blocklet-CLI -> AIGNE-CLI: "9. 报告成功"
AIGNE-CLI -> AIGNE-CLI: "10. 清理临时目录"
AIGNE-CLI -> 开发者: "11. 显示成功消息"
```

该过程的关键阶段包括：

1.  **环境准备**：在您的项目文件夹中创建一个临时的 `.deploy` 目录。您的 Agent 代码和必要的 Blocklet 模板文件将被复制到其中。
2.  **依赖检查**：该命令会检查 `@blocklet/cli` 是否已全局安装。如果未安装，它将提示您授权安装，因为这是打包和部署所必需的。
3.  **配置**：该命令读取您的 `aigne.yaml` 文件以获取 Agent 的名称。然后它会配置一个 `blocklet.yml` 文件，如果这是首次部署，则为您的应用程序创建一个唯一的 DID（去中心化 ID）。此信息将存储在您本地的 `~/.aigne` 目录中以备将来使用。
4.  **打包**：它调用 `blocklet bundle` 将您的应用程序及其依赖项打包成一个单一的可部署文件。
5.  **部署**：最后，它调用 `blocklet deploy` 将打包好的应用程序推送到指定的 `--endpoint`。
6.  **清理**：成功部署后，临时的 `.deploy` 目录将被删除。

## 示例

将位于 `my-story-agent` 目录中的 Agent 部署到您的 Blocklet Server 实例。

```bash
aigne deploy --path ./my-story-agent --endpoint https://my-server.did.abtnet.io
```

运行该命令后，您将在终端中看到一系列任务正在执行。如果这是您第一次部署此 Agent，系统可能会提示您为 Blocklet 提供一个名称。

```
✔ 准备部署环境
✔ 检查 Blocklet CLI
✔ 配置 Blocklet
✔ 打包 Blocklet

... (来自 blocklet deploy 的输出) ...

✅ 部署完成：/path/to/my-story-agent -> https://my-server.did.abtnet.io
```