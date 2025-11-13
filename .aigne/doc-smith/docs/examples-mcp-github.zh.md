# MCP GitHub

本文档为示例提供了一份全面的指南，演示了如何与 GitHub 仓库进行交互。阅读本指南后，您将能够运行一个 AI Agent，该 Agent 可以使用 AIGNE 框架和 GitHub 模型上下文协议（MCP）服务器来搜索仓库、读取文件内容以及执行其他与 GitHub 相关的任务。

## 概述

本示例展示了 AIGNE 框架与 GitHub MCP 服务器的集成，使 AI Agent 能够将 GitHub 的 API 作为一组工具来使用。该 Agent 可以在单命令（一次性）模式或交互式聊天模式下运行，从而实现灵活的交互。

涉及的核心组件包括：
- **AI Agent**：负责理解用户请求并协调任务的主要 Agent。
- **GitHub MCP Agent**：一个专门的 Agent，连接到 GitHub MCP 服务器，将其功能（如搜索仓库、读取文件）作为技能暴露出来。

下图说明了这些组件之间的关系和信息流：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
    "理解用户请求\n并协调任务"
  }

  GitHub-MCP-Agent: {
    label: "GitHub MCP Agent"
    shape: rectangle
    "将 GitHub 服务器的\n功能作为技能暴露"
  }
}

