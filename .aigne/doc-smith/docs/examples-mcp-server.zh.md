# MCP 服务器

本指南介绍了如何将 AIGNE Framework Agent 作为模型上下文协议（MCP）服务器运行。通过遵循这些步骤，您将能够将您的自定义 Agent 作为工具暴露给任何与 MCP 兼容的客户端（例如 Claude Code），从而扩展其功能。

## 概述

[模型上下文协议（MCP）](https://modelcontextprotocol.io)是一个开放标准，旨在使 AI 助手能够安全地连接各种数据源和工具。通过将 AIGNE Agent 作为 MCP 服务器运行，您可以用您的 Agent 的专业能力来增强与 MCP 兼容的客户端。

## 前提条件

在继续之前，请确保满足以下要求：

*   **Node.js：** 必须安装 20.0 或更高版本。您可以从 [nodejs.org](https://nodejs.org) 下载。
*   **AI 模型提供商：** 需要来自像 [OpenAI](https://platform.openai.com/api-keys) 这样的提供商的 API 密钥，以便 Agent 能够正常工作。

## 快速入门

您可以使用 `npx` 直接启动 MCP 服务器，无需本地安装。

### 1. 运行 MCP 服务器

在您的终端中执行以下命令，以在端口 `3456` 上启动服务器：

```bash server.js icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

成功执行后，服务器将启动，您将看到以下输出，表明 MCP 服务器已激活并可访问。

```bash
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. 连接到 AI 模型

Agent 需要连接到大型语言模型（LLM）来处理请求。如果您在未配置模型提供商的情况下运行服务器，系统将提示您选择一种连接方法。

![AI 模型设置的初始连接提示。](../../../examples/mcp-server/run-example.png)

您有三种主要选项来连接 AI 模型。

#### 选项 A：连接到官方 AIGNE Hub

这是推荐给新用户的方法。

1.  选择第一个选项，“连接到 Arcblock 官方 AIGNE Hub”。
2.  您的网络浏览器将打开 AIGNE Hub 授权页面。
3.  按照屏幕上的说明批准连接。新用户将自动获得 400,000 个 token 用于评估。

![AIGNE Hub 授权对话框。](../../../examples/images/connect-to-aigne-hub.png)

#### 选项 B：连接到自托管的 AIGNE Hub

如果您运行自己的 AIGNE Hub 实例，请选择第二个选项。

1.  系统将提示您输入自托管 AIGNE Hub 的 URL。
2.  提供 URL 并按照后续提示完成连接。

有关部署自托管 AIGNE Hub 的说明，请访问 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes)。

![提示输入自托管 AIGNE Hub URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 选项 C：通过第三方模型提供商连接

您可以通过设置适当的 API 密钥作为环境变量，直接连接到第三方模型提供商，如 OpenAI。

例如，要使用 OpenAI，请设置 `OPENAI_API_KEY` 变量：

```bash .env icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

设置环境变量后，重新启动 MCP 服务器命令。有关其他提供商（如 DeepSeek 或 Google Gemini）支持的变量列表，请参阅代码仓库中的示例配置文件。

## 可用 Agent

此示例将几个预构建的 Agent 作为 MCP 工具暴露出来，每个 Agent 都有不同的功能：

| Agent | 文件路径 | 描述 |
| ----------------- | -------------------------- | ------------------------------------- |
| Current Time | `agents/current-time.js` | 提供当前日期和时间。 |
| Poet | `agents/poet.yaml` | 生成诗歌和创意文本。 |
| System Info | `agents/system-info.js` | 报告有关系统的信息。 |

## 连接到 MCP 客户端

服务器运行后，您可以将其连接到与 MCP 兼容的客户端。以下示例使用 [Claude Code](https://claude.ai/code)。

1.  使用以下命令将正在运行的 MCP 服务器添加到 Claude Code：

    ```bash icon=lucide:terminal
    claude mcp add -t http test http://localhost:3456/mcp
    ```

2.  在客户端内部调用 Agent。例如，您可以请求系统信息或要求写一首诗。

    **示例：调用 System Info Agent**
    ![从 Claude Code 调用 system info agent。](https://www.arcblock.io/image-bin/uploads/4824b6bf01f393a064fb36ca91feefcc.gif)

    **示例：调用 Poet Agent**
    ![从 Claude Code 调用 poet agent。](https://www.arcblock.io/image-bin/uploads/d4b49b880c246f55e0809cdc712a5bdb.gif)

## 观察 Agent 活动

AIGNE 包含一个可观测性工具，可让您实时监控和调试 Agent 的执行情况。

1.  在一个新的终端窗口中运行以下命令来启动可观测性服务器：

    ```bash icon=lucide:terminal
    npx aigne observe --port 7890
    ```

    ![启动 AIGNE observe 服务器后的终端输出。](../../../examples/images/aigne-observe-execute.png)

2.  打开您的网络浏览器并导航到 `http://localhost:7890`。

该仪表板提供了一个用户友好的界面，用于检查执行跟踪、查看详细的调用信息以及理解 Agent 的行为。这是调试、性能调优和深入了解您的 Agent 如何处理信息的重要工具。

![可观测性 UI 中最近执行的列表。](../../../examples/images/aigne-observe-list.png)

以下是由 Poet Agent 处理的请求的详细跟踪示例。

![Poet Agent 的详细跟踪视图。](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

## 总结

您已成功启动 MCP 服务器，将其连接到 AI 模型，并将 AIGNE Agent 作为工具暴露给 MCP 客户端。这使您能够通过自定义逻辑和数据源来扩展 AI 助手的功能。

有关更高级的示例和 Agent 类型，请浏览以下部分：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    了解如何通过模型上下文协议（MCP）连接外部系统并与之交互。
  </x-card>
  <x-card data-title="MCP GitHub 示例" data-icon="lucide:github" data-href="/examples/mcp-github">
    查看使用 MCP 服务器与 GitHub 代码仓库进行交互的示例。
  </x-card>
</x-cards>