I have located the necessary files for the "AFS System FS" example documentation. The primary source will be `/sources/examples/afs-system-fs/README.md`, which will provide the structure, code snippets, and conceptual explanations. The core logic example will be drawn from `/sources/examples/afs-system-fs/index.ts`. I've noted the available image, `/sources/examples/afs-system-fs/run-example.png`, and will address the user's feedback regarding invalid image paths by verifying correct locations or substituting with valid images. My next step is to analyze the `README.md` to begin drafting the document.# AFS System FS

您是否曾经想过构建一个可以直接且安全地与本地文件交互的聊天机器人？本指南将演示如何实现这一点。您将学习如何使用 AIGNE 文件系统（AFS）和 `SystemFS` 模块，授予 AI Agent 沙盒化的访问权限来读取、写入和搜索您机器上的文件，从而实现能够处理本地数据的强大、具备上下文感知能力的应用程序。

## 概述

本示例的核心是 `SystemFS` 模块，它充当了 AIGNE 框架与您计算机文件系统之间的桥梁。它允许您“挂载”一个本地目录，使其内容可以通过一套标准工具（如 `afs_list`、`afs_read`、`afs_write` 和 `afs_search`）供 AI Agent 访问。然后，Agent 可以使用这些工具根据自然语言命令执行文件操作。这使得诸如总结文档、整理文件或回答有关代码库的问题等用例成为可能。

下图说明了用户、AI Agent、AFS 工具和本地文件系统之间的关系：

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle
  style: {
    stroke: "#888"
    stroke-width: 2
    stroke-dash: 4
  }

  AI-Agent: {
    label: "AI Agent"
    shape: rectangle
  }

  AFS-Tools: {
    label: "AFS 工具"
    shape: rectangle
    grid-columns: 2
    afs_list: { label: "afs_list" }
    afs_read: { label: "afs_read" }
    afs_write: { label: "afs_write" }
    afs_search: { label: "afs_search" }
  }

  SystemFS-Module: {
    label: "SystemFS 模块"
    shape: rectangle
  }
}

Local-File-System: {
  label: "本地文件系统\n（沙盒化）"
  shape: cylinder
}

User -> AIGNE-Framework.AI-Agent: "自然语言命令"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS-Tools: "选择合适的工具"
AIGNE-Framework.AFS-Tools -> AIGNE-Framework.SystemFS-Module: "调用工具操作"
AIGNE-Framework.SystemFS-Module -> Local-File-System: "执行文件 I/O"
Local-File-System -> AIGNE-Framework.SystemFS-Module: "返回文件内容/状态"
AIGNE-Framework.SystemFS-Module -> AIGNE-Framework.AI-Agent: "返回工具结果"
AIGNE-Framework.AI-Agent -> User: "上下文相关的响应"

```

## 前置要求

在开始之前，请确保您的系统满足以下要求：

*   **Node.js**：20.0 或更高版本。
*   **npm**：随 Node.js 一同安装。
*   **OpenAI API 密钥**：需要一个有效的 API 密钥，以便 AI Agent 连接到 OpenAI 的模型。您可以从 [OpenAI Platform](https://platform.openai.com/api-keys) 获取密钥。

如果您计划从源代码运行此示例，还建议满足以下条件：

*   **pnpm**：用于高效的包管理。
*   **Bun**：用于运行示例和单元测试。

## 快速开始

您可以使用 `npx` 直接从终端运行此示例，无需克隆完整的代码仓库。这是查看其运行效果的最快方法。

### 运行示例

打开您的终端并选择以下命令之一。

要挂载当前目录并启动交互式聊天会话：

```bash 在聊天模式下运行 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

要使用自定义名称和描述挂载特定目录：

```bash 挂载特定目录 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path ~/Documents --mount /docs --description "My Documents" --chat
```

要提出单个问题而不启动交互式聊天：

```bash 提出单个问题 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "What files are in the current directory?"
```

### 连接到 AI 模型

首次运行该示例时，系统将提示您连接到一个 AI 模型。

![连接到 AI 模型](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/connect-to-aigne-hub.png)

您有三个主要选项：

1.  **通过官方 AIGNE Hub 连接**：这是推荐的选项。您的浏览器将打开官方的 AIGNE Hub，您可以在那里登录。新用户会获得免费的 token 配额以供入门。
2.  **通过自托管的 AIGNE Hub 连接**：如果您运行自己的 AIGNE Hub 实例，请选择此选项并输入其 URL。
3.  **通过第三方模型提供商连接**：您可以通过设置包含 API 密钥的环境变量，直接连接到像 OpenAI 这样的提供商。

要连接到 OpenAI，请在您的终端中设置 `OPENAI_API_KEY` 环境变量：

