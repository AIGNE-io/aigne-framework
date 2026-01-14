# MCP SQLite

本指南全面介绍了如何使用由 AIGNE 框架驱动的 AI agent 与 SQLite 数据库进行交互。通过遵循这些步骤，您将学习如何设置必要的组件、运行示例应用程序，并使用 agent 执行创建表和查询数据等数据库操作。

此示例的核心是使用 `MCPAgent` 连接到正在运行的 [SQLite MCP 服务器](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)。该服务器将数据库功能公开为技能，`AIAgent` 可以根据用户提示智能地调用这些技能。

```d2
direction: down

User: {
  shape: c4-person
}

App: {
  label: "@aigne/example-mcp-sqlite"
  shape: rectangle

  AIGNE-Framework: {
    label: "AIGNE 框架 (@aigne/core)"
    shape: rectangle

    AIGNE-Instance: {
      label: "AIGNE 实例"
    }

    AIAgent: {
      label: "AIAgent"
    }

    MCPAgent: {
      label: "MCPAgent"
    }
  }

  AI-Model: {
    label: "AI 模型\n(例如 OpenAI)"
    shape: rectangle
  }
}

SQLite-MCP-Server: {
  label: "SQLite MCP 服务器"
  shape: rectangle
}

SQLite-DB: {
  label: "SQLite 数据库\n(usages.db)"
  shape: cylinder
}

User -> App: "1. 运行命令\n(例如 '创建一个产品表')"
App.AIGNE-Framework.AIAgent -> App.AI-Model: "2. 解释提示"
App.AI-Model -> App.AIGNE-Framework.AIAgent: "3. 返回所需的技能调用"
App.AIGNE-Framework.AIAgent -> App.AIGNE-Framework.MCPAgent: "4. 调用技能"
App.AIGNE-Framework.MCPAgent -> SQLite-MCP-Server: "5. 发送命令"
SQLite-MCP-Server -> SQLite-DB: "6. 执行 SQL"
SQLite-DB -> SQLite-MCP-Server: "7. 返回结果"
SQLite-MCP-Server -> App.AIGNE-Framework.MCPAgent: "8. 发送响应"
App.AIGNE-Framework.MCPAgent -> App.AIGNE-Framework.AIAgent: "9. 转发响应"
App.AIGNE-Framework.AIAgent -> App: "10. 处理最终输出"
App -> User: "11. 显示结果消息"
```

## 前置要求

在继续之前，请确保您的开发环境满足以下要求。为了成功执行示例，必须遵守这些前置要求。

