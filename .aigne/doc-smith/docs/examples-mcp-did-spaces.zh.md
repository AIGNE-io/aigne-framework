# MCP DID Spaces

本指南演示如何通过模型上下文协议 (MCP) 构建一个与 DID Spaces 集成的聊天机器人。通过遵循这些步骤，您将创建一个能够与去中心化存储交互的 Agent，使用预定义的技能执行读取、写入和列出文件等操作。

## 概述

本示例展示了 AIGNE 框架如何通过模型上下文协议 (MCP) 与 DID Spaces 服务集成。主要目标是为聊天机器人 Agent 配备一套技能，使其能够在用户的 DID Space 内执行文件和数据操作。这提供了一个实际的演示，说明 Agent 如何安全地与外部的去中心化服务进行交互。

下图说明了聊天机器人 Agent、MCP 服务器和 DID Space 之间的交互：

```d2
direction: down

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  MCPAgent: {
    label: "聊天机器人 Agent\n(MCPAgent)"
  }
}

MCP-Server: {
  label: "MCP 服务器"
  shape: rectangle
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

AIGNE-Framework.MCPAgent -> MCP-Server: "1. 连接并发现技能"
MCP-Server -> AIGNE-Framework.MCPAgent: "2. 提供技能（例如，list_objects, write_object）"
AIGNE-Framework.MCPAgent -> MCP-Server: "3. 执行技能（例如，写入 'report.md'）"
MCP-Server -> DID-Spaces: "4. 执行文件操作"
DID-Spaces -> MCP-Server: "5. 返回结果"
MCP-Server -> AIGNE-Framework.MCPAgent: "6. 将结果发送给 Agent"
```

演示的关键功能包括：
- 连接到 DID Spaces MCP 服务器。
- 动态加载可用技能（例如，`list_objects`、`write_object`）。
- 执行基本的文件操作，如检查元数据、列出对象和写入新文件。
- 将结果保存为 Markdown 报告。

## 前置要求

在开始之前，请确保您已安装并配置好以下内容：

*   **Node.js**：20.0 或更高版本。
*   **AI 模型提供商 API 密钥**：需要一个来自 OpenAI 等提供商的 API 密钥。
*   **DID Spaces MCP 服务器凭证**：您将需要 DID Spaces 实例的 URL 和授权密钥。

以下依赖项是可选的，仅在您打算从克隆的源代码运行示例时才需要：

*   **pnpm**：用于包管理。
*   **Bun**：用于运行测试和示例。

## 快速入门

您可以使用 `npx` 直接运行此示例，无需本地安装。

### 1. 设置环境变量

首先，您需要配置 DID Spaces 服务器的凭证。打开您的终端并导出以下环境变量。

要获取您的 `DID_SPACES_AUTHORIZATION` 密钥：
1.  导航到您的 Blocklet。
2.  前往 **个人资料 -> 设置 -> 访问密钥**。
3.  点击 **创建** 并将 **认证类型** 设置为“简单”。
4.  复制生成的密钥。

```bash 设置环境变量 icon=lucide:terminal
# 替换为您的 DID Spaces URL
export DID_SPACES_URL="https://spaces.staging.arcblock.io/app"

# 替换为您生成的访问密钥
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. 连接到 AI 模型

该 Agent 需要连接到大语言模型 (LLM) 才能运行。当您首次运行该示例时，系统将提示您通过几个选项连接到 AI 模型。

#### 选项 A：通过 AIGNE Hub 连接（推荐）

您可以选择通过官方的 AIGNE Hub 进行连接。您的浏览器将打开一个页面来指导您完成该过程。新用户会获得免费的 token 分配以开始使用。或者，如果您有自托管的 AIGNE Hub 实例，您可以选择该选项并输入其 URL。

#### 选项 B：通过第三方提供商连接

您可以通过环境变量直接配置来自第三方提供商（如 OpenAI）的 API 密钥。

```bash 配置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="sk-..." # 在此处设置您的 OpenAI API 密钥
```

有关配置不同模型提供商（例如 DeepSeek、Google Gemini）的更多示例，请参阅源代码中的 `.env.local.example` 文件。

### 3. 运行示例

配置好环境后，运行以下命令启动聊天机器人：

```bash 运行示例 icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

