# MCP Blocklet

本文档为一篇技术指南，介绍了如何使用 AIGNE 框架和模型上下文协议（MCP）与托管在 Blocklet 平台上的应用程序进行交互。它为开发者概述了必要的先决条件、快速入门步骤、模型连接方法以及高级配置选项。

```d2
direction: down

Developer: {
  shape: c4-person
}

Execution-Environment: {
  label: "执行环境"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  MCP-Blocklet-Example: {
    label: "@aigne/example-mcp-blocklet"
    shape: rectangle
  }

  AIGNE-Observe: {
    label: "aigne observe"
    shape: rectangle
  }
}

Blocklet-Application: {
  label: "目标 Blocklet 应用"
  shape: rectangle
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

AI-Model-Providers: {
  label: "AI 模型提供商"
  shape: rectangle

  AIGNE-Hub-Official: {
    label: "AIGNE Hub（官方）"
  }

  Self-Hosted-AIGNE-Hub: {
    label: "自托管 AIGNE Hub"
  }

  Third-Party-Provider: {
    label: "第三方提供商（例如 OpenAI）"
  }
}

Developer -> Execution-Environment.MCP-Blocklet-Example: "通过 `npx` 或 `pnpm start` 运行"
Developer -> Execution-Environment.AIGNE-Observe: "用于调试"
Execution-Environment.MCP-Blocklet-Example -> Blocklet-Application: "与之交互"
Execution-Environment.MCP-Blocklet-Example -> AI-Model-Providers: "连接其中之一"
Execution-Environment.AIGNE-Observe -> Execution-Environment.MCP-Blocklet-Example: "监控执行数据"
```

## 先决条件

在继续之前，请确保在您的本地开发机器上已安装并正确配置了以下依赖项：

*   **Node.js：** 20.0 或更高版本。
*   **npm：** Node 包管理器，随 Node.js 一同分发。
*   **OpenAI API Key：** 需要一个有效的 API 密钥才能与 OpenAI 模型对接。密钥可从 [OpenAI API keys 页面](https://platform.openai.com/api-keys)生成。

对于打算从源代码运行示例的开发者，还需要以下工具：

*   **Bun：** 一个用于执行单元测试和示例的 JavaScript 运行时。
*   **pnpm：** 一个用于处理项目依赖的包管理器。

## 快速入门

本节概述了通过 `npx` 直接执行示例的步骤，此方法无需在本地安装项目仓库。

首先，配置 `BLOCKLET_APP_URL` 环境变量，使其指向您的目标 Blocklet 应用。

```bash 设置 Blocklet 应用 URL icon=lucide:terminal
export BLOCKLET_APP_URL="https://xxx.xxxx.xxx"
```

### 执行模式

该示例支持两种主要的操作模式。

#### 单次模式

在默认的单次模式下，Agent 处理单个请求后即终止。

```bash 以单次模式运行 icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet
```

输入也可以通过标准管道提供，这对于编写脚本非常有用。

```bash 使用管道输入运行 icon=lucide:terminal
echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
```

#### 交互式聊天模式

要进行持久的对话式会话，请使用 `--chat` 标志执行示例。

```bash 以交互模式运行 icon=lucide:terminal
npx -y @aigne/example-mcp-blocklet --chat
```

### 连接到 AI 模型

Agent 需要连接到 AI 模型才能正常工作。支持以下连接方法。

#### 1. AIGNE Hub（官方）

首次执行时，系统会提示您连接到一个模型提供商。对于新用户，建议选择第一个选项，即通过官方 AIGNE Hub 连接。此方法提供托管服务以及用于初次使用的免费 Token 配额。

#### 2. 自托管 AIGNE Hub

或者，您也可以连接到自托管的 AIGNE Hub 实例。选择第二个选项并提供您部署实例的 URL。自托管的 Hub 可以从 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安装。

#### 3. 第三方模型提供商

支持通过环境变量直接与第三方模型提供商集成。例如，要使用 OpenAI，请设置 `OPENAI_API_KEY` 变量。

```bash 配置 OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

请参阅 `.env.local.example` 文件，了解支持的提供商及其所需环境变量的完整列表。设置变量后，重新运行 `npx` 命令。

## 从源代码运行

出于开发或修改目的，可以从仓库的本地克隆运行该示例。

### 1. 克隆仓库

使用 Git 克隆 `aigne-framework` 仓库。

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例的目录，并使用 `pnpm` 安装依赖。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/mcp-blocklet
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令以默认的单次模式执行脚本。

```bash 运行示例 icon=lucide:terminal
pnpm start
```

您也可以将 Blocklet 应用程序的 URL 作为命令行参数提供。

```bash 使用特定 URL 运行 icon=lucide:terminal
pnpm start https://your-blocklet-app-url
```

## 命令行选项

可以使用下面详述的命令行参数来修改示例的行为。当通过 `pnpm start` 从源代码运行时，脚本的命令行参数必须前置 `--`。

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--chat` | 以交互式聊天模式运行 Agent。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式：`'provider[:model]'`。例如：`'openai'` 或 `'openai:gpt-4o-mini'`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置模型生成的 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置模型生成的 presence penalty 值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置模型生成的 frequency penalty 值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志记录的详细程度。可接受的值：`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入。 | `None` |

### 用法示例

```bash 以交互模式运行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 将日志级别设置为 DEBUG icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

```bash 使用管道输入 icon=lucide:terminal
echo "What are the features of this blocklet app?" | pnpm start
```

## 调试

AIGNE 框架包含 `aigne observe`，这是一个命令行工具，可启动一个本地 Web 服务器，用于监控和分析 Agent 执行数据。此工具对于调试、性能分析和理解 Agent 行为至关重要。

在一个专用的终端会话中启动观察服务器。运行您的 Agent 后，Web 界面将显示最近执行的列表，提供详细的追踪、调用信息和运行时指标。

## 总结

本文档详细介绍了运行 MCP Blocklet 示例的步骤，涵盖了先决条件、使用 `npx` 的快速入门执行、各种模型连接方法以及从源代码运行。有关 MCP 集成的其他示例，请参阅以下指南。

<x-cards data-columns="2">
  <x-card data-title="MCP 服务器" data-icon="lucide:server" data-href="/examples/mcp-server">了解如何将 AIGNE 框架 Agent 作为模型上下文协议（MCP）服务器运行。</x-card>
  <x-card data-title="MCP DID Spaces" data-icon="lucide:space" data-href="/examples/mcp-did-spaces">了解如何创建一个集成了 MCP DID Spaces 的聊天机器人，以将 DID Spaces 功能作为技能暴露出来。</x-card>
</x-cards>