*   **Node.js:** 版本 20.0 或更高。
*   **npm:** Node.js 包管理器，随 Node.js 一起提供。
*   **uv:** 一个 Python 包安装程序。运行 SQLite MCP 服务器时需要。安装说明可在 [`uv` 官方仓库](https://github.com/astral-sh/uv)中找到。
*   **AI 模型 API 密钥:** AI agent 需要一个受支持提供商的 API 密钥才能正常工作。本示例默认使用 OpenAI，但也支持其他提供商。您可以从 OpenAI 平台获取 [OpenAI API 密钥](https://platform.openai.com/api-keys)。

对于希望从源代码运行示例的开发者，还需要以下依赖项：

*   **Pnpm:** 一款快速、节省磁盘空间的包管理器。
*   **Bun:** 一款快速的 JavaScript 多合一工具包，用于运行测试和示例。

## 快速入门

本节提供直接运行示例而无需手动安装的说明，这是进行初步评估的最有效方法。

该应用程序可以在一次性模式下执行单个命令，也可以在交互式聊天模式下运行，或者通过管道直接将输入传递给脚本。

在您的终端中执行以下命令之一：

```bash title="以一次性模式运行（默认）" icon=lucide:terminal
npx -y @aigne/example-mcp-sqlite
```

```bash title="以交互式聊天模式运行" icon=lucide:terminal
npx -y @aigne/example-mcp-sqlite --interactive
```

```bash title="使用管道输入" icon=lucide:terminal
echo "create a product table with columns name description and createdAt" | npx -y @aigne/example-mcp-sqlite
```

## 连接到 AI 模型

AI agent 需要连接到大语言模型 (LLM) 以处理指令。如果您在未预先配置模型的情况下运行示例，系统将提示您选择一种连接方法。

![未配置 AI 模型时的初始连接提示。](../../../examples/mcp-sqlite/run-example.png)

建立此连接主要有三种方法：

### 1. 连接到 AIGNE 官方 Hub

这是推荐给新用户的方法。它提供了一个简化的、基于浏览器的身份验证过程。新用户会获得免费积分来测试平台。

1.  选择第一个选项：`Connect to the Arcblock official AIGNE Hub`。
2.  您的默认网络浏览器将打开一个授权页面。
3.  按照屏幕上的说明批准连接。

![将 AIGNE CLI 连接到 AIGNE Hub 的授权提示。](../../../examples/images/connect-to-aigne-hub.png)

### 2. 连接到自托管的 AIGNE Hub

如果您的组织运行一个私有的 AIGNE Hub 实例，请选择第二个选项并提供您的 Hub 的 URL 以完成连接。

![提示输入自托管 AIGNE Hub 的 URL。](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

### 3. 通过第三方模型提供商连接

您可以通过将相应的 API 密钥配置为环境变量，直接连接到受支持的第三方模型提供商，例如 OpenAI。

例如，要连接到 OpenAI，请设置 `OPENAI_API_KEY` 变量：

```bash title="设置 OpenAI API 密钥" icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

设置环境变量后，重新运行 `npx` 命令。有关受支持的提供商及其所需环境变量的完整列表，请参阅仓库中的示例 `.env.local.example` 文件。

## 从源代码安装

对于希望检查或修改源代码的开发者，请按照以下步骤克隆仓库并在本地运行示例。

### 1. 克隆仓库

将官方 AIGNE 框架仓库克隆到您的本地计算机。

```bash title="克隆仓库" icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例目录并使用 `pnpm` 安装所需的依赖项。

```bash title="安装依赖项" icon=lucide:terminal
cd aigne-framework/examples/mcp-sqlite
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令执行应用程序。

```bash title="以一次性模式运行（默认）" icon=lucide:terminal
pnpm start
```

要在交互模式下运行或使用管道输入，请在 `--` 分隔符后附加所需的标志。

```bash title="以交互式聊天模式运行" icon=lucide:terminal
pnpm start -- --interactive
```

```bash title="使用管道输入" icon=lucide:terminal
echo "create a product table with columns name description and createdAt" | pnpm start
```

### 命令行选项

该应用程序支持多个命令行参数来自定义其行为。

| 参数 | 描述 | 默认值 |
| :--- | :--- | :--- |
| `--interactive` | 启用交互式聊天模式。 | 禁用（一次性） |
| `--model <provider[:model]>` | 指定 AI 模型。格式：`'provider[:model]'`。 | `openai` |
| `--temperature <value>` | 设置模型的生成温度。 | 提供商默认值 |
| `--top-p <value>` | 设置模型的 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>`| 设置模型的存在惩罚。 | 提供商默认值 |
| `--frequency-penalty <value>`| 设置模型的频率惩罚。 | 提供商默认值 |
| `--log-level <level>` | 设置日志记录的详细程度（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入。 | `None` |

## 代码示例

以下 TypeScript 代码演示了设置和调用 AI agent 与 SQLite 数据库交互的核心逻辑。

该脚本初始化一个 `OpenAIChatModel`，启动一个连接到 SQLite 服务器的 `MCPAgent`，并使用该模型和 agent 的技能配置一个 `AIGNE` 实例。最后，它调用一个带有特定指令的 `AIAgent` 来执行数据库任务。

```typescript title="index.ts" icon=logos:typescript-icon
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 1. 初始化聊天模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 将 SQLite MCP 服务器作为托管子进程启动
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"),
  ],
});

// 3. 使用模型和 MCP 技能配置 AIGNE 实例
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 4. 定义具有特定指令的 AI agent
const agent = AIAgent.from({
  instructions: "你是一名数据库管理员",
});

// 5. 调用 agent 创建一个表
console.log(
  await aigne.invoke(
    agent,
    "create a product table with columns name description and createdAt",
  ),
);
// 预期输出：
// {
//   $message: "产品表已成功创建，包含列：`name`、`description` 和 `createdAt`。",
// }

// 6. 调用 agent 插入数据
console.log(await aigne.invoke(agent, "create 10 products for test"));
// 预期输出：
// {
//   $message: "我已成功在数据库中创建了 10 个测试产品...",
// }

// 7. 调用 agent 查询数据
console.log(await aigne.invoke(agent, "how many products?"));
// 预期输出：
// {
//   $message: "数据库中有 10 个产品。",
// }

// 8. 关闭 AIGNE 实例和 MCP 服务器
await aigne.shutdown();
```

## 调试

要监控和分析 agent 的执行流程，您可以使用 `aigne observe` 命令。此工具会启动一个本地 Web 服务器，提供对跟踪、工具调用和模型交互的详细视图，这对于调试和性能分析非常有价值。

1.  **启动观察服务器：**

    ```bash title="启动可观察性服务器" icon=lucide:terminal
    aigne observe
    ```

    ![显示 aigne observe 命令已启动服务器的终端输出。](../../../examples/images/aigne-observe-execute.png)

2.  **查看跟踪：**

    在您的网络浏览器中打开提供的 URL（例如 `http://localhost:7893`）以访问可观察性界面。“Traces” 页面列出了最近的 agent 执行情况。

    ![AIGNE 可观察性界面，显示 agent 执行跟踪列表。](../../../examples/images/aigne-observe-list.png)

    在这里，您可以选择单个跟踪来检查完整的操作序列，包括发送到模型的提示、agent 调用的技能以及最终输出。