该脚本将执行以下步骤：
1.  测试与 MCP DID Spaces 服务器的连接。
2.  执行三个操作：检查元数据、列出对象和写入文件。
3.  在控制台中显示结果。
4.  将完整的 Markdown 报告保存到本地文件系统，并显示文件路径。

## 工作原理

本示例利用 `MCPAgent` 连接到 DID Spaces 服务器。模型上下文协议 (MCP) 充当标准化接口，允许 Agent 发现并利用服务器提供的技能。

-   **动态技能加载**：`MCPAgent` 查询 MCP 服务器并动态加载所有可用技能。这意味着您无需在代码中预先定义 Agent 的能力。
-   **安全身份验证**：与 DID Spaces 的连接使用提供的授权凭证进行保护。
-   **实时交互**：Agent 与 DID Spaces 进行实时交互以执行操作。

可用的技能通常包括：

| 技能 | 描述 |
| :--- | :--- |
| `head_space` | 获取有关 DID Space 的元数据。 |
| `read_object` | 从 DID Space 中的对象读取内容。 |
| `write_object` | 将内容写入 DID Space 中的对象。 |
| `list_objects` | 列出 DID Space 中目录内的对象。 |
| `delete_object` | 从 DID Space 中删除对象。 |

## 配置

在生产环境中，您通常会托管自己的 DID Spaces MCP 服务器。`MCPAgent` 可以配置为指向您的自定义端点并使用您的特定身份验证令牌。

以下代码片段展示了如何使用自定义参数初始化 `MCPAgent`：

```typescript MCPAgent 初始化
import { MCPAgent } from '@aigne/mcp-agent';

const mcpAgent = await MCPAgent.from({
  url: 'YOUR_MCP_SERVER_URL',
  transport: 'streamableHttp',
  opts: {
    requestInit: {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    },
  },
});
```

## 从源代码运行

如果您希望从仓库的本地克隆运行示例，请按照以下步骤操作。

### 1. 克隆仓库

```bash 克隆仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖

导航到示例目录并使用 `pnpm` 安装必要的包。

```bash 安装依赖 icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. 运行示例

使用 `pnpm start` 命令启动应用程序。

```bash 运行示例 icon=lucide:terminal
pnpm start
```

## 测试与调试

### 运行测试

要验证集成是否正常工作，您可以运行测试套件。测试将连接到 MCP 服务器，列出可用技能，并执行基本的 DID Spaces 操作。

```bash 运行测试套件 icon=lucide:terminal
pnpm test:llm
```

### 观察 Agent 行为

`aigne observe` 命令会启动一个本地 Web 服务器，用于监控和分析 Agent 的执行数据。这个工具对于调试、性能调优以及理解您的 Agent 如何与模型和工具交互至关重要。它提供了一个用户友好的界面来检查追踪信息并查看详细的调用信息。

```bash 启动观察服务器 icon=lucide:terminal
aigne observe
```

## 总结

本示例提供了一个使用模型上下文协议将 AIGNE Agent 与 DID Spaces 等外部服务集成的实用指南。您已经学习了如何配置、运行和测试一个能够执行去中心化存储操作的 Agent。

有关相关概念的更多信息，请参阅以下文档：

<x-cards data-columns="2">
  <x-card data-title="MCP Agent" data-href="/developer-guide/agents/mcp-agent" data-icon="lucide:box">了解更多关于 MCPAgent 以及它如何与外部服务交互的信息。</x-card>
  <x-card data-title="DID Spaces Memory" data-href="/examples/memory-did-spaces" data-icon="lucide:database">查看一个使用 DID Spaces 实现持久化 Agent 内存的示例。</x-card>
</x-cards>