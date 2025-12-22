本指南说明了如何将 AIGNE 框架 Agent 作为模型上下文协议 (MCP) 服务器运行。阅读完本文档后，您将能够启动服务器，将其连接到 AI 模型，并使用兼容 MCP 的客户端（如 Claude Code）与您的 Agent 进行交互。

模型上下文协议 (MCP) 是一种开放标准，旨在使 AI 助手能够安全地连接到各种数据源和工具。通过将 AIGNE Agent 作为 MCP 服务器公开，您可以使用自定义 Agent 的专业技能和能力来增强兼容 MCP 的客户端。

下图说明了 AIGNE MCP 服务器如何将您的 Agent 连接到 AI 模型和兼容 MCP 的客户端。

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![本指南说明了如何将 AIGNE 框架 Agent 作为模型上下文协议...](assets/diagram/examples-mcp-server-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 前置要求

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js:** 20.0 或更高版本。
*   **AI 模型访问权限：** 支持的大型语言模型提供商（如 OpenAI）的 API 密钥。

## 快速入门

您可以使用 `npx` 直接运行该示例，无需本地安装。

### 1. 运行 MCP 服务器

在终端中执行以下命令，下载并启动 MCP 服务器示例：

```sh serve-mcp icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

成功执行后，服务器将启动，您将看到以下输出，确认 MCP 服务器已激活并正在监听连接。

```sh Expected Output icon=lucide:terminal
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. 连接到 AI 模型

MCP 服务器需要连接到大型语言模型才能运行。如果您是第一次运行服务器，命令行提示将引导您完成连接过程。

![用于连接到 AI 模型的终端提示。](../../../examples/mcp-server/run-example.png)

您有三种主要方式连接到 AI 模型：

#### 方式一：AIGNE Hub（推荐）

连接到官方的 AIGNE Hub 以快速入门。新用户可获得免费额度，这是进行评估最直接的选择。在提示中选择第一个选项，您的网页浏览器将打开以引导您完成授权过程。

![AIGNE Hub 授权页面。](../../../examples/images/connect-to-aigne-hub.png)

#### 方式二：自托管的 AIGNE Hub

如果您的组织使用自托管的 AIGNE Hub 实例，请选择第二个选项，并在出现提示时输入您的 Hub 实例的 URL。

![提示输入自托管 AIGNE Hub URL 的终端提示。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 方式三：第三方模型提供商

您可以通过设置适当的环境变量直接连接到第三方模型提供商。例如，要使用 OpenAI，请在运行服务器命令之前导出您的 API 密钥。

```sh Configure OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

设置环境变量后，重新启动 `serve-mcp` 命令。

## 可用 Agent

此示例将几个预配置的 Agent 作为 MCP 工具公开，每个 Agent 都有不同的功能：

*   **当前时间 Agent：** 提供当前时间。在 `agents/current-time.js` 中定义。
*   **诗人 Agent：** 生成诗歌和其他创意文本格式。在 `agents/poet.yaml` 中定义。
*   **系统信息 Agent：** 检索有关主机系统的信息。在 `agents/system-info.js` 中定义。

## 连接到 MCP 客户端

MCP 服务器运行后，您可以从任何兼容 MCP 的客户端连接到它。以下示例使用 Claude Code。

首先，请确保您已安装 [Claude Code](https://claude.ai/code)。然后，使用以下命令将 AIGNE MCP 服务器添加为工具源：

```sh Add MCP Server to Claude icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

添加服务器后，您可以直接从 Claude Code 界面调用 Agent 的技能。

## 观察 Agent 执行

AIGNE 框架包含一个可观测性工具，允许您实时监控和调试 Agent 行为。该工具对于分析追踪、检查输入和输出以及了解 Agent 性能至关重要。

### 1. 启动观察器

要启动本地可观测性 Web 服务器，请在新的终端窗口中运行以下命令：

```sh Start Observability Server icon=lucide:terminal
npx aigne observe --port 7890
```

服务器将启动并提供一个用于访问仪表板的 URL。

![显示可观测性服务器正在运行的终端输出。](../../../examples/images/aigne-observe-execute.png)

### 2. 查看追踪

在您的网页浏览器中打开 `http://localhost:7890` 以访问 AIGNE 可观测性仪表板。“Traces” 视图提供了最近 Agent 执行的列表，包括有关延迟、Token 使用情况和状态的详细信息。

![显示追踪列表的 Aigne 可观测性界面。](../../../examples/images/aigne-observe-list.png)