# MCP SQLite

本指南全面介绍了如何使用 AIGNE 框架和模型上下文协议（MCP）与 SQLite 数据库进行交互。通过本示例，您将学习如何设置一个可以通过自然语言命令执行数据库操作（例如创建表、插入数据和查询记录）的 Agent。

## 概述

MCP SQLite 示例演示了如何通过 MCP 服务器将 AI Agent 连接到外部 SQLite 数据库。这使得 Agent 能够利用一组预定义的技能进行数据库管理，包括创建、读取和写入数据。Agent 解释用户请求，将其转换为适当的数据库命令，并通过 SQLite MCP 服务器执行这些命令。

基本工作流程如下：
1.  用户提供一个自然语言命令（例如，“创建一个产品表”）。
2.  `AIAgent` 处理该命令。
3.  Agent 从连接到 SQLite 服务器的 `MCPAgent` 中识别出适当的技能（例如，`create_table`）。
4.  `MCPAgent` 在数据库上执行相应的 SQL 命令。
5.  结果返回给 Agent，然后 Agent 为用户构建响应。

下图说明了此工作流程：

```d2
direction: down

User: {
  shape: c4-person
}

AIAgent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCP Agent \n(SQLite 技能)"
  shape: rectangle
}

SQLite-DB: {
  label: "SQLite 数据库"
  shape: cylinder
}

User -> AIAgent: "1. 自然语言命令\n(例如, '创建一个表')"
AIAgent -> MCPAgent: "2. 选择并调用技能\n(例如, create_table)"
MCPAgent -> SQLite-DB: "3. 执行 SQL 命令"
SQLite-DB -> MCPAgent: "4. 返回结果"
MCPAgent -> AIAgent: "5. 转发结果"
AIAgent -> User: "6. 构建并发送响应"

```

## 前提条件

在继续之前，请确保您的开发环境满足以下要求：