GitHub-MCP-Server: {
  label: "GitHub MCP 服务器"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "1. 发送请求（例如，搜索仓库）"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.GitHub-MCP-Agent: "2. 使用 GitHub 技能"
AIGNE-Framework.GitHub-MCP-Agent -> GitHub-MCP-Server: "3. 连接并发送命令"
GitHub-MCP-Server -> GitHub-API: "4. 进行 API 调用"
GitHub-API -> GitHub-MCP-Server: "5. 返回数据"
GitHub-MCP-Server -> AIGNE-Framework.GitHub-MCP-Agent: "6. 转发响应"
AIGNE-Framework.GitHub-MCP-Agent -> AIGNE-Framework.AI-Agent: "7. 返回技能执行结果"
AIGNE-Framework.AI-Agent -> User: "8. 呈现最终答案"
```

要更深入地了解 MCP Agent 的工作原理，请参阅 [MCP Agent](./developer-guide-agents-mcp-agent.md) 文档。

## 前置要求

在继续之前，请确保满足以下要求：

- **Node.js**：版本 20.0 或更高。您可以从 [nodejs.org](https://nodejs.org) 下载。
- **GitHub 个人访问令牌**：需要一个具有适当仓库权限的令牌。您可以从您的 [GitHub 设置](https://github.com/settings/tokens) 生成一个。
- **AI 模型提供商 API 密钥**：需要一个来自像 OpenAI 这样的提供商的 API 密钥，以便 AI Agent 正常工作。请从 [OpenAI 平台](https://platform.openai.com/api-keys) 获取您的密钥。

## 快速开始

您可以使用 `npx` 直接运行此示例，无需任何本地安装。

首先，将您的 GitHub 令牌设置为环境变量。

```sh 设置 GitHub 令牌 icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

接下来，运行示例。

```sh 运行示例 icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### 连接到 AI 模型

首次运行示例时，系统会提示您连接到一个 AI 模型。您有以下几个选项：

1.  **AIGNE Hub (官方)**：选择此选项可通过官方 AIGNE Hub 进行连接。浏览器窗口将打开，供您完成连接。新用户会获得免费的令牌赠款。
2.  **AIGNE Hub (自托管)**：如果您托管自己的 AIGNE Hub 实例，请选择此选项并提供其 URL 以进行连接。
3.  **第三方模型提供商**：要直接使用像 OpenAI 这样的提供商，请将相应的 API 密钥设置为环境变量。

例如，要使用 OpenAI，请导出您的 API 密钥并重新运行命令：

```sh 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
npx -y @aigne/example-mcp-github
```

有关配置其他提供商的更多详细信息，请参阅仓库中的示例环境文件。

## 从源码安装

为了进行开发或修改，您可以克隆仓库并在本地运行示例。

1.  **克隆仓库**

    ```sh 克隆仓库 icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **导航到目录并安装依赖项**

    ```sh 安装依赖项 icon=lucide:terminal
    cd aigne-framework/examples/mcp-github
    pnpm install
    ```

3.  **运行示例**

    您可以在默认的一次性模式、交互式聊天模式下运行 Agent，或者直接通过管道输入来运行。

    ```sh 以一次性模式运行 icon=lucide:terminal
    pnpm start
    ```

    ```sh 以交互式聊天模式运行 icon=lucide:terminal
    pnpm start -- --chat
    ```

    ```sh 使用管道输入运行 icon=lucide:terminal
    echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
    ```

### 命令行选项

该应用程序支持多个命令行参数，以实现自定义执行。

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--chat` | 以交互式聊天模式运行 Agent。 | 禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>`| 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>`| 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入。 | 无 |

## 代码示例

以下 TypeScript 代码展示了设置和运行 GitHub Agent 的核心逻辑。它初始化了 AI 模型和 GitHub MCP Agent，使用 `AIGNE` 将它们组合起来，然后调用一个 `AIAgent` 来执行任务。

```typescript usages.ts icon=logos:typescript
import assert from "node:assert";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

// 确保环境变量已设置
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");
assert(GITHUB_TOKEN, "Please set the GITHUB_TOKEN environment variable");

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 初始化 GitHub MCP Agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// 3. 创建一个带有模型和 GitHub 技能的 AIGNE 实例
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// 4. 创建一个带有具体指令的 AI Agent
const agent = AIAgent.from({
  instructions: `\
## GitHub 交互助手
你是一个帮助用户与 GitHub 仓库进行交互的助手。
你可以执行各种 GitHub 操作，例如：
1. 搜索仓库
2. 获取文件内容
3. 创建或更新文件
4. 创建 issue 和 pull request
5. 以及许多其他 GitHub 操作

始终提供清晰、简洁的响应，并附上来自 GitHub 的相关信息。
`,
  inputKey: "message",
});

// 5. 调用 Agent 以执行任务
const result = await aigne.invoke(agent, {
  message: "Search for repositories related to 'modelcontextprotocol' and limit to 3 results",
});

console.log(result);
// 预期输出：
// I found the following repositories related to 'modelcontextprotocol':
// 1. **modelcontextprotocol/modelcontextprotocol**: The main repository for the Model Context Protocol.
// 2. **modelcontextprotocol/servers**: A collection of MCP servers for various APIs and services.
// 3. **AIGNE-io/aigne-framework**: The framework for building agentic AI applications.

// 6. 关闭 AIGNE 实例
await aigne.shutdown();
```

此脚本演示了一个完整的工作流程：设置必要的组件，定义 Agent 的目的，并执行一个特定的任务。

## 可用的 GitHub 操作

GitHub MCP 服务器暴露了广泛的功能。可以指示 AI Agent 执行跨越多个类别的操作：

- **仓库操作**：搜索、创建和检索仓库信息。
- **文件操作**：获取文件内容，创建或更新文件，并在单次提交中推送多个文件。
- **Issue 和 PR 操作**：创建 issue 和 pull request，添加评论，以及合并 pull request。
- **搜索操作**：在整个 GitHub 中搜索代码、issue 和用户。
- **提交操作**：列出提交记录并获取特定提交的详细信息。

## 总结

本示例提供了一个实际演示，说明了如何构建一个能够通过模型上下文协议与像 GitHub 这样的外部服务进行交互的功能性 AI Agent。通过遵循所概述的步骤，您可以快速设置并试验一个能够自动化仓库相关任务的 Agent。

有关其他可用示例和高级工作流程的更多信息，请浏览以下部分：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    了解 MCPAgent 背后的核心概念及其如何连接到外部工具。
  </x-card>
  <x-card data-title="所有示例" data-icon="lucide:binary" data-href="/examples">
    浏览完整的示例列表，发现 AIGNE 框架的其他功能。
  </x-card>
</x-cards>