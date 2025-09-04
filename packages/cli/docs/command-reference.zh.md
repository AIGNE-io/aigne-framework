---
labels: ["Reference"]
---

# 命令参考

本节提供了所有 `@aigne/cli` 命令的详细参考。CLI 是你创建、运行、测试和管理 AIGNE 项目的主要工具。每个命令都在其各自的页面上有详细的文档，包含全面的示例和参数说明。

## 命令概述

`aigne` 命令行工具分为几个子命令，每个子命令负责 Agent 开发生命周期的特定阶段。

```d2
direction: down

aigne: {
  label: "aigne"
  shape: hexagon
}

Development: {
  shape: package
  grid-columns: 3
  create: { label: "create" }
  run: { label: "run" }
  test: { label: "test" }
}

Integration: {
  shape: package
  grid-columns: 2
  serve-mcp: { label: "serve-mcp" }
  observe: { label: "observe" }
}

Platform: {
  shape: package
  grid-columns: 2
  hub: { label: "hub" }
  deploy: { label: "deploy" }
}

Built-in-Apps: {
  label: "内置应用"
  shape: package
  app: { label: "app" }
}

aigne -> Development
aigne -> Integration
aigne -> Platform
aigne -> Built-in-Apps
```

以下是主要命令的摘要。选择一个命令以查看其详细文档，包括所有可用选项和使用示例。

| 命令                                                      | 描述                                                                                                          | 预览                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`aigne create`](./command-reference-create.md)               | 根据模板搭建一个新的 AIGNE 项目。                                                                             | ![使用默认模板创建项目](../assets/create/create-project-using-default-template-success-message.png)          |
| [`aigne run`](./command-reference-run.md)                     | 在本地或从远程 URL 执行一个 Agent，并提供聊天模式、模型选择和输入处理等选项。                                     | ![在聊天模式下运行项目](../assets/run/run-default-template-project-in-chat-mode.png)                           |
| [`aigne serve-mcp`](./command-reference-serve-mcp.md)         | 将多个 Agent 作为模型上下文协议 (MCP) 服务器提供服务，以便与外部系统集成。                                        | ![运行 MCP 服务器](../assets/run-mcp-service.png)                                                            |
| [`aigne hub`](./command-reference-hub.md)                     | 管理与 AIGNE Hub 的连接，允许你切换账户、检查状态以及使用 Hub 提供的模型。                                        |                                                                                                              |
| [`aigne observe`](./command-reference-observe.md)             | 启动一个本地服务器，用于查看和分析 Agent 执行轨迹和可观察性数据。                                               | ![在可观察性 UI 中查看调用详情](../assets/observe/observe-view-call-details.png)                             |
| [`aigne test`](./command-reference-test.md)                   | 为你的 Agent 和技能运行自动化测试。                                                                           |                                                                                                              |
| [`aigne deploy`](./command-reference-deploy.md)               | 将 AIGNE 应用程序作为 Blocklet 部署到指定端点。                                                               |                                                                                                              |
| [`aigne app`](./command-reference-built-in-apps.md)           | 执行像 `doc-smith` 这样的预打包应用程序，以实现专门的、开箱即用的 Agent 功能。                                  |                                                                                                              |

## 全局选项

这些选项可用于任何命令：

| 选项        | 别名 | 描述                                         |
| ----------- | ---- | -------------------------------------------- |
| `--help`    | `-h` | 显示命令的帮助信息。                         |
| `--version` | `-v` | 显示 `@aigne/cli` 的当前版本。                 |

---

关于如何在开发工作流中结合使用这些命令的实用、面向任务的示例，请参阅 [指南](./guides.md) 部分。