*   **Node.js**: 版本 20.0 或更高。
*   **npm**: 随 Node.js 一起提供。
*   **uv**: 一个 Python 虚拟环境和包安装程序。有关设置说明，请参阅 [uv 安装指南](https://github.com/astral-sh/uv)。
*   **AI 模型 API 密钥**: 来自受支持的提供商（如 OpenAI）的 API 密钥。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需本地安装。这是查看 MCP SQLite 集成实际效果的最快方法。

### 运行示例

在您的终端中执行以下命令。该示例支持用于单个命令的单次模式和交互式聊天模式。

1.  **单次模式（默认）**
    此模式接受单个命令，执行后退出。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-sqlite --input "create a product table with columns name, description, and createdAt"
    ```

2.  **管道输入**
    您也可以将输入直接通过管道传递给命令。

    ```bash icon=lucide:terminal
    echo "how many products are in the table?" | npx -y @aigne/example-mcp-sqlite
    ```

3.  **交互式聊天模式**
    要获得对话式体验，请使用 `--chat` 标志。

    ```bash icon=lucide:terminal
    npx -y @aigne/example-mcp-sqlite --chat
    ```

### 连接到 AI 模型

为了执行命令，Agent 需要连接到一个大型语言模型。您有多种选择。

*   **AIGNE Hub（推荐）**: 首次运行示例时，系统将提示您通过官方 AIGNE Hub 进行连接。这是最简单的方法，并为新用户提供免费的令牌以供入门。
*   **自托管 AIGNE Hub**: 如果您有自己的 AIGNE Hub 实例，可以通过提供其 URL 来连接。
*   **第三方模型提供商**: 您可以通过设置所需 API 密钥作为环境变量来直接连接到像 OpenAI 这样的模型提供商。

例如，要使用 OpenAI，请导出您的 API 密钥：

```bash title="设置 OpenAI API 密钥" icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

有关配置不同模型提供商的更多示例，请参阅源存储库中的 `.env.local.example` 文件。

## 从源代码安装

对于开发或自定义，您可以克隆存储库并在本地运行该示例。

1.  **克隆存储库**

    ```bash icon=lucide:terminal
    git clone https://github.com/AIGNE-io/aigne-framework
    ```

2.  **安装依赖项**
    导航到示例目录并使用 `pnpm` 安装必要的软件包。

    ```bash icon=lucide:terminal
    cd aigne-framework/examples/mcp-sqlite
    pnpm install
    ```

3.  **运行示例**
    使用 `pnpm start` 命令执行脚本。

    ```bash icon=lucide:terminal
    # 以单次模式运行
    pnpm start -- --input "create 10 products for test"

    # 以交互式聊天模式运行
    pnpm start -- --chat
    ```

## 命令行选项

该脚本接受多个命令行参数以自定义其行为。

| 参数 | 描述 | 默认值 |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| `--chat` | 以交互式聊天模式运行。 | 已禁用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 设置模型生成的温度值。 | 提供商默认值 |
| `--top-p <value>` | 设置 top-p 采样值。 | 提供商默认值 |
| `--presence-penalty <value>` | 设置存在惩罚值。 | 提供商默认值 |
| `--frequency-penalty <value>`| 设置频率惩罚值。 | 提供商默认值 |
| `--log-level <level>` | 设置日志级别（`ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`）。 | `INFO` |
| `--input`, `-i <input>` | 直接以参数形式提供输入。 | 无 |

## 代码实现

核心逻辑包括初始化 AI 模型、设置 `MCPAgent` 以连接到 SQLite 服务器，然后创建一个使用该 Agent 及其技能的 `AIGNE` 实例。

以下示例演示了创建表、插入记录和查询数据库的完整过程。

```typescript index.ts
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// 确保您的环境变量中设置了 OpenAI API 密钥
const { OPENAI_API_KEY } = process.env;

// 1. 初始化 AI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 2. 创建一个 MCPAgent 来管理 SQLite 服务器进程
const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"), // 指定数据库文件路径
  ],
});

// 3. 使用模型和 SQLite 技能实例化 AIGNE
const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

// 4. 使用具体指令定义 AI Agent
const agent = AIAgent.from({
  instructions: "你是一个数据库管理员",
});

// 5. 调用 Agent 执行数据库操作
console.log(
  "正在创建表...",
  await aigne.invoke(
    agent,
    "create a product table with columns name, description, and createdAt",
  ),
);
// 预期输出:
// {
//   $message: "产品表已成功创建，包含以下列：`name`、`description` 和 `createdAt`。",
// }

console.log(
  "正在插入测试数据...",
  await aigne.invoke(agent, "create 10 products for test"),
);
// 预期输出:
// {
//   $message: "我已成功在数据库中创建了 10 个测试产品...",
// }

console.log(
  "正在查询数据...",
  await aigne.invoke(agent, "how many products?"),
);
// 预期输出:
// {
//   $message: "数据库中有 10 个产品。",
// }

// 6. 关闭 AIGNE 实例以终止 MCP 服务器
await aigne.shutdown();
```

该脚本自动化了整个生命周期：它启动 MCP 服务器，配置一个 AI Agent 来使用它，根据自然语言执行一系列数据库任务，并干净地关闭。

## 调试

要监控和分析 Agent 的行为，您可以使用 `aigne observe` 命令。该工具会启动一个本地 Web 服务器，提供 Agent 执行跟踪的详细视图，包括与模型和工具的交互。这对于调试和理解信息流非常有价值。

```bash icon=lucide:terminal
aigne observe
```

运行此命令后，您可以在浏览器中打开提供的 URL 以检查最近的 Agent 调用。

## 总结

本示例展示了将 AIGNE 框架与模型上下文协议相结合的强大功能，可以创建能够与数据库等外部系统交互的 Agent。通过将数据库操作抽象为技能，开发人员可以轻松地构建复杂的、由语言驱动的应用程序。

有关更高级的用例和其他示例，请参阅以下文档：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-icon="lucide:box" data-href="/developer-guide/agents/mcp-agent">
    了解更多关于如何通过模型上下文协议连接到外部系统的信息。
  </x-card>
  <x-card data-title="AI Agent" data-icon="lucide:bot" data-href="/developer-guide/agents/ai-agent">
    探索用于与语言模型交互和使用工具的主要 Agent。
  </x-card>
</x-cards>