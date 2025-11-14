# MCP GitHub

本文档为示例提供了一份全面的指南，演示了如何使用 AIGNE 框架和 GitHub MCP (Model Context Protocol) 服务器与 GitHub 仓库进行交互。您将学习如何设置和运行该示例，使 AI agent 能够执行各种 GitHub 操作，例如搜索仓库和管理文件。

## 概述

该示例展示了 `MCPAgent` 与 GitHub MCP 服务器的集成。该 agent 为 AI 配备了一套与 GitHub API 交互的工具（技能）。工作流允许用户使用自然语言发出请求，然后 AI agent 将其转换为对 GitHub agent 的特定函数调用，以执行搜索仓库、读取文件内容或创建 Issue 等操作。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AIAgent: {
    label: "AI Agent\n(@aigne/core)"
    shape: rectangle
  }

  MCPAgent: {
    label: "GitHub MCP Agent\n(技能)"
    shape: rectangle
  }

  AIAgent -> MCPAgent: "使用技能"
}

GitHub-MCP-Server: {
  label: "GitHub MCP 服务器\n(@modelcontextprotocol/server-github)"
  shape: rectangle
}

GitHub-API: {
  label: "GitHub API"
  shape: cylinder
}

AI-Model-Provider: {
  label: "AI 模型提供商\n(例如 OpenAI, AIGNE Hub)"
  shape: cylinder
}

AIGNE-Observe: {
  label: "AIGNE Observe\n(调试 UI)"
  shape: rectangle
}

User -> AIGNE-Framework.AIAgent: "1. 自然语言请求"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "2. 处理请求"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "3. 返回函数调用"
AIGNE-Framework.AIAgent -> AIGNE-Framework.MCPAgent: "4. 执行函数调用"
AIGNE-Framework.MCPAgent -> GitHub-MCP-Server: "5. 发送命令"
GitHub-MCP-Server -> GitHub-API: "6. 调用 GitHub API"
GitHub-API -> GitHub-MCP-Server: "7. 返回 API 响应"
GitHub-MCP-Server -> AIGNE-Framework.MCPAgent: "8. 返回结果"
AIGNE-Framework.MCPAgent -> AIGNE-Framework.AIAgent: "9. 返回结果"
AIGNE-Framework.AIAgent -> AI-Model-Provider: "10. 处理结果"
AI-Model-Provider -> AIGNE-Framework.AIAgent: "11. 返回自然语言响应"
AIGNE-Framework.AIAgent -> User: "12. 最终响应"
AIGNE-Framework -> AIGNE-Observe: "发送执行追踪"
```

## 前提条件

在继续之前，请确保您的系统满足以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：随 Node.js 一同安装。
*   **GitHub 个人访问令牌**：一个具有您打算交互的仓库所需权限的令牌。您可以从您的 [GitHub 设置](https://github.com/settings/tokens) 创建一个。
*   **AI 模型提供商账户**：来自 [OpenAI](https://platform.openai.com/api-keys) 等提供商的 API 密钥，或连接到 AIGNE Hub 实例。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需本地安装。

首先，将您的 GitHub 令牌设置为环境变量。

```bash 设置您的 GitHub 令牌 icon=lucide:terminal
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
```

接下来，执行该示例。

```bash 运行示例 icon=lucide:terminal
npx -y @aigne/example-mcp-github
```

### 连接到 AI 模型

首次执行时，如果未配置 AI 模型，系统将提示您连接一个。

DIAGRAM_PLACEHOLDER

您有以下几种选择：

#### 1. 连接到官方 AIGNE Hub

这是推荐的方法。选择此选项将在浏览器中打开官方 AIGNE Hub 页面。按照屏幕上的说明授权连接。新用户会获得免费积分以开始使用。

DIAGRAM_PLACEHOLDER

#### 2. 连接到自托管的 AIGNE Hub

如果您运行自己的 AIGNE Hub 实例，请选择此选项。系统将提示您输入自托管 Hub 的 URL 以完成连接。

DIAGRAM_PLACEHOLDER

#### 3. 配置第三方模型提供商

您也可以直接连接到受支持的第三方模型提供商，例如 OpenAI。为此，请将提供商的 API 密钥设置为环境变量。

例如，要使用 OpenAI，请配置您的 `OPENAI_API_KEY`：

```bash 设置您的 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

设置环境变量后，再次运行 `npx` 命令。有关其他提供商支持的环境变量列表，请参阅项目源代码中的 `.env.local.example` 文件。

## 从源代码安装

对于希望检查或修改代码的开发者，请按照以下步骤从本地克隆运行示例。

### 1. 克隆仓库

从 GitHub 克隆主 AIGNE 框架仓库。

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装必要的依赖项。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-github
pnpm install
```

### 3. 运行示例

执行启动脚本以运行示例。

```bash 以单次模式运行 icon=lucide:terminal
pnpm start
```

该示例还支持交互式聊天模式，并可以接受来自其他命令的管道输入。

```bash 以交互式聊天模式运行 icon=lucide:terminal
pnpm start -- --chat
```

```bash 使用管道输入 icon=lucide:terminal
echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
```

### 命令行选项

您可以使用以下命令行参数自定义执行：

| 参数 | 描述 | 默认值 |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat` | 以交互式聊天模式运行。 | 已禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 `openai` 或 `openai:gpt-4o-mini`）。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>` | 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志记录级别 (`ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`)。 | `INFO` |
| `--input, -i <input>` | 直接将输入指定为参数。 | 无 |

## 代码示例

以下 TypeScript 代码演示了示例的核心逻辑。它初始化一个 AI 模型，为 GitHub 设置 `MCPAgent`，并调用 `AIAgent` 来执行仓库搜索。

```typescript index.ts
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 加载环境变量
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;

// 初始化 OpenAI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 初始化 GitHub MCP agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// 使用模型和 GitHub 技能创建 AIGNE 实例
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// 创建一个 AI agent，并附带与 GitHub 交互的指令
const agent = AIAgent.from({
  instructions: `\
## GitHub 交互助手
你是一个帮助用户与 GitHub 仓库交互的助手。
你可以执行各种 GitHub 操作，例如：
1. 搜索仓库
2. 获取文件内容
3. 创建或更新文件
4. 创建 Issue 和拉取请求
5. 以及许多其他的 GitHub 操作

始终提供清晰、简洁的响应，并附带来自 GitHub 的相关信息。
`,
});

// 调用 agent 搜索仓库
const result = await aigne.invoke(
  agent,
  "Search for repositories related to 'modelcontextprotocol'",
);

console.log(result);
// 预期输出：
// I found several repositories related to 'modelcontextprotocol':
//
// 1. **modelcontextprotocol/servers** - MCP servers for various APIs and services
// 2. **modelcontextprotocol/modelcontextprotocol** - The main ModelContextProtocol repository
// ...

// 完成后关闭 AIGNE 实例
await aigne.shutdown();
```

## 可用操作

GitHub MCP 服务器将广泛的 GitHub 功能作为 AI agent 可以使用的技能暴露出来，包括：

*   **仓库操作**：搜索、创建和获取有关仓库的信息。
*   **文件操作**：获取文件内容，创建或更新文件，以及在单次提交中推送多个文件。
*   **Issue 和 PR 操作**：创建 Issue 和拉取请求，添加评论，以及合并拉取请求。
*   **搜索操作**：搜索代码、Issue 和用户。
*   **提交操作**：列出提交和获取提交详情。

## 使用 AIGNE Observe 进行调试

要检查和分析您的 agent 的行为，您可以使用 `aigne observe` 命令。该工具会启动一个本地 Web 服务器，提供一个用户界面，用于查看执行追踪、调用详情和其他运行时数据。

要启动观察服务器，请运行：

```bash 启动 AIGNE observe 服务器 icon=lucide:terminal
aigne observe
```

DIAGRAM_PLACEHOLDER

服务器运行后，您可以在浏览器中访问 Web 界面，查看最近的执行列表并深入了解每个追踪的详细信息。

DIAGRAM_PLACEHOLDER

此工具对于调试、理解 agent 如何与工具和模型交互以及优化性能非常有价值。