```bash 设置 OpenAI API 密钥 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

设置密钥后，再次运行 `npx` 命令。有关支持的提供商及其所需环境变量的完整列表，请参阅示例的 `.env.local.example` 文件。

## 从源代码安装

如果您希望查看源代码或进行修改，请按照以下步骤在本地运行该示例。

### 1. 克隆代码仓库

```bash 克隆代码仓库 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安装依赖项

导航到示例的目录，并使用 `pnpm` 安装必要的软件包。

```bash 安装依赖项 icon=lucide:terminal
cd aigne-framework/examples/afs-system-fs
pnpm install
```

### 3. 运行示例

使用所需的标志执行 `pnpm start` 命令。

要挂载当前目录并运行：

```bash 使用当前目录运行 icon=lucide:terminal
pnpm start --path .
```

要在交互式聊天模式下运行：

```bash 在聊天模式下运行 icon=lucide:terminal
pnpm start --path . --chat
```

## 工作原理

此示例初始化一个 `AIAgent`，并使用 `SystemFS` 模块授予其访问本地文件系统的权限。

### 挂载本地目录

`SystemFS` 类用于将本地 `path` 挂载到 AFS 内的虚拟 `mount` 点。此配置被传递给一个新的 `AFS` 实例，然后该实例被附加到 `AIAgent`。Agent 被指示使用已挂载的文件系统来回答用户的查询。

```typescript index.ts icon=logos:typescript
import { AFS } from "@aigne/afs";
import { SystemFS } from "@aigne/afs-system-fs";
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  name: "afs-system-fs-chatbot",
  instructions:
    "You are a friendly chatbot that can retrieve files from a virtual file system. You should use the provided functions to list, search, and read files as needed to answer user questions. The current folder points to the /fs mount point by default.",
  inputKey: "message",
  afs: new AFS().use(
    new SystemFS({
      mount: '/fs',
      path: './',
      description: 'Mounted file system'
    }),
  ),
  afsConfig: {
    injectHistory: true,
  },
});
```

### Agent 交互流程

当用户提问时，AI Agent 会自主决定使用哪些 AFS 工具来寻找答案。

1.  **用户输入**：用户提出一个问题，例如“这个项目的目的是什么？”
2.  **工具调用（列出）**：Agent 判断需要了解文件结构，并调用 `afs_list` 工具来查看根目录中的文件。
3.  **工具调用（读取）**：在识别出相关文件（如 `README.md`）后，Agent 调用 `afs_read` 工具来访问其内容。
4.  **上下文相关的响应**：文件的内容被添加到 Agent 的上下文中。然后，Agent 利用这些新信息为用户的原始问题构建一个详细的答案。

这整个过程是自主的。Agent 会链接工具调用、收集上下文并制定响应，无需人工指导。

## 用法示例

聊天机器人运行后，您可以发出各种命令与挂载的文件进行交互。

### 基本文件操作

```bash 列出所有文件 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "List all files in the root directory"
```

```bash 读取特定文件 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Read the contents of package.json"
```

```bash 搜索内容 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --input "Find all files containing the word 'example'"
```

### 交互式聊天

要获得更具对话性的体验，请启动交互模式。

```bash 启动交互式聊天 icon=lucide:terminal
npx -y @aigne/example-afs-system-fs --path . --chat
```

进入聊天后，可以尝试提出以下问题：

*   “这个目录里有哪些文件？”
*   “给我看看 README 文件的内容。”
*   “查找所有 TypeScript 文件。”
*   “创建一个名为 `notes.txt` 的新文件，内容为‘完成项目文档’。”
*   “以深度限制为 2 递归列出所有文件。”

## 调试

AIGNE CLI 包含一个 `observe` 命令，可帮助您分析和调试 Agent 的行为。它会启动一个本地 Web 服务器，提供一个界面来检查执行跟踪，包括工具调用、模型输入和最终输出。

首先，在您的终端中启动观察服务器：

```bash 启动观察服务器 icon=lucide:terminal
aigne observe
```

![启动 AIGNE 观察服务器](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-execute.png)

运行 Agent 任务后，您可以打开 Web 界面，查看最近执行的列表，并深入了解每个步骤的详细信息。

![查看最近执行的列表](https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/examples/images/aigne-observe-list.png)

## 总结

本示例提供了一个实用的指南，用于将 AI Agent 的能力扩展到您的本地文件系统。通过使用 `SystemFS`，您可以构建与用户本地数据和环境深度集成的复杂应用程序。

有关更多示例和高级功能，请参阅以下文档：

<x-cards data-columns="2">
  <x-card data-title="Memory" data-icon="lucide:brain-circuit" data-href="/examples/memory">
  了解如何使用 FSMemory 插件创建一个具有持久记忆的聊天机器人。
  </x-card>
  <x-card data-title="MCP Server" data-icon="lucide:server" data-href="/examples/mcp-server">
  了解如何将 AIGNE Agent 作为模型上下文协议（MCP）服务器运行。
  </x-card>
</x-cards>