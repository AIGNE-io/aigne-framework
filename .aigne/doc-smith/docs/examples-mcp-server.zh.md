# MCP 服务器

本指南全面介绍了如何将 AIGNE 框架的 Agent 作为模型上下文协议（MCP）服务器运行。通过遵循这些步骤，您将能够将您的自定义 Agent 作为工具暴露给任何兼容 MCP 的客户端（如 Claude Code），从而有效扩展您的 AI 助手的能​​力。

## 概述

[模型上下文协议（MCP）](https://modelcontextprotocol.io) 是一个开放标准，旨在使 AI 助手能够安全地连接到各种数据源和工具。通过实现 MCP 服务器，您可以将您的 AIGNE Agent 提供给任何支持该协议的客户端。这使您能够通过在 Agent 中定义的专业技能和功能来增强 AI 助手。

本示例演示了如何使用 [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md) 来托管来自 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 的 Agent，并将它们连接到像 Claude Code 这样的客户端。

下图说明了将 AIGNE 框架 Agent 作为 MCP 服务器运行并将其连接到像 Claude Code 这样的 MCP 兼容客户端的工作流程：

```d2
direction: down

Client: {
  label: "MCP 客户端\n(例如 Claude Code)"
  shape: rectangle
}

Developer: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

MCP-Server-Container: {
  label: "MCP 服务器 (localhost)"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Server: {
    label: "@aigne/example-mcp-server"
  }

  AIGNE-Agents: {
    label: "AIGNE 框架 Agent"
    shape: rectangle
    grid-columns: 3

    Current-Time-Agent: {
      label: "当前时间 Agent"
    }
    Poet-Agent: {
      label: "诗人 Agent"
    }
    System-Info-Agent: {
      label: "系统信息 Agent"
    }
  }
}

Model-Providers: {
  label: "AI 模型提供商"
  shape: rectangle

  Official-AIGNE-Hub: {
    label: "官方 AIGNE Hub"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "自托管 AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "第三方提供商\n(例如 OpenAI)"
  }
}

Observability-Server: {
  label: "AIGNE 可观测性服务器"
  shape: rectangle
}

Developer -> AIGNE-CLI: "1. npx ... serve-mcp"
Developer -> Client: "2. claude mcp add ..."
Client -> MCP-Server-Container.MCP-Server: "3. 调用 Agent 技能"
MCP-Server-Container.MCP-Server -> MCP-Server-Container.AIGNE-Agents: "4. 执行 Agent 逻辑"
MCP-Server-Container.AIGNE-Agents -> Model-Providers: "5. 连接到 AI 模型"
Model-Providers -> MCP-Server-Container.AIGNE-Agents: "6. 返回模型输出"
MCP-Server-Container.AIGNE-Agents -> MCP-Server-Container.MCP-Server: "7. 发送结果"
MCP-Server-Container.MCP-Server -> Client: "8. 返回技能输出"
Developer -> AIGNE-CLI: "（可选）npx aigne observe"
AIGNE-CLI -> Observability-Server: "启动服务器"
MCP-Server-Container.MCP-Server -> Observability-Server: "发送执行追踪"
```

## 前置要求

在开始之前，请确保您的开发环境满足以下要求：

*   **Node.js**: 版本 20.0 或更高。
*   **npm**: 随 Node.js 一起安装。
*   **OpenAI API 密钥**: 与 OpenAI 模型交互的 Agent 需要。您可以从 [OpenAI API 密钥页面](https://platform.openai.com/api-keys) 获取。

## 快速开始

您可以使用 `npx` 直接启动 MCP 服务器，无需任何本地安装。

### 1. 运行 MCP 服务器

在您的终端中执行以下命令，以在端口 `3456` 上启动服务器：

```bash serve-mcp.sh icon=lucide:terminal
npx -y @aigne/example-mcp-server serve-mcp --port 3456
```

成功启动后，您将看到以下输出，表示服务器正在运行并准备好接受连接。

```bash Output
Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.
MCP server is running on http://localhost:3456/mcp
```

### 2. 连接到 AI 模型

MCP 服务器所服务的 Agent 需要一个底层的 AI 模型才能运行。当您第一次运行服务器时，系统将提示您连接到一个模型提供商。您有以下几个选项：

#### 选项 A：通过官方 AIGNE Hub 连接

这是推荐给新用户的选项。
1.  在终端提示中选择第一个选项。
2.  您的网络浏览器将打开官方 AIGNE Hub 网站。
3.  按照屏幕上的说明登录或注册。新用户会自动获得 400,000 个 token 的初始额度。

#### 选项 B：通过自托管的 AIGNE Hub 连接

如果您有一个自托管的 AIGNE Hub 实例：
1.  选择第二个选项。
2.  输入您的自托管 AIGNE Hub 的 URL。
3.  按照提示完成连接。
    - 要设置您自己的 AIGNE Hub，您可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安装。

#### 选项 C：通过第三方模型提供商连接

您可以通过设置 API 密钥的环境变量直接连接到像 OpenAI 这样的第三方提供商。

```bash configure-api-key.sh icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

设置环境变量后，重新启动 MCP 服务器命令。有关配置其他提供商（如 DeepSeek 或 Google Gemini）的信息，请参阅示例项目中的 `.env.local.example` 文件。

## 可用 Agent

本示例将几个预构建的 Agent 作为 MCP 工具公开，每个 Agent 都有不同的功能：

*   **Current Time Agent** (`agents/current-time.js`)：提供当前日期和时间。
*   **Poet Agent** (`agents/poet.yaml`)：生成诗歌和其他创意文本格式。
*   **System Info Agent** (`agents/system-info.js`)：检索并显示有关主机系统的信息。

## 连接到 MCP 客户端

一旦您的 MCP 服务器运行起来，您就可以将其连接到任何兼容的客户端。以下示例使用 [Claude Code](https://claude.ai/code)。

### 将 MCP 服务器添加到 Claude Code

运行以下命令，将您的本地 MCP 服务器作为名为 `test` 的工具源添加到 Claude Code 中：

```bash add-mcp-server.sh icon=lucide:terminal
claude mcp add -t http test http://localhost:3456/mcp
```

### 从 Claude Code 调用 Agent

您现在可以直接从 Claude Code 界面调用 Agent 的技能。

**示例 1：调用 System Info Agent**
要获取系统信息，您可以提出一个触发 `system-info` 技能的问题。

**示例 2：调用 Poet Agent**
要生成一首诗，您可以提出一个调用 `poet` 技能的请求。

## 调试与观测

AIGNE 框架包含一个强大的可观测性工具，让您可以实时监控和调试 Agent 的执行。

### 启动可观测性服务器

要启动本地监控仪表板，请在一个新的终端窗口中运行以下命令：

```bash aigne-observe.sh icon=lucide:terminal
npx aigne observe --port 7890
```

### 查看执行追踪

打开您的网络浏览器并访问 `http://localhost:7890`。该仪表板提供了一个用户友好的界面，用于检查追踪、查看每个 Agent 调用的详细信息，并了解执行流程。这是调试、性能调优和深入了解 Agent 行为的重要工具。

## 总结

您现在已经成功启动了一个 MCP 服务器，将 AIGNE Agent 作为工具公开，并将其连接到了一个 MCP 客户端。这种强大的模式使您能够创建自定义、可重用的技能，并将它们无缝集成到 AI 助手的工作流程中。

有关更高级的示例和 Agent 类型，您可以浏览[示例](./examples.md)部分中的其他文档。要了解有关创建自己的 Agent 的更多信息，请参阅[开发者指南](./developer-guide-core-concepts-agents.